import { useEffect, useRef } from "react";

/**
 * يكشف العناصر التي تحمل الصنف `.reveal` عند دخولها إطار العرض.
 *
 * يعتمد على IntersectionObserver (وليس على مستمع scroll) حتى لا يعمل أي كود
 * على كل إطار أثناء التمرير. الحركة تقتصر على transform و opacity.
 *
 * المحتوى ظاهر افتراضياً: لا يُخفى أي عنصر إلا بعد أن يضيف هذا الخطاف الصنف
 * `reveal-ready` على الجذر، وبعد التأكد من توفر المراقب. وإن لم يصل أي نداء من
 * المراقب خلال مهلة قصيرة، نُظهر كل شيء. بهذا لا يبقى المحتوى مخفياً أبداً إذا
 * تعطّل JavaScript أو المراقب.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  /**
   * مرّر القيم التي يتغير معها محتوى الصفحة (مثل عدد المنتجات القادمة من
   * Firestore) حتى يُعاد ربط المراقب بالعناصر التي ظهرت بعد أول تحميل.
   */
  deps: readonly unknown[] = [],
) {
  const rootRef = useRef<T>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced || typeof IntersectionObserver === "undefined") {
      root.classList.remove("reveal-ready");
      return;
    }

    // العناصر التي سبق كشفها تبقى ظاهرة ولا يُعاد مراقبتها
    const targets = Array.from(
      root.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)"),
    );
    if (targets.length === 0) return;

    root.classList.add("reveal-ready");

    let received = false;
    const observer = new IntersectionObserver(
      (entries) => {
        received = true;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    targets.forEach((el) => observer.observe(el));

    // شبكة أمان: إذا لم يصل أي نداء من المراقب، أظهر المحتوى كاملاً
    const fallback = window.setTimeout(() => {
      if (!received) root.classList.remove("reveal-ready");
    }, 1600);

    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return rootRef;
}
