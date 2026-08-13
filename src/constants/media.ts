/**
 * صور الواجهة الثابتة.
 *
 * رسومات SVG محلية في public/brand/ يولّدها functions/scripts/gen-artwork.js
 * بنفس لغة بطاقات الباقات (حبر + ذهب عتيق). عدّل المولّد لا الملفات الناتجة.
 * محلية عمداً: لا استضافة خارجية، ولا صورة مكسورة إن تغيّر مزوّد الصور.
 */
export const MEDIA = {
  /** منحنى نمو مع إشعار تفاعل — صورة البطل */
  hero: "/brand/hero-growth.svg",
  /** شبكة تقويم المحتوى — قسم القصة */
  calendar: "/brand/content-calendar.svg",
  /** شريط الباقات الست — الشريط العريض */
  tiers: "/brand/tiers-wide.svg",
  /** تقرير أداء — قسم الباقات المميزة */
  report: "/brand/report.svg",
} as const;

/** صورة بديلة للمنتجات التي لا تحمل صورة */
export const PRODUCT_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='120' height='120' fill='%23e8e5dd'/%3E%3Cpath d='M24 78l20-20 14 9 26-31' fill='none' stroke='%23c9c3b4' stroke-width='6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";
