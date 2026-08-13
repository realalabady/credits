#!/usr/bin/env node
/**
 * يولّد كل رسومات المتجر الثابتة في public/:
 *
 *   public/packages/smm-*.svg   بطاقة لكل باقة (تُشير إليها منتجات Firestore)
 *   public/brand/*.svg          مشاهد الواجهة (البطل، القصة، الشريط، الإهداء)
 *   public/favicon.svg          أيقونة التبويب
 *
 * الاستخدام:  node functions/scripts/gen-artwork.js
 *
 * لماذا مولّد لا ملفات مرسومة يدوياً: الرسومات تتكرر بنفس الشبكة والألوان،
 * وأي تغيير في الأكسنت أو الأرقام يجب أن يسري على الستة دفعة واحدة. الملفات
 * الناتجة تُحفظ في المستودع، والمولّد هو مصدرها — عدّل هنا ثم أعد التشغيل.
 *
 * تنبيه اتجاه النص: أي سطر يخلط أرقاماً لاتينية بنص عربي يحتاج
 * direction="rtl" صراحةً. ملف SVG يُحمّل داخل <img> يُرسم في مستند مستقل لا
 * يرث dir="rtl" من الصفحة، فيصير اتجاهه الأساسي LTR وتلتصق الأرقام بالكلمة
 * الخطأ. مع direction=rtl يصبح text-anchor=start هو الحافة اليمنى.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "../../public");
const AR = "'Tajawal','Cairo','Segoe UI',sans-serif";

// لوحة الأكسنت نفسها المعرّفة في src/styles/globals.css — أبقِهما متطابقتين.
const INK = "#1a1815";
const INK2 = "#2a2621";
const GOLD = "#d4af37";
const GOLD_SOFT = "#e3c46a";
const PAPER = "#f8f7f4";

// العدّ العربي: 1 مفرد، 2 مثنى، 3–10 جمع، و11 فأكثر تمييز مفرد منصوب.
const platformsLabel = (n) =>
  n === 1 ? "منصة واحدة" : n === 2 ? "منصتان" : `${n} منصات`;
const postsLabel = (n) => (n <= 10 ? `${n} منشورات` : `${n} منشوراً`);

const TIERS = [
  { slug: "starter", price: 500, label: "الأساسية", bars: 1, platforms: 1, posts: 8 },
  { slug: "growth", price: 800, label: "النمو", bars: 2, platforms: 2, posts: 12 },
  { slug: "pro", price: 1000, label: "الاحترافية", bars: 3, platforms: 3, posts: 16 },
  { slug: "business", price: 1500, label: "الأعمال", bars: 4, platforms: 4, posts: 20 },
  { slug: "advanced", price: 2000, label: "المتقدمة", bars: 5, platforms: 5, posts: 26 },
  { slug: "enterprise", price: 3000, label: "المؤسسية", bars: 6, platforms: 6, posts: 40 },
];

function write(rel, svg) {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, svg, "utf8");
  console.log(`wrote public/${rel}`);
}

// ==================== بطاقات الباقات ====================

function packageCard(t) {
  const bars = Array.from({ length: 6 }, (_, i) => {
    const x = 56 + i * 46;
    const h = 26 + i * 16;
    const on = i < t.bars;
    return `<rect x="${x}" y="${300 - h}" width="30" height="${h}" rx="6" fill="${on ? GOLD_SOFT : "none"}" stroke="${GOLD}" stroke-opacity="${on ? 0 : 0.35}" stroke-width="2"/>`;
  }).join("\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" width="600" height="380" role="img" aria-label="باقة ${t.label} لإدارة حسابات التواصل الاجتماعي">
  <defs>
    <linearGradient id="bg${t.price}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${INK}"/>
      <stop offset="1" stop-color="${INK2}"/>
    </linearGradient>
    <clipPath id="c${t.price}"><rect width="600" height="380" rx="28"/></clipPath>
  </defs>
  <g clip-path="url(#c${t.price})">
    <rect width="600" height="380" fill="url(#bg${t.price})"/>
    <circle cx="520" cy="80" r="170" fill="${GOLD}" opacity="0.07"/>
    ${bars}
    <text x="544" y="80" text-anchor="end" font-family="${AR}" font-size="34" font-weight="800" fill="${PAPER}">باقة ${t.label}</text>
    <text x="544" y="116" text-anchor="end" font-family="${AR}" font-size="20" fill="${GOLD_SOFT}">إدارة حسابات التواصل</text>
    <text x="544" y="214" text-anchor="end" font-family="${AR}" font-size="66" font-weight="800" fill="${PAPER}">${t.price}</text>
    <text x="544" y="248" text-anchor="end" font-family="${AR}" font-size="20" fill="${GOLD_SOFT}">ريال / شهرياً</text>
    <text x="544" y="300" text-anchor="start" direction="rtl" font-family="${AR}" font-size="19" fill="${PAPER}" opacity="0.75">${platformsLabel(t.platforms)} · ${postsLabel(t.posts)}</text>
    <text x="56" y="342" font-family="${AR}" font-size="17" fill="${PAPER}" opacity="0.6">Selfah</text>
    <rect x="1" y="1" width="598" height="378" rx="28" fill="none" stroke="${GOLD}" stroke-opacity="0.35" stroke-width="2"/>
  </g>
</svg>
`;
}

// ==================== مشاهد الواجهة ====================

const scene = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
  <defs>
    <linearGradient id="s" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${INK}"/><stop offset="1" stop-color="${INK2}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#s)"/>
  ${body}
</svg>
`;

/** منحنى نمو + نقاط تفاعل — البطل */
const heroScene = scene(
  1200,
  1000,
  `<circle cx="840" cy="300" r="360" fill="${GOLD}" opacity="0.07"/>
   <g transform="translate(140,240)">
     <path d="M0 480 L160 400 L320 430 L480 270 L640 300 L800 90" fill="none" stroke="${GOLD_SOFT}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
     <path d="M0 480 L160 400 L320 430 L480 270 L640 300 L800 90 L800 520 L0 520 Z" fill="${GOLD}" opacity="0.10"/>
     ${[[0, 480], [160, 400], [320, 430], [480, 270], [640, 300], [800, 90]]
       .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13" fill="${INK}" stroke="${GOLD_SOFT}" stroke-width="6"/>`)
       .join("\n     ")}
   </g>
   <g transform="translate(700,120)" opacity="0.9">
     <rect x="0" y="0" width="300" height="96" rx="20" fill="${INK2}" stroke="${GOLD}" stroke-opacity="0.5" stroke-width="2"/>
     <path d="M28 96 L28 124 L60 96 Z" fill="${INK2}"/>
     <circle cx="52" cy="48" r="20" fill="${GOLD_SOFT}" opacity="0.85"/>
     <rect x="90" y="30" width="170" height="10" rx="5" fill="${PAPER}" opacity="0.55"/>
     <rect x="130" y="56" width="130" height="10" rx="5" fill="${PAPER}" opacity="0.30"/>
   </g>`,
);

/** تقويم محتوى — قسم القصة */
const calendarScene = scene(
  900,
  1100,
  `<circle cx="450" cy="500" r="340" fill="${GOLD}" opacity="0.07"/>
   <g transform="translate(180,300)">
     <rect width="540" height="420" rx="24" fill="${INK2}" stroke="${GOLD}" stroke-opacity="0.45" stroke-width="2"/>
     <rect x="0" y="0" width="540" height="64" rx="24" fill="${GOLD}" opacity="0.18"/>
     ${Array.from({ length: 20 }, (_, i) => {
       const c = i % 5, r = Math.floor(i / 5);
       const filled = [1, 3, 6, 9, 12, 14, 17].includes(i);
       return `<rect x="${28 + c * 100}" y="${96 + r * 82}" width="76" height="60" rx="10" fill="${filled ? GOLD_SOFT : "none"}" fill-opacity="${filled ? 0.85 : 0}" stroke="${GOLD}" stroke-opacity="${filled ? 0 : 0.28}" stroke-width="2"/>`;
     }).join("\n     ")}
   </g>
   <text x="450" y="840" text-anchor="middle" font-family="${AR}" font-size="40" font-weight="700" fill="${PAPER}">تقويم محتوى معتمد</text>
   <text x="450" y="890" text-anchor="middle" font-family="${AR}" font-size="24" fill="${GOLD_SOFT}">قبل بداية كل شهر</text>`,
);

/** شريط الفئات الست العريض */
const tiersScene = scene(
  1800,
  900,
  `<circle cx="1500" cy="200" r="420" fill="${GOLD}" opacity="0.06"/>
   ${TIERS.map((t, i) => {
     const x = 120 + i * 265;
     return `<g>
       <rect x="${x}" y="360" width="230" height="150" rx="16" fill="#2b2620" stroke="${GOLD}" stroke-width="2" opacity="${0.55 + i * 0.075}"/>
       <text x="${x + 115}" y="440" text-anchor="middle" font-family="${AR}" font-size="44" font-weight="800" fill="${PAPER}">${t.price}</text>
       <text x="${x + 115}" y="478" text-anchor="middle" font-family="${AR}" font-size="19" fill="${GOLD_SOFT}">${t.label}</text>
     </g>`;
   }).join("\n   ")}
   <text x="900" y="240" text-anchor="middle" font-family="${AR}" font-size="54" font-weight="800" fill="${PAPER}">ست باقات</text>
   <text x="900" y="640" text-anchor="middle" font-family="${AR}" font-size="28" fill="${GOLD_SOFT}">من 500 إلى 3000 ريال شهرياً</text>`,
);

/** تقرير أداء — قسم الباقات المميزة */
const reportScene = scene(
  900,
  700,
  `<circle cx="660" cy="160" r="260" fill="${GOLD}" opacity="0.07"/>
   <g transform="translate(150,190)">
     <rect width="600" height="380" rx="22" fill="${INK2}" stroke="${GOLD}" stroke-opacity="0.45" stroke-width="2"/>
     ${[120, 190, 150, 250, 300].map((h, i) => `<rect x="${60 + i * 100}" y="${330 - h}" width="56" height="${h}" rx="8" fill="${GOLD_SOFT}" opacity="${0.45 + i * 0.12}"/>`).join("\n     ")}
     <rect x="40" y="40" width="180" height="12" rx="6" fill="${PAPER}" opacity="0.5"/>
   </g>
   <text x="450" y="632" text-anchor="middle" font-family="${AR}" font-size="34" font-weight="700" fill="${PAPER}">تقرير أداء دوري</text>`,
);

// ==================== الأيقونة ====================
// شرارة/إشارة صاعدة داخل مربع بألوان اللوحة — لا حقيبة تسوّق عامة.
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="7" fill="${INK}"/>
  <path d="M7 22 L13 16 L18 19 L25 10" fill="none" stroke="${GOLD_SOFT}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="25" cy="10" r="3" fill="${GOLD}"/>
</svg>
`;

// ==================== التنفيذ ====================

for (const t of TIERS) write(`packages/smm-${t.slug}.svg`, packageCard(t));
write("brand/hero-growth.svg", heroScene);
write("brand/content-calendar.svg", calendarScene);
write("brand/tiers-wide.svg", tiersScene);
write("brand/report.svg", reportScene);
write("favicon.svg", favicon);
