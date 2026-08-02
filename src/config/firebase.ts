// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// تحذير مبكر وواضح إذا لم تُضبط متغيرات البيئة (مثلاً على Vercel).
// بدون projectId يفشل Firebase عند الإقلاع وتظهر صفحة بيضاء.
if (!firebaseConfig.projectId) {
  console.error(
    "[Firebase] متغيرات البيئة غير مضبوطة. تأكد من إضافة متغيرات " +
      "VITE_FIREBASE_* في إعدادات Vercel (Environment Variables) ثم أعد النشر.",
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Analytics اختياري: نهيّئه فقط عند دعمه ووجود measurementId، وبشكل غير
// حاجب حتى لا يتسبب فشله (أو حظره بمانع إعلانات) في تعطيل التطبيق بالكامل.
export let analytics: Analytics | null = null;
if (typeof window !== "undefined" && firebaseConfig.measurementId) {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      /* تجاهل: Analytics غير متاح */
    });
}

export default app;
