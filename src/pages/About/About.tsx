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
          <p>{storeName} - بطاقات هدايا رقمية تصل في دقائق</p>
        </div>
      </section>

      {/* Story Section */}
      <section className="about-story">
        <div className="container">
          <div className="story-layout">
            <div className="story-content">
              <h2>قصتنا</h2>
              <p>
                بدأ {storeName} من سؤال يتكرر قبل كل مناسبة: ماذا نهدي؟ الهدية
                الخاطئة تُنسى في الدرج، والصحيحة تحتاج معرفة بذوق صاحبها ومقاسه.
              </p>
              <p>
                فبنينا متجراً لا يبيع إلا البطاقات: ست فئات واضحة، سعر ظاهر بلا
                رسوم إصدار، ورمز يصل على البريد خلال دقائق. من تُهديه يختار
                بنفسه، ويبقى الرصيد قائماً حتى ينفد.
              </p>
            </div>
            <div className="story-photo">
              <img
                src={MEDIA.gifting}
                alt="بطاقات هدايا مرتبة فوق بعضها"
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
              <h3>صالحة 12 شهراً</h3>
              <p>من تاريخ الشراء، ولا تنتهي فجأة دون إشعار</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Sprout size={32} aria-hidden="true" />
              </div>
              <h3>تُهديها لمن تشاء</h3>
              <p>ترسلها إلى بريد شخص آخر مع رسالة قصيرة</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Scale size={32} aria-hidden="true" />
              </div>
              <h3>رصيد لا يضيع</h3>
              <p>تُستخدم على أكثر من طلب حتى ينفد رصيدها بالكامل</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Truck size={32} aria-hidden="true" />
              </div>
              <h3>تسليم فوري</h3>
              <p>يصلك الرمز على بريدك فور اكتمال الطلب</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Shield size={32} aria-hidden="true" />
              </div>
              <h3>بلا رسوم خفية</h3>
              <p>لا رسوم إصدار ولا رسوم تحويل — تدفع قيمة البطاقة فقط</p>
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
          <h2>جاهز تختار فئتك؟</h2>
          <p>ست فئات من 500 إلى 3000 ريال، تصل على البريد في دقائق</p>
          <div className="cta-buttons">
            <Link to="/products" className="btn btn-primary btn-lg">
              تصفح البطاقات
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
