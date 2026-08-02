/**
 * صور الواجهة الثابتة.
 *
 * هذه صور فوتوغرافية حقيقية من Unsplash تستخدم كصور مبدئية للمتجر.
 * استبدلها بصور المزرعة الحقيقية عند توفرها — العناوين هنا هي المكان
 * الوحيد الذي تحتاج تعديله.
 */
const unsplash = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=70`;

export const MEDIA = {
  /** قطيع في المرعى — صورة البطل */
  heroFlock: unsplash("1614183654058-0bac05af5ab0", 1200, 1000),
  /** لقطة قريبة لرأس — قسم القصة */
  closeUp: unsplash("1650310628236-e1872b976b5e", 900, 1100),
  /** مرعى واسع عند الغروب — الشريط العريض */
  pastureWide: unsplash("1588152850700-c82ecb8ba9b1", 1800, 900),
  /** حظيرة ومزرعة — قسم العروض */
  farm: unsplash("1643153866788-1ac290955db5", 900, 700),
} as const;

/** صورة بديلة للمنتجات التي لا تحمل صورة */
export const PRODUCT_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='120' height='120' fill='%23e6e6e1'/%3E%3Cpath d='M28 82l22-28 15 17 11-13 16 24z' fill='%23c2c4ba'/%3E%3Ccircle cx='44' cy='42' r='9' fill='%23c2c4ba'/%3E%3C/svg%3E";
