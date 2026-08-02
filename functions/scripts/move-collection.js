#!/usr/bin/env node
/**
 * ينقل مجموعة كاملة من متجر إلى آخر داخل نفس Firestore:
 *
 *   stores/{from}/{collection}/{id}  ->  stores/{to}/{collection}/{id}
 *
 * المعرّفات محفوظة. النسخ يتم أولاً بالكامل، ثم يُتحقق من العدد في الوجهة،
 * ولا يُحذف من المصدر إلا بعد نجاح التحقق — حتى لا تضيع بيانات في المنتصف.
 *
 * الوضع كلمة موضعية (لا علم): plan | apply | copy — والافتراضي plan.
 * السبب: npm يبتلع الأعلام `--foo` حتى بعد `--`، فلو كان الحذف هو الافتراضي
 * لأدى علم مبتلَع إلى فقدان بيانات.
 *
 *   npm run store:move -- <from> <to> [collection]        معاينة (افتراضي)
 *   npm run store:move -- <from> <to> [collection] apply  نسخ ثم حذف من المصدر
 *   npm run store:move -- <from> <to> [collection] copy   نسخ بلا حذف
 *
 * أمثلة:
 *   npm run store:move -- leapsmart techma products
 *   npm run store:move -- leapsmart techma products apply
 *
 * المصادقة: GOOGLE_APPLICATION_CREDENTIALS أو `gcloud auth application-default login`.
 */

const admin = require("firebase-admin");

// npm يبتلع أي علم `--foo` حتى بعد `--`، فلا يصل إلى السكربت. لذلك الوضع
// يُمرَّر ككلمة موضعية لا كعلم، والافتراضي آمن: معاينة فقط. علم مبتلَع =
// لا شيء يحدث، بدل حذف غير مقصود.
const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith("--"));
const [fromStore, toStore, collection = "products", mode = "plan"] = positional;

if (!["plan", "apply", "copy"].includes(mode)) {
  console.error(`وضع غير معروف: "${mode}". استخدم plan أو apply أو copy.`);
  process.exit(1);
}
const plan = mode === "plan";
const copyOnly = mode === "copy";

const SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/;
const BATCH_LIMIT = 400;

if (!fromStore || !toStore || !SLUG.test(fromStore) || !SLUG.test(toStore)) {
  console.error(
    "Usage: node move-collection.js <fromStoreId> <toStoreId> [collection] [--plan] [--copy-only]",
  );
  process.exit(1);
}
if (fromStore === toStore) {
  console.error("المصدر والوجهة نفس المتجر — لا شيء لفعله.");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID,
});

const db = admin.firestore();

async function commitInBatches(items, apply) {
  let batch = db.batch();
  let pending = 0;
  for (const item of items) {
    apply(batch, item);
    pending++;
    if (pending >= BATCH_LIMIT) {
      await batch.commit();
      batch = db.batch();
      pending = 0;
    }
  }
  if (pending > 0) await batch.commit();
}

async function main() {
  for (const s of [fromStore, toStore]) {
    if (!(await db.doc(`stores/${s}`).get()).exists) {
      console.error(`المتجر stores/${s} غير موجود.`);
      process.exit(1);
    }
  }

  const srcRef = db.collection(`stores/${fromStore}/${collection}`);
  const snap = await srcRef.get();

  if (snap.empty) {
    console.log(`stores/${fromStore}/${collection} فارغة — لا شيء لنقله.`);
    return;
  }

  console.log(
    `\n${plan ? "[معاينة — بلا كتابة]" : "[تنفيذ فعلي]"} ` +
      `${collection}: stores/${fromStore} -> stores/${toStore}`,
  );
  console.log(`  عدد المستندات في المصدر: ${snap.size}`);

  if (plan) {
    for (const d of snap.docs) {
      const label = d.data().name || d.data().title || "";
      console.log(`   - ${d.id}  ${String(label).slice(0, 60)}`);
    }
    console.log(
      `\nمعاينة فقط. أضف الكلمة apply في آخر الأمر للنقل الفعلي — ` +
        `سيُحذف ${snap.size} مستنداً من المصدر بعد نجاح النسخ والتحقق.\n`,
    );
    return;
  }

  // 1) النسخ
  await commitInBatches(snap.docs, (batch, d) => {
    batch.set(db.doc(`stores/${toStore}/${collection}/${d.id}`), d.data());
  });
  console.log(`  نُسخ ${snap.size} مستنداً إلى stores/${toStore}/${collection}`);

  // 2) التحقق قبل أي حذف — نتأكد أن كل معرّف وصل فعلاً
  const missing = [];
  for (const d of snap.docs) {
    const target = await db
      .doc(`stores/${toStore}/${collection}/${d.id}`)
      .get();
    if (!target.exists) missing.push(d.id);
  }
  if (missing.length > 0) {
    console.error(
      `\nتوقفت: ${missing.length} مستنداً لم يصل إلى الوجهة. لم أحذف شيئاً.\n` +
        missing.slice(0, 10).join(", "),
    );
    process.exit(1);
  }
  console.log(`  تحقق: كل الـ ${snap.size} مستنداً موجودة في الوجهة`);

  if (copyOnly) {
    console.log(`\n--copy-only: المصدر لم يُمس. تم.\n`);
    return;
  }

  // 3) الحذف من المصدر
  await commitInBatches(snap.docs, (batch, d) => {
    batch.delete(d.ref);
  });
  console.log(`  حُذف ${snap.size} مستنداً من stores/${fromStore}/${collection}`);

  console.log(
    `\nتم. stores/${fromStore}/${collection} صارت فارغة الآن.\n` +
      `للتراجع: npm run store:move -- ${toStore} ${fromStore} ${collection}\n`,
  );
}

main().catch((err) => {
  console.error("\nفشل النقل:", err);
  process.exit(1);
});
