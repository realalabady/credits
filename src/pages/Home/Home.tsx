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
    title: "تقويم محتوى قبل النشر",
    text: "تعتمد محتوى الشهر كاملاً قبل أن يُنشر منه شيء.",
  },
  {
    icon: Scale,
    title: "تقارير بأرقام لا انطباعات",
    text: "وصول وتفاعل ونقرات، مع قراءة لما نجح وما لم ينجح.",
  },
  {
    icon: ShieldCheck,
    title: "حساباتك تبقى ملكك",
    text: "نعمل عبر صلاحيات إدارة، ولا نطلب كلمات مرورك.",
  },
  {
    icon: Truck,
    title: "ترقية أو إيقاف متى شئت",
    text: "اشتراك شهري بلا عقد سنوي، ويُحتسب فرق الترقية بالتناسب.",
  },
];

const steps = [
  {
    title: "نفهم",
    text: "جلسة تعريف نحدد فيها جمهورك ونبرة صوتك وأهداف الشهر.",
  },
  {
    title: "نخطط",
    text: "تقويم محتوى مكتوب ومصمّم، يصلك للاعتماد قبل بداية الشهر.",
  },
  {
    title: "ننشر ونقيس",
    text: "ننشر في أوقات الذروة، ندير التفاعل، ونرجع إليك بتقرير.",
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
              <span className="hero-eyebrow">اشتراك شهري بلا عقد سنوي</span>
              <h1>
                حساباتك تُدار،
                <br />
                لا تُترك للصدفة
              </h1>
              <p>
                ست باقات من 500 إلى 3000 ريال شهرياً. تقويم محتوى تعتمده قبل
                النشر، إدارة يومية للتفاعل، وتقرير يقول لك ما الذي نجح فعلاً.
              </p>
              <div className="hero-buttons">
                <Link to="/products" className="btn btn-primary btn-lg">
                  تصفح الباقات
                </Link>
                <Link
                  to="/products?featured=true"
                  className="btn btn-outline btn-lg"
                >
                  الأكثر طلباً
                </Link>
              </div>
            </div>
            <div className="hero-image">
              <img
                src={MEDIA.hero}
                alt="منحنى نمو صاعد مع إشعار تفاعل"
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
                <h2>الباقتان الأكثر طلباً</h2>
                <p>
                  الاحترافية عند 1000 ريال تكفي معظم الأنشطة القائمة، والمؤسسية
                  عند 3000 لمن يحتاج تغطية يومية وإدارة إعلانات بلا سقف.
                </p>
                <Link to="/products?featured=true" className="tile-link">
                  قارن الباقات <ChevronLeft size={18} aria-hidden="true" />
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

      {/* Full-bleed tiers band — one line, no metrics invented */}
      <section
        className="pasture-band"
        style={{ backgroundImage: `url(${MEDIA.tiers})` }}
      >
        <div className="container">
          <p className="reveal">
            ست باقات واضحة، وميزانية الإعلانات تبقى عندك لا عندنا.
          </p>
        </div>
      </section>

      {/* Process — three steps, tinted surface, no imagery */}
      <section className="process">
        <div className="container">
          <h2 className="reveal">كيف نشتغل معك</h2>
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
                src={MEDIA.calendar}
                alt="شبكة تقويم محتوى شهري"
                loading="lazy"
                width={900}
                height={1100}
              />
            </div>
            <div className="story-text reveal">
              <h2>لا يُنشر شيء قبل موافقتك</h2>
              <p>
                تصلك خطة الشهر كاملة — النص والتصميم وموعد النشر — قبل أن ينشر
                أحد شيئاً. تعدّل ما تريد، وما لا يعجبك لا يخرج.
              </p>
              <p>
                وفي نهاية الشهر يصلك تقرير بأرقام المنصة نفسها: كم وصل، كم تفاعل،
                ومن أين جاء. لا لقطات شاشة منتقاة.
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
              <span>أضف أول باقة من لوحة التحكم لتظهر هنا</span>
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
            <h2>حساباتك تنشر متى ما تذكّرت؟</h2>
            <p>ابدأ الشهر بتقويم معتمد بدل منشور متأخر كُتب على عجل.</p>
            <div className="cta-actions">
              <Link to="/products" className="btn btn-lg cta-primary">
                تصفح الباقات
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
