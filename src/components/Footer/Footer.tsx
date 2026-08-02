import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Truck,
  Shield,
  Headphones,
} from "lucide-react";
import { useStore } from "../../store/useStore";
import "./Footer.css";

const Footer: React.FC = () => {
  const { storeInfo } = useStore();
  const storeName = storeInfo.storeName || "متجري";
  return (
    <footer className="footer">
      {/* Features */}
      <div className="footer-features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-item">
              <Truck size={32} />
              <div>
                <h4>توصيل مبرّد</h4>
                <p>لجميع مناطق المملكة</p>
              </div>
            </div>
            <div className="feature-item">
              <Shield size={32} />
              <div>
                <h4>ذبح حلال</h4>
                <p>بإشراف شرعي معتمد</p>
              </div>
            </div>
            <div className="feature-item">
              <CreditCard size={32} />
              <div>
                <h4>دفع آمن</h4>
                <p>طرق دفع متعددة</p>
              </div>
            </div>
            <div className="feature-item">
              <Headphones size={32} />
              <div>
                <h4>دعم يومي</h4>
                <p>نرد عليك من 8 صباحاً حتى 11 مساءً</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* About */}
            <div className="footer-section">
              <h3 className="footer-title">{storeName}</h3>
              <p className="footer-about">
                نبيع الأغنام والمواشي مباشرة من المربّين. نختار كل رأس بأنفسنا،
                ونجهّزه بذبح حلال، ونوصله مبرّداً إلى بابك.
              </p>
              <div className="footer-social">
                <a href="#" className="social-link">
                  <Facebook size={20} />
                </a>
                <a href="#" className="social-link">
                  <Twitter size={20} />
                </a>
                <a href="#" className="social-link">
                  <Instagram size={20} />
                </a>
                <a href="#" className="social-link">
                  <Youtube size={20} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h3 className="footer-title">روابط سريعة</h3>
              <ul className="footer-links">
                <li>
                  <Link to="/about">من نحن</Link>
                </li>
                <li>
                  <Link to="/contact">اتصل بنا</Link>
                </li>
                <li>
                  <Link to="/faq">الأسئلة الشائعة</Link>
                </li>
                <li>
                  <Link to="/shipping">سياسة الشحن</Link>
                </li>
                <li>
                  <Link to="/returns">سياسة الإرجاع</Link>
                </li>
                <li>
                  <Link to="/privacy">سياسة الخصوصية</Link>
                </li>
              </ul>
            </div>

            {/* Shop */}
            <div className="footer-section">
              <h3 className="footer-title">التسوق</h3>
              <ul className="footer-links">
                <li>
                  <Link to="/products">تصفح المنتجات</Link>
                </li>
                <li>
                  <Link to="/products?featured=true">عروض اليوم</Link>
                </li>
                <li>
                  <Link to="/cart">سلة المشتريات</Link>
                </li>
                <li>
                  <Link to="/wishlist">المفضلة</Link>
                </li>
                <li>
                  <Link to="/account">طلباتي</Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="footer-section">
              <h3 className="footer-title">تواصل معنا</h3>
              <ul className="footer-contact">
                <li>
                  <MapPin size={18} aria-hidden="true" />
                  <span>{storeInfo.storeAddress || "المملكة العربية السعودية"}</span>
                </li>
                {storeInfo.storePhone && (
                  <li>
                    <Phone size={18} aria-hidden="true" />
                    <span>{storeInfo.storePhone}</span>
                  </li>
                )}
                {storeInfo.storeEmail && (
                  <li>
                    <Mail size={18} aria-hidden="true" />
                    <span>{storeInfo.storeEmail}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container">
          <p>
            © {new Date().getFullYear()} {storeName}. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
