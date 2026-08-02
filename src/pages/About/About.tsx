import React from "react";
import { Link } from "react-router-dom";
import { Shield, Truck, Headphones, Scale, Sprout, ScrollText } from "lucide-react";
import { useStore } from "../../store/useStore";
import { MEDIA } from "../../constants/media";
import "./About.css";

const About: React.FC = () => {
  const { storeInfo } = useStore();
  const storeName = storeInfo.storeName || "متجرنا";
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <h1>من نحن</h1>
          <p>{storeName} - أغنام من المربّي إلى بابك</p>
        </div>
      </section>

      {/* Story Section */}
      <section className="about-story">
        <div className="container">
          <div className="story-layout">
            <div className="story-content">
              <h2>قصتنا</h2>
              <p>
                بدأ {storeName} من علاقة طويلة مع المربّين في المنطقة. كنا نشتري
                لأهلنا ومعارفنا، ثم صار الطلب أكبر من أن يُدار بالهاتف، فبنينا
                هذا المتجر.
              </p>
              <p>
                نعاين القطيع بأنفسنا في المرعى، ونختار الرؤوس السليمة فقط، ثم
                نذبحها على الطريقة الشرعية في مسلخ معتمد، ونوصلها مبرّدة إلى
                بابك. لا وسطاء بيننا وبين المزرعة، ولذلك يبقى السعر قريباً من
                سعر السوق.
              </p>
            </div>
            <div className="story-photo">
              <img
                src={MEDIA.farm}
                alt="مزرعة أغنام"
                loading="lazy"
                width={900}
                height={700}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="about-features">
        <div className="container">
          <h2>لماذا تختارنا؟</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <ScrollText size={32} aria-hidden="true" />
              </div>
              <h3>ذبح حلال</h3>
              <p>كل رأس يُذبح بإشراف شرعي في مسلخ معتمد</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Sprout size={32} aria-hidden="true" />
              </div>
              <h3>من المربّي مباشرة</h3>
              <p>نشتري من المزرعة دون وسطاء، ونعاين القطيع بأنفسنا</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Scale size={32} aria-hidden="true" />
              </div>
              <h3>وزن معتمد</h3>
              <p>تدفع على الوزن الصافي بعد التنظيف، ويصلك كشف الوزن</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Truck size={32} aria-hidden="true" />
              </div>
              <h3>توصيل مبرّد</h3>
              <p>سلسلة تبريد كاملة من المسلخ حتى باب بيتك</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Shield size={32} aria-hidden="true" />
              </div>
              <h3>فحص بيطري</h3>
              <p>لا نبيع إلا الرؤوس السليمة، ونستبعد ما دون ذلك</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Headphones size={32} aria-hidden="true" />
              </div>
              <h3>دعم يومي</h3>
              <p>نرد على استفساراتك من 8 صباحاً حتى 11 مساءً</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <h2>جاهز تحجز رأسك؟</h2>
          <p>اطّلع على المعروض اليوم واختر ما يناسب مناسبتك</p>
          <div className="cta-buttons">
            <Link to="/products" className="btn btn-primary btn-lg">
              تصفح المنتجات
            </Link>
            <Link to="/contact" className="btn btn-outline btn-lg">
              اتصل بنا
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
