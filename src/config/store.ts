import { collection, doc } from "firebase/firestore";
import { db } from "./firebase";

// ==================== هوية المتجر (Multi-tenant) ====================
// عدة متاجر تتشارك نفس مشروع Firebase وقاعدة Firestore، لكن كل متجر يملك
// شجرة مستندات خاصة به تحت stores/{storeId}. لا يقرأ متجر بيانات متجر آخر.
//
// كل عملية نشر (Vercel) تضبط VITE_STORE_ID الخاص بها: otaibi, leapsmart, techma ...

// قيمة بديلة عند غياب الإعداد: تُبقي التطبيق يعمل بدل شاشة بيضاء، لكنها تضمن
// أن أي كتابة تذهب إلى مسار غير موجود ترفضه القواعد بدل تلويث متجر حقيقي.
const UNCONFIGURED = "__unconfigured__";

const configuredStoreId = import.meta.env.VITE_STORE_ID as string | undefined;

if (!configuredStoreId) {
  console.error(
    "[Store] متغير VITE_STORE_ID غير مضبوط. أضفه في إعدادات البيئة " +
      "(Vercel Environment Variables) ثم أعد النشر، وإلا لن يظهر أي منتج.",
  );
}

export const STORE_ID: string = configuredStoreId || UNCONFIGURED;

export const isStoreConfigured = STORE_ID !== UNCONFIGURED;

// ==================== بناة المسارات ====================
// استخدم هذه الدوال بدل collection(db, "products") المباشرة، حتى لا يتسرب
// أي مسار عام (top-level) يتشارك فيه المتجران.

/** مستند جذر المتجر: { name, domain, active, createdAt } */
export const storeRootDoc = () => doc(db, "stores", STORE_ID);

/** مجموعة فرعية داخل المتجر، مثل storeCol("products") */
export const storeCol = (name: string) => collection(db, "stores", STORE_ID, name);

/** مستند داخل مجموعة فرعية، مثل storeDoc("orders", orderId) */
export const storeDoc = (name: string, id: string) =>
  doc(db, "stores", STORE_ID, name, id);

/** مسار التخزين (Storage) الخاص بالمتجر، مثل storagePath("products/abc.jpg") */
export const storagePath = (path: string) => `stores/${STORE_ID}/${path}`;

/**
 * يضيف storeId إلى حمولة أي دالة سحابية (Cloud Function).
 * الدوال تُنشر مرة واحدة للمشروع كله فلا تعرف المتجر من متغير بيئة —
 * كل نداء يجب أن يحمل هويته، والخادم يتحقق من الصلاحية داخل ذلك المتجر.
 */
export const withStore = <T extends object>(
  payload: T,
): T & { storeId: string } => ({ ...payload, storeId: STORE_ID });
