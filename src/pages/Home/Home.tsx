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
    icon: Truck,
    title: "تسليم فوري بالبريد",
    text: "تصلك البطاقة ورمزها على بريدك فور اكتمال الطلب.",
  },
  {
    icon: ScrollText,
    title: "صالحة 12 شهراً",
    text: "من تاريخ الشراء، بلا رسوم إصدار ولا رسوم تحويل.",
  },
  {
    icon: Scale,
    title: "تُستخدم على أكثر من طلب",
    text: "يبقى الرصيد قائماً حتى ينفد، وتدفع الفرق إن زاد الطلب.",
  },
  {
    icon: ShieldCheck,
    title: "دفع آمن",
    text: "ادفع إلكترونياً، ويصلك الرمز في رسالة واحدة.",
  },
];

const steps = [
  {
    title: "اختر",
    text: "حدد الفئة التي تناسب مناسبتك، من 500 إلى 3000 ريال.",
  },
  {
    title: "أرسل",
    text: "إلى بريدك أو إلى بريد من تُهديه، مع رسالة قصيرة.",
  },
  {
    title: "استخدم",
    text: "أدخل الرمز عند الدفع ليُخصم من قيمة الطلب.",
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
              <span className="hero-eyebrow">تصل على البريد خلال دقائق</span>
              <h1>
                بطاقة هدية،
                <br />
                تُرسلها في دقيقة
              </h1>
              <p>
                ست فئات من 500 إلى 3000 ريال. تصل على بريدك أو بريد من تُهديه،
                وتُستخدم على أكثر من طلب حتى ينفد رصيدها.
              </p>
              <div className="hero-buttons">
                <Link to="/products" className="btn btn-primary btn-lg">
                  تصفح البطاقات
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
                alt="مروحة من بطاقات الهدايا"
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
                <h2>الفئات الأكثر طلباً</h2>
                <p>
                  فئة 1000 ريال تغطي معظم الطلبات دفعة واحدة، وفئة 3000 للمناسبات
                  الكبرى والإهداء المؤسسي.
                </p>
                <Link to="/products?featured=true" className="tile-link">
                  الأكثر طلباً <ChevronLeft size={18} aria-hidden="true" />
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

      {/* Full-bleed denominations band — one line, no metrics invented */}
      <section
        className="pasture-band"
        style={{ backgroundImage: `url(${MEDIA.denominations})` }}
      >
        <div className="container">
          <p className="reveal">
            ست فئات ثابتة، بلا رسوم خفية وبلا تاريخ انتهاء مفاجئ.
          </p>
        </div>
      </section>

      {/* Process — three steps, tinted surface, no imagery */}
      <section className="process">
        <div className="container">
          <h2 className="reveal">من الشراء إلى الاستخدام</h2>
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
                src={MEDIA.envelope}
                alt="بطاقة هدية داخل ظرف"
                loading="lazy"
                width={900}
                height={1100}
              />
            </div>
            <div className="story-text reveal">
              <h2>هدية لا تحتاج مقاساً</h2>
              <p>
                البطاقة تترك الاختيار لمن تُهديه: يشتري ما يريده هو، وقت ما
                يناسبه، دون أن تخمّن ذوقه أو مقاسه.
              </p>
              <p>
                ولأنها رقمية، تصل في دقائق لا في أيام — تشتريها الليلة وتصل قبل
                المناسبة.
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
              <span>أضف أول بطاقة من لوحة التحكم لتظهر هنا</span>
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
            <p>اشترِ البطاقة الآن، وتصل على البريد قبل أن تنتهي من الصفحة.</p>
            <div className="cta-actions">
              <Link to="/products" className="btn btn-lg cta-primary">
                تصفح البطاقات
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
