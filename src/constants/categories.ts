import type { Category } from "../types";

/**
 * التصنيفات الثابتة للمتجر.
 *
 * هذا المتجر متخصص في الجوالات والأجهزة الإلكترونية وقطع الكمبيوتر فقط.
 * التصنيفات مُعرّفة هنا بشكل ثابت ولا يمكن للمدير إضافتها أو تعديلها من لوحة
 * التحكم — يقتصر دور المدير على إدارة المنتجات فقط.
 *
 * لتعديل التصنيفات، عدّل هذه القائمة مباشرة.
 */
export const CATEGORIES: Category[] = [
  {
    id: "phones",
    name: "الجوالات",
    nameEn: "Phones",
    icon: "Smartphone",
    order: 0,
    subcategories: [
      { id: "phones-android", name: "أندرويد", nameEn: "Android" },
      { id: "phones-iphone", name: "آيفون", nameEn: "iPhone" },
      { id: "phones-tablets", name: "أجهزة لوحية", nameEn: "Tablets" },
    ],
  },
  {
    id: "laptops",
    name: "اللابتوبات والكمبيوتر",
    nameEn: "Laptops & Computers",
    icon: "Laptop",
    order: 1,
    subcategories: [
      { id: "laptops-laptops", name: "لابتوبات", nameEn: "Laptops" },
      { id: "laptops-desktops", name: "كمبيوترات مكتبية", nameEn: "Desktops" },
    ],
  },
  {
    id: "pc-parts",
    name: "قطع ومكونات الكمبيوتر",
    nameEn: "PC Components",
    icon: "Cpu",
    order: 2,
    subcategories: [
      { id: "pc-cpu", name: "معالجات", nameEn: "Processors (CPU)" },
      { id: "pc-gpu", name: "كروت شاشة", nameEn: "Graphics Cards (GPU)" },
      { id: "pc-ram", name: "ذاكرة عشوائية", nameEn: "Memory (RAM)" },
      { id: "pc-storage", name: "وحدات تخزين", nameEn: "Storage" },
      { id: "pc-motherboard", name: "لوحات أم", nameEn: "Motherboards" },
      { id: "pc-psu", name: "مزودات الطاقة", nameEn: "Power Supplies" },
      { id: "pc-case", name: "صناديق وتبريد", nameEn: "Cases & Cooling" },
    ],
  },
  {
    id: "tvs",
    name: "الشاشات والتلفزيونات",
    nameEn: "Screens & TVs",
    icon: "Tv",
    order: 3,
    subcategories: [
      { id: "tvs-tv", name: "تلفزيونات", nameEn: "Televisions" },
      { id: "tvs-monitors", name: "شاشات كمبيوتر", nameEn: "Monitors" },
    ],
  },
  {
    id: "gaming",
    name: "الألعاب والأجهزة",
    nameEn: "Gaming",
    icon: "Gamepad2",
    order: 4,
    subcategories: [
      { id: "gaming-consoles", name: "أجهزة ألعاب", nameEn: "Consoles" },
      { id: "gaming-accessories", name: "ملحقات الألعاب", nameEn: "Gaming Accessories" },
    ],
  },
  {
    id: "audio",
    name: "السماعات والصوتيات",
    nameEn: "Audio",
    icon: "Headphones",
    order: 5,
    subcategories: [
      { id: "audio-headphones", name: "سماعات رأس", nameEn: "Headphones" },
      { id: "audio-earbuds", name: "سماعات أذن", nameEn: "Earbuds" },
      { id: "audio-speakers", name: "مكبرات صوت", nameEn: "Speakers" },
    ],
  },
  {
    id: "watches",
    name: "الساعات الذكية",
    nameEn: "Smart Watches",
    icon: "Watch",
    order: 6,
    subcategories: [
      { id: "watches-smartwatch", name: "ساعات ذكية", nameEn: "Smartwatches" },
      { id: "watches-bands", name: "أساور رياضية", nameEn: "Fitness Bands" },
    ],
  },
  {
    id: "accessories",
    name: "الإكسسوارات والملحقات",
    nameEn: "Accessories",
    icon: "Package",
    order: 7,
    subcategories: [
      { id: "acc-chargers", name: "شواحن وكابلات", nameEn: "Chargers & Cables" },
      { id: "acc-cases", name: "أغطية وحمايات", nameEn: "Cases & Protectors" },
      { id: "acc-power", name: "بطاريات متنقلة", nameEn: "Power Banks" },
    ],
  },
];
