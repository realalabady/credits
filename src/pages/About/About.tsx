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
          <p>{storeName} - إدارة حسابات التواصل الاجتماعي</p>
        </div>
      </section>

      {/* Story Section */}
      <section className="about-story">
        <div className="container">
          <div className="story-layout">
            <div className="story-content">
              <h2>قصتنا</h2>
              <p>
                بدأ {storeName} من ملاحظة تتكرر: أصحاب الأنشطة الصغيرة لا تنقصهم
                الرغبة في النشر، ينقصهم وقت ثابت له. فيصير الحساب ينشط أسبوعاً
                ويصمت شهراً.
              </p>
              <p>
                فبنينا خدمة بأسعار ظاهرة وحدود مكتوبة: تعرف قبل الاشتراك كم
                منشوراً تأخذ، وعلى كم منصة، ومن يرد على تعليقات عملائك — بدل عرض
                سعر مفتوح لا يقول شيئاً.
              </p>
            </div>
            <div className="story-photo">
              <img
                src={MEDIA.report}
                alt="تقرير أداء بأعمدة بيانية"
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
              <h3>حدود مكتوبة</h3>
              <p>عدد المنشورات والمنصات مذكور في كل باقة قبل الاشتراك</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Sprout size={32} aria-hidden="true" />
              </div>
              <h3>اعتماد قبل النشر</h3>
              <p>تقويم الشهر يصلك للمراجعة، ولا يخرج منشور دون موافقتك</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Scale size={32} aria-hidden="true" />
              </div>
              <h3>تقارير بالأرقام</h3>
              <p>وصول وتفاعل ونقرات من المنصة نفسها، لا لقطات منتقاة</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Truck size={32} aria-hidden="true" />
              </div>
              <h3>ترقية بالتناسب</h3>
              <p>تنتقل لباقة أعلى في أي وقت ويُحتسب الفرق على ما تبقّى</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Shield size={32} aria-hidden="true" />
              </div>
              <h3>حساباتك باسمك</h3>
              <p>نعمل بصلاحيات إدارة، ولا نطلب كلمات مرورك في أي مرحلة</p>
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
          <h2>جاهز تختار باقتك؟</h2>
          <p>ست باقات من 500 إلى 3000 ريال شهرياً، بحدود واضحة مكتوبة</p>
          <div className="cta-buttons">
            <Link to="/products" className="btn btn-primary btn-lg">
              تصفح الباقات
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
