#!/usr/bin/env node
/**
 * ينقل بيانات المتجر الحالية من المجموعات العليا المشتركة إلى شجرة متجر واحد:
 *
 *   products/{id}          ->  stores/{storeId}/products/{id}
 *   categories/{id}        ->  stores/{storeId}/categories/{id}
 *   orders/{id}            ->  stores/{storeId}/orders/{id}
 *   users/{id}             ->  stores/{storeId}/users/{id}
 *   settings/{id}          ->  stores/{storeId}/settings/{id}
 *   contactMessages/{id}   ->  stores/{storeId}/contactMessages/{id}
 *
 * وتبقى pending_payments مجموعة عليا لكن يُضاف لكل مستند حقل storeId.
 *
 * معرّفات المستندات محفوظة كما هي — روابط تأكيد الطلب و pending_payments
 * تشير إلى معرّف الطلب، فتغييره يكسرها.
 *
 * المستندات الأصلية لا تُحذف. احذفها يدوياً بعد التحقق من نجاح النقل.
 *
 * الوضع كلمة موضعية (لا علم): plan | apply | overwrite — والافتراضي plan.
 * السبب: npm يبتلع الأعلام `--foo` حتى بعد `--`.
 *
 *   npm run store:migrate -- <storeId>            معاينة (افتراضي)
 *   npm run store:migrate -- <storeId> apply      نقل، مع تخطي الموجود
 *   npm run store:migrate -- <storeId> overwrite  نقل مع استبدال الموجود
 *
 * المصادقة: عيّن GOOGLE_APPLICATION_CREDENTIALS إلى ملف مفتاح حساب الخدمة،
 * أو نفّذ `gcloud auth application-default login` أولاً.
 */

const admin = require("firebase-admin");

const COLLECTIONS = [
  "products",
  "categories",
  "orders",
  "users",
  "settings",
  "contactMessages",
];

const BATCH_LIMIT = 400; // أقل من حد 500 لترك هامش

// npm يبتلع أي علم `--foo` حتى بعد `--`، فلا يصل إلى السكربت. لذلك الوضع
// كلمة موضعية لا علم، والافتراضي آمن: معاينة فقط.
const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith("--"));
const [storeId, mode = "plan"] = positional;

if (!["plan", "apply", "overwrite"].includes(mode)) {
  console.error(`وضع غير معروف: "${mode}". استخدم plan أو apply أو overwrite.`);
  process.exit(1);
}
const dryRun = mode === "plan";
const overwrite = mode === "overwrite";

if (!storeId || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(storeId)) {
  console.error(
    "Usage: node migrate-to-store.js <storeId> [--dry-run] [--overwrite]\n" +
      "storeId must be a slug: lowercase letters, digits and dashes.",
  );
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID,
});

const db = admin.firestore();

async function migrateCollection(name) {
  const sourceSnap = await db.collection(name).get();
  if (sourceSnap.empty) {
    console.log(`  ${name}: (فارغة) — لا شيء لنقله`);
    return { copied: 0, skipped: 0 };
  }

  let copied = 0;
  let skipped = 0;
  let batch = db.batch();
  let pending = 0;

  for (const doc of sourceSnap.docs) {
    const target = db.doc(`stores/${storeId}/${name}/${doc.id}`);

    if (!overwrite) {
      const existing = await target.get();
      if (existing.exists) {
        skipped++;
        continue;
      }
    }

    if (dryRun) {
      copied++;
      continue;
    }

    batch.set(target, doc.data());
    pending++;
    copied++;

    if (pending >= BATCH_LIMIT) {
      await batch.commit();
      batch = db.batch();
      pending = 0;
    }
  }

  if (!dryRun && pending > 0) await batch.commit();

  console.log(
    `  ${name}: ${copied} ${dryRun ? "ستُنسخ" : "منسوخة"}` +
      (skipped ? `، ${skipped} موجودة مسبقاً (تم تخطيها)` : ""),
  );
  return { copied, skipped };
}

async function backfillPendingPayments() {
  const snap = await db.collection("pending_payments").get();
  if (snap.empty) {
    console.log("  pending_payments: (فارغة)");
    return;
  }

  let updated = 0;
  let batch = db.batch();
  let pending = 0;

  for (const doc of snap.docs) {
    if (doc.data().storeId) continue; // مضبوطة مسبقاً
    if (dryRun) {
      updated++;
      continue;
    }
    batch.update(doc.ref, { storeId });
    pending++;
    updated++;
    if (pending >= BATCH_LIMIT) {
      await batch.commit();
      batch = db.batch();
      pending = 0;
    }
  }

  if (!dryRun && pending > 0) await batch.commit();
  console.log(
    `  pending_payments: ${updated} ${dryRun ? "ستُحدَّث" : "محدَّثة"} بـ storeId=${storeId}`,
  );
}

async function main() {
  console.log(
    `\n${dryRun ? "[تجربة — لا كتابة]" : "[تنفيذ فعلي]"} النقل إلى stores/${storeId}\n`,
  );

  // مستند جذر المتجر — تُنشئه هذه العملية إن لم يكن موجوداً حتى تعمل
  // القواعد ودالة requireStoreId مباشرة بعد النقل.
  const rootRef = db.doc(`stores/${storeId}`);
  const rootSnap = await rootRef.get();
  if (!rootSnap.exists) {
    console.log(`  stores/${storeId}: إنشاء مستند الجذر`);
    if (!dryRun) {
      await rootRef.set({
        name: storeId,
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  } else {
    console.log(`  stores/${storeId}: مستند الجذر موجود`);
  }

  for (const name of COLLECTIONS) {
    await migrateCollection(name);
  }
  await backfillPendingPayments();

  console.log(
    `\nتم${dryRun ? " (تجربة فقط)" : ""}. المستندات الأصلية لم تُحذف — ` +
      "تحقق من النتيجة في وحدة تحكم Firebase ثم احذفها يدوياً.\n",
  );
}

main().catch((err) => {
  console.error("\nفشل النقل:", err);
  process.exit(1);
});
