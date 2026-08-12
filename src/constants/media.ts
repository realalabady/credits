/**
 * صور الواجهة الثابتة.
 *
 * رسومات SVG محلية في public/brand/ بنفس لغة بطاقات المنتجات (حبر + ذهب عتيق).
 * محلية عمداً: لا استضافة خارجية، ولا صورة مكسورة إن تغيّر مزوّد الصور.
 * استبدلها بصور حقيقية عند توفرها — العناوين هنا هي المكان الوحيد الذي
 * تحتاج تعديله.
 */
export const MEDIA = {
  /** مروحة بطاقات — صورة البطل */
  hero: "/brand/hero-cards.svg",
  /** بطاقة داخل ظرف — قسم القصة */
  envelope: "/brand/gift-closeup.svg",
  /** صف الفئات الست — الشريط العريض */
  denominations: "/brand/denominations-wide.svg",
  /** الإهداء — قسم العروض */
  gifting: "/brand/gifting.svg",
} as const;

/** صورة بديلة للمنتجات التي لا تحمل صورة */
export const PRODUCT_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='120' height='120' fill='%23e8e5dd'/%3E%3Crect x='24' y='38' width='72' height='46' rx='6' fill='%23c9c3b4'/%3E%3Crect x='32' y='52' width='16' height='12' rx='2' fill='%23e8e5dd'/%3E%3C/svg%3E";
