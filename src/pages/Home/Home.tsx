import React from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ScrollText,
  Truck,
  Scale,
  ShieldCheck,
  Inbox,
} from "lucide-react";
import ProductCard from "../../components/ProductCard/ProductCard";
import { useStore } from "../../store/useStore";
import { useReveal } from "../../hooks/useReveal";
import { MEDIA } from "../../constants/media";
import "./Home.css";

const assurances = [
  {
    icon: ScrollText,
    title: "ذبح حلال بإشراف شرعي",
    text: "كل رأس يُذبح على الطريقة الشرعية في مسلخ معتمد.",
  },
  {
    icon: Truck,
    title: "توصيل مبرّد خلال 24 ساعة",
    text: "سلسلة تبريد كاملة من المسلخ حتى باب بيتك.",
  },
  {
    icon: Scale,
    title: "وزن معتمد بعد التنظيف",
    text: "تدفع على الوزن الصافي، ويصلك كشف الوزن مع الطلب.",
  },
  {
    icon: ShieldCheck,
    title: "دفع آمن أو عند الاستلام",
    text: "ادفع إلكترونياً أو نقداً عند وصول الطلب.",
  },
];

const steps = [
  {
    title: "اختر",
    text: "حدد الرأس والوزن الذي يناسب مناسبتك من المعروض.",
  },
  {
    title: "جهّز",
    text: "ذبح وتقطيع وتنظيف حسب الطريقة التي تفضّلها.",
  },
  {
    title: "استلم",
    text: "توصيل مبرّد إلى بابك، أو استلام مباشر من المسلخ.",
  },
];

const Home: React.FC = () => {
  const { products } = useStore();
  // المنتجات تصل بعد أول رسم، فنعيد ربط المراقب عند تغيّر عددها
  const revealRef = useReveal<HTMLDivElement>([products.length]);

  const featuredProducts = products.filter((p) => p.featured).slice(0, 3);
  const latestProducts = products.slice(0, 8);

  return (
    <div className="home" ref={revealRef}>
      {/* Hero — asymmetric split, photography carries the weight */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <span className="hero-eyebrow">ذبح وتجهيز في نفس اليوم</span>
              <h1>
                أغنام مختارة باليد،
                <br />
                تصل إليك طازجة
              </h1>
              <p>
                نختار كل رأس من المرعى، ونجهّزه حسب طلبك، ويصل إلى بابك في نفس
                اليوم.
              </p>
              <div className="hero-buttons">
                <Link to="/products" className="btn btn-primary btn-lg">
                  تصفح المنتجات
                </Link>
                <Link
                  to="/products?featured=true"
                  className="btn btn-outline btn-lg"
                >
                  عروض اليوم
                </Link>
              </div>
            </div>
            <div className="hero-image">
              <img
                src={MEDIA.heroFlock}
                alt="قطيع من الأغنام في المرعى"
                width={1200}
                height={1000}
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Assurances — hairline row, no cards */}
      <section className="assurances">
        <div className="container">
          <ul className="assurance-row">
            {assurances.map(({ icon: Icon, title, text }, i) => (
              <li
                key={title}
                className="assurance reveal"
                style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}
              >
                <Icon size={22} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Featured — bento: one editorial tile alongside the featured heads */}
      {featuredProducts.length > 0 && (
        <section className="featured-section">
          <div className="container">
            <div className="featured-bento">
              <div className="bento-tile reveal">
                <h2>جاهز للمناسبة</h2>
                <p>
                  رؤوس اخترناها لعزائم هذا الأسبوع، بوزن معروف وسعر ثابت قبل
                  الذبح.
                </p>
                <Link to="/products?featured=true" className="tile-link">
                  عروض اليوم <ChevronLeft size={18} aria-hidden="true" />
                </Link>
              </div>
              {featuredProducts.map((product, i) => (
                <div
                  key={product.id}
                  className="reveal"
                  style={
                    { "--reveal-delay": `${(i + 1) * 70}ms` } as React.CSSProperties
                  }
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Full-bleed pasture band — one line, no metrics invented */}
      <section
        className="pasture-band"
        style={{ backgroundImage: `url(${MEDIA.pastureWide})` }}
      >
        <div className="container">
          <p className="reveal">
            نعرف المرعى الذي رعى فيه كل رأس، والراعي الذي اعتنى به.
          </p>
        </div>
      </section>

      {/* Process — three steps, tinted surface, no imagery */}
      <section className="process">
        <div className="container">
          <h2 className="reveal">من المرعى إلى مائدتك</h2>
          <ol className="process-steps">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="reveal"
                style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
              >
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Story — editorial split, the one image+text split on the page */}
      <section className="story">
        <div className="container">
          <div className="story-content">
            <div className="story-media reveal">
              <img
                src={MEDIA.closeUp}
                alt="رأس غنم في المرعى"
                loading="lazy"
                width={900}
                height={1100}
              />
            </div>
            <div className="story-text reveal">
              <h2>نشتري من الراعي مباشرة</h2>
              <p>
                لا وسطاء بيننا وبين المزارع. نعاين القطيع بأنفسنا، ونختار الرؤوس
                السليمة فقط، فتصلك بسعر أقرب لسعر السوق وجودة نضمنها.
              </p>
              <p>
                ولأن الوزن هو ما تدفع عليه، نزن بعد التنظيف أمامك ونرسل لك كشف
                الوزن مع الطلب.
              </p>
              <Link to="/about" className="story-link">
                من نحن <ChevronLeft size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest — plain product grid */}
      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <h2>المعروض الآن</h2>
            <Link to="/products" className="view-all">
              عرض الكل <ChevronLeft size={18} aria-hidden="true" />
            </Link>
          </div>
          {latestProducts.length > 0 ? (
            <div className="products-grid">
              {latestProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-products">
              <Inbox size={44} aria-hidden="true" />
              <p>لا توجد منتجات بعد</p>
              <span>أضف أول رأس من لوحة التحكم ليظهر هنا</span>
              <Link
                to="/dashboard/products"
                className="btn btn-primary"
                style={{ marginTop: "16px" }}
              >
                إضافة منتج
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="closing-cta">
        <div className="container">
          <div className="cta-inner reveal">
            <h2>عندك مناسبة قريبة؟</h2>
            <p>احجز رأسك اليوم ونجهّزه في الموعد الذي تحدده.</p>
            <div className="cta-actions">
              <Link to="/products" className="btn btn-lg cta-primary">
                تصفح المنتجات
              </Link>
              <Link to="/contact" className="cta-secondary">
                اتصل بنا
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
