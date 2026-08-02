#!/usr/bin/env node
/**
 * يمنح (أو يسحب) صلاحية الأدمن لمستخدم داخل متجر واحد فقط:
 *
 *   stores/{storeId}/users/{uid}.role = 'admin' | 'customer'
 *
 * الدور خاص بهذا المتجر وحده. حساب Firebase Auth مشترك بين كل المتاجر،
 * لكن كون المستخدم أدمناً في متجر لا يعطيه أي صلاحية في متجر آخر.
 *
 * يُستخدم بعد create-store.js (الذي يرفض التشغيل على متجر موجود)، أو
 * لتعيين أدمن إضافي، أو لسحب الصلاحية.
 *
 * الاستخدام:
 *   node functions/scripts/set-store-admin.js <storeId> <uid> [--revoke]
 *   npm run store:admin -- <storeId> <uid>
 *
 * يمكن تمرير البريد بدل uid:
 *   node functions/scripts/set-store-admin.js techma owner@example.com
 *
 * المصادقة: عيّن GOOGLE_APPLICATION_CREDENTIALS إلى ملف مفتاح حساب الخدمة،
 * أو نفّذ `gcloud auth application-default login` أولاً.
 */

const admin = require("firebase-admin");

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith("--"));
const [storeId, userKey] = positional;
const revoke = args.includes("--revoke");

if (!storeId || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(storeId) || !userKey) {
  console.error(
    "Usage: node set-store-admin.js <storeId> <uid|email> [--revoke]",
  );
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID,
});

const db = admin.firestore();
const role = revoke ? "customer" : "admin";

async function main() {
  const storeSnap = await db.doc(`stores/${storeId}`).get();
  if (!storeSnap.exists) {
    console.error(
      `المتجر stores/${storeId} غير موجود. أنشئه أولاً بـ create-store.js`,
    );
    process.exit(1);
  }

  // اسمح بتمرير البريد بدل المعرّف — أسهل من نسخ uid من وحدة التحكم.
  let authUser = null;
  if (userKey.includes("@")) {
    authUser = await admin
      .auth()
      .getUserByEmail(userKey)
      .catch(() => null);
    if (!authUser) {
      console.error(`لا يوجد مستخدم في Firebase Auth بالبريد ${userKey}`);
      process.exit(1);
    }
  } else {
    authUser = await admin
      .auth()
      .getUser(userKey)
      .catch(() => null);
    if (!authUser) {
      console.error(
        `تحذير: لا يوجد مستخدم في Firebase Auth بـ uid=${userKey}. ` +
          "لن أكتب مستنداً لمعرّف غير موجود.",
      );
      process.exit(1);
    }
  }

  const uid = authUser.uid;
  const ref = db.doc(`stores/${storeId}/users/${uid}`);
  const existing = await ref.get();

  if (existing.exists) {
    await ref.update({ role });
  } else {
    // المستخدم لم يزر هذا المتجر بعد — ننشئ ملفه الشخصي كاملاً.
    await ref.set({
      email: authUser.email || "",
      name: authUser.displayName || "مدير المتجر",
      phone: "",
      role,
      addresses: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  console.log(
    `${revoke ? "سُحبت صلاحية الأدمن من" : "عُيّن كأدمن:"} ${authUser.email || uid}` +
      ` في stores/${storeId} فقط (role=${role}).`,
  );
  console.log("سجّل الخروج ثم الدخول مرة أخرى ليأخذ الدور مفعوله في الواجهة.");
}

main().catch((err) => {
  console.error("\nفشل:", err);
  process.exit(1);
});
