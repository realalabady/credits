#!/usr/bin/env node
/**
 * ينشئ متجراً جديداً داخل نفس قاعدة Firestore:
 *
 *   stores/{storeId}                  { name, domain, active, createdAt }
 *   stores/{storeId}/settings/store   { store: { storeName, baseUrl, ... } }
 *   stores/{storeId}/users/{adminUid} { role: 'admin' }   (اختياري)
 *
 * المتجر الجديد يبدأ فارغاً تماماً: لا منتجات ولا طلبات ولا عملاء من متجر آخر.
 *
 * الاستخدام:
 *   node functions/scripts/create-store.js <storeId> "<اسم المتجر>" [adminUid] [baseUrl]
 *
 * مثال:
 *   node functions/scripts/create-store.js techma "تكما" AbC123uid https://techma.sa
 *
 * adminUid هو معرّف المستخدم من Firebase Auth (Authentication -> Users).
 * حساب Auth مشترك بين كل المتاجر، لكن الدور هنا يخص هذا المتجر وحده.
 *
 * بعد التنفيذ: اضبط VITE_STORE_ID=<storeId> في بيئة نشر هذا المتجر.
 *
 * المصادقة: عيّن GOOGLE_APPLICATION_CREDENTIALS إلى ملف مفتاح حساب الخدمة،
 * أو نفّذ `gcloud auth application-default login` أولاً.
 */

const admin = require("firebase-admin");

const [storeId, storeName, adminUid, baseUrl] = process.argv.slice(2);

if (!storeId || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(storeId) || !storeName) {
  console.error(
    'Usage: node create-store.js <storeId> "<Store Name>" [adminUid] [baseUrl]\n' +
      "storeId must be a slug: lowercase letters, digits and dashes.",
  );
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID,
});

const db = admin.firestore();

async function main() {
  const rootRef = db.doc(`stores/${storeId}`);
  if ((await rootRef.get()).exists) {
    console.error(`المتجر stores/${storeId} موجود مسبقاً — أوقفت العملية.`);
    process.exit(1);
  }

  await rootRef.set({
    name: storeName,
    domain: baseUrl || "",
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log(`أُنشئ stores/${storeId}`);

  // settings/store هو المستند العام الوحيد القابل للقراءة من الزوار،
  // ومنه تقرأ الدوال baseUrl واسم المتجر لروابط المنتجات ورسائل البريد.
  await db.doc(`stores/${storeId}/settings/store`).set({
    store: {
      storeName,
      storeEmail: "",
      storePhone: "",
      storeAddress: "",
      currency: "SAR",
      language: "ar",
      baseUrl: baseUrl || "",
    },
    shipping: {
      freeShippingThreshold: 0,
      defaultShippingCost: 0,
      enableFreeShipping: false,
      estimatedDays: "3-5",
    },
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log(`أُنشئ stores/${storeId}/settings/store`);

  if (adminUid) {
    const authUser = await admin
      .auth()
      .getUser(adminUid)
      .catch(() => null);
    if (!authUser) {
      console.error(
        `تحذير: لا يوجد مستخدم بـ uid=${adminUid} في Firebase Auth. ` +
          "أُنشئ مستند الدور على أي حال؛ تأكد من صحة المعرّف.",
      );
    }
    await db.doc(`stores/${storeId}/users/${adminUid}`).set({
      email: authUser ? authUser.email || "" : "",
      name: authUser ? authUser.displayName || "مدير المتجر" : "مدير المتجر",
      phone: "",
      role: "admin",
      addresses: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`عُيّن ${adminUid} كأدمن لهذا المتجر فقط`);
  } else {
    console.log(
      "لم يُحدَّد adminUid — لن يستطيع أحد فتح لوحة التحكم لهذا المتجر بعد.\n" +
        "شغّل السكربت لاحقاً أو أضف المستند يدوياً:\n" +
        `  stores/${storeId}/users/<uid>  ->  { role: "admin" }`,
    );
  }

  console.log(
    `\nتم. اضبط VITE_STORE_ID=${storeId} في بيئة نشر هذا المتجر ثم أعد النشر.\n`,
  );
}

main().catch((err) => {
  console.error("\nفشل الإنشاء:", err);
  process.exit(1);
});
