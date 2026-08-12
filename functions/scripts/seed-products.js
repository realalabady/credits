#!/usr/bin/env node
/**
 * يزرع كتالوجاً في متجر واحد:
 *
 *   stores/{storeId}/products/{autoId}
 *
 * البيانات في functions/scripts/data/<catalogue>.js — عدّلها هناك لا هنا.
 *
 * الاستخدام:
 *   node functions/scripts/seed-products.js <storeId> [plan|apply|replace] [catalogue]
 *
 *   plan     (الافتراضي) لا يكتب شيئاً، يطبع ما سيحدث فقط.
 *   apply    يضيف المنتجات الناقصة ويتخطى ما سبق زرعه (المطابقة بحقل slug).
 *   replace  يحذف كل منتج سبق زرعه بنفس الـ slug ثم يعيد كتابته من جديد.
 *
 *   catalogue: sheep (الافتراضي) = كتالوج الذبائح | cards = بطاقات الهدايا |
 *              social = باقات إدارة حسابات التواصل.
 *   الافتراضي sheep حفاظاً على الاستخدام القائم في leapsmart.
 *
 * الوضع كلمة مجرّدة لا راية (--plan): npm يبتلع الرايات حتى بعد `--`،
 * فتصير راية ضائعة عملية كتابة غير مقصودة. الافتراضي هو الخيار الآمن.
 *
 * المصادقة: عيّن GOOGLE_APPLICATION_CREDENTIALS إلى ملف مفتاح حساب الخدمة،
 * أو نفّذ `gcloud auth application-default login` أولاً.
 */

const admin = require("firebase-admin");

// الكتالوجات المتاحة. الإضافة هنا فقط: ملف بيانات يصدّر { products }.
const CATALOGUES = {
  sheep: "./data/sheep-products",
  cards: "./data/gift-cards",
  social: "./data/social-packages",
};

const [storeId, modeArg, catalogueArg] = process.argv.slice(2);
const mode = modeArg || "plan";
const catalogue = catalogueArg || "sheep";

if (!storeId || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(storeId)) {
  console.error(
    "Usage: node seed-products.js <storeId> [plan|apply|replace] [catalogue]\n" +
      "storeId must be a slug: lowercase letters, digits and dashes.",
  );
  process.exit(1);
}
if (!["plan", "apply", "replace"].includes(mode)) {
  console.error(`وضع غير معروف: ${mode}. المتاح: plan | apply | replace`);
  process.exit(1);
}
if (!CATALOGUES[catalogue]) {
  console.error(
    `كتالوج غير معروف: ${catalogue}. المتاح: ${Object.keys(CATALOGUES).join(" | ")}`,
  );
  process.exit(1);
}

const { products } = require(CATALOGUES[catalogue]);

// معرّف المشروع: من البيئة، وإلا من .env (VITE_FIREBASE_PROJECT_ID) — بدونه
// يفشل Firestore برسالة "Unable to detect a Project Id" غير مفهومة.
function projectIdFromEnvFile() {
  try {
    const env = require("fs").readFileSync(
      require("path").join(__dirname, "../../.env"),
      "utf8",
    );
    return (env.match(/^VITE_FIREBASE_PROJECT_ID=(.+)$/m) || [])[1]?.trim();
  } catch {
    return undefined;
  }
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId:
    process.env.GCLOUD_PROJECT ||
    process.env.FIREBASE_PROJECT_ID ||
    projectIdFromEnvFile(),
});

const db = admin.firestore();
const productsCol = db.collection(`stores/${storeId}/products`);

function assertCatalogSane() {
  const slugs = new Set();
  const images = new Set();
  for (const p of products) {
    if (slugs.has(p.slug)) throw new Error(`slug مكرر: ${p.slug}`);
    slugs.add(p.slug);
    for (const url of p.images) {
      if (images.has(url)) throw new Error(`صورة مكررة بين منتجين: ${url}`);
      images.add(url);
    }
    if (!p.images.length) throw new Error(`منتج بلا صور: ${p.slug}`);
  }
  return { slugs: slugs.size, images: images.size };
}

async function main() {
  const sane = assertCatalogSane();

  const rootSnap = await db.doc(`stores/${storeId}`).get();
  if (!rootSnap.exists) {
    console.error(`المتجر stores/${storeId} غير موجود. أنشئه أولاً بـ store:create.`);
    process.exit(1);
  }

  // المطابقة بالـ slug: هي المعرّف الثابت للمنتج المزروع، بخلاف معرّف المستند.
  const existing = new Map();
  const snap = await productsCol.get();
  snap.forEach((doc) => {
    const slug = doc.data().slug;
    if (slug) existing.set(slug, doc.id);
  });

  const toWrite = products.filter((p) => mode === "replace" || !existing.has(p.slug));
  const skipped = products.length - toWrite.length;

  console.log(`المتجر: stores/${storeId}`);
  console.log(
    `الكتالوج: ${catalogue} — ${sane.slugs} منتجاً، ${sane.images} صورة فريدة`,
  );
  console.log(`موجود مسبقاً (بنفس الـ slug): ${existing.size}`);
  console.log(`سيُكتب: ${toWrite.length} | سيُتخطى: ${skipped}`);
  console.log(
    "الأسعار: " +
      [...new Set(products.map((p) => p.price))].sort((a, b) => a - b).join(" / ") +
      " ريال",
  );

  if (mode === "plan") {
    for (const p of products) {
      const state = existing.has(p.slug) ? "موجود" : "جديد";
      console.log(
        `  [${state}] ${p.price.toString().padStart(4)} ر.س  ${p.slug.padEnd(24)} ${p.name}`,
      );
    }
    console.log("\nوضع plan — لم يُكتب شيء. أعد التنفيذ بـ apply للكتابة.");
    return;
  }

  const batch = db.batch();
  let deleted = 0;
  if (mode === "replace") {
    for (const p of products) {
      const id = existing.get(p.slug);
      if (id) {
        batch.delete(productsCol.doc(id));
        deleted++;
      }
    }
  }

  // createdAt متدرّج: الواجهة ترتّب تنازلياً، وطابع زمني واحد للجميع يعطي
  // ترتيباً عشوائياً. التدرّج يجعل أول عنصر في الملف أول عنصر في المتجر.
  const base = Date.now();
  toWrite.forEach((p, i) => {
    const at = admin.firestore.Timestamp.fromMillis(base - i * 60000);
    batch.set(productsCol.doc(), { ...p, createdAt: at, updatedAt: at });
  });

  await batch.commit();
  console.log(`\nتم: حُذف ${deleted}، كُتب ${toWrite.length}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
