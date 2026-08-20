import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  CreditCard,
  Truck,
  ShoppingBag,
  ArrowRight,
  Check,
  Loader,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useStore } from "../../store/useStore";
import { addOrder, getSettings, updateOrderData } from "../../services/firestore";
import { createTamaraCheckout } from "../../services/tamara";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useToast } from "../../components/Toast/Toast";
import PayPalCardForm from "../../components/PayPalCardForm/PayPalCardForm";
import "./Checkout.css";

interface ShippingSettings {
  freeShippingThreshold: number;
  defaultShippingCost: number;
  enableFreeShipping: boolean;
  estimatedDays: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
}

// طرق الدفع المسموح بها للعميل.
const ALLOWED_METHOD_IDS = ["cash", "bank", "card", "emkan", "tamara"] as const;

const CARD_METHOD: PaymentMethod = {
  id: "card",
  name: "بطاقة ائتمان / مدى (PayPal)",
  enabled: true,
};

const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: "cash", name: "الدفع عند الاستلام", enabled: true },
  { id: "bank", name: "التحويل البنكي", enabled: true },
  CARD_METHOD,
  { id: "emkan", name: "إمكان - قسّمها على 5", enabled: true },
  { id: "tamara", name: "تمارا - قسّمها على 3", enabled: true },
];

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { cart, user, clearCart, getCartTotal, storeInfo } = useStore();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({
    freeShippingThreshold: 200,
    defaultShippingCost: 25,
    enableFreeShipping: true,
    estimatedDays: "3-5",
  });
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(
    DEFAULT_PAYMENT_METHODS
  );

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    city: "",
    district: "",
    street: "",
    building: "",
    nationalAddress: "",
    notes: "",
    paymentMethod: "cash",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  // معالجة الدفع بالبطاقة جارية (يمنع مغادرة الخطوة أثناء الدفع)
  const [paypalProcessing, setPaypalProcessing] = useState(false);
  // مرجع ثابت لعملية الدفع، يُستخدم كمعرّف مستند pending_payments في الخادم.
  const [paypalReference] = useState(
    () => `pp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  );

  // يجب تسجيل الدخول قبل الوصول للدفع
  useEffect(() => {
    if (!user) {
      navigate("/login?redirect=/checkout", { replace: true });
    }
  }, [user, navigate]);

  // جلب الإعدادات من Firestore
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getSettings();
        if (settings) {
          if (settings.shipping) {
            setShippingSettings(settings.shipping);
          }
          // قراءة طرق الدفع من الإعدادات، مع حصرها في المسموح بها.
          if (settings.payment?.methods && settings.payment.methods.length > 0) {
            const allowed = settings.payment.methods.filter((m: PaymentMethod) =>
              (ALLOWED_METHOD_IDS as readonly string[]).includes(m.id)
            );
            if (!allowed.some((m: PaymentMethod) => m.id === "emkan")) {
              allowed.push({
                id: "emkan",
                name: "إمكان - قسّمها على 5",
                enabled: true,
              });
            }
            // الدفع بالبطاقة عبر PayPal مفعّل دائماً كخيار أساسي.
            if (!allowed.some((m: PaymentMethod) => m.id === "card")) {
              allowed.push({ ...CARD_METHOD });
            }
            if (allowed.length > 0) {
              setPaymentMethods(allowed);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();
  }, []);

  // تعبئة بيانات المستخدم
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || "",
        phone: user.phone || "",
        city: user.addresses?.[0]?.city || "",
        district: user.addresses?.[0]?.district || "",
        street: user.addresses?.[0]?.street || "",
        building: user.addresses?.[0]?.building || "",
        nationalAddress: user.addresses?.[0]?.nationalAddress || "",
      }));
    }
  }, [user]);

  // التحقق من السلة (فقط للمستخدم المسجّل؛ غير المسجّل يُوجَّه لتسجيل الدخول أولاً)
  useEffect(() => {
    if (user && cart.length === 0 && !orderPlaced) {
      navigate("/cart");
    }
  }, [user, cart, navigate, orderPlaced]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
    }).format(price);
  };

  const subtotal = getCartTotal();
  const shipping =
    shippingSettings.enableFreeShipping &&
    subtotal >= shippingSettings.freeShippingThreshold
      ? 0
      : shippingSettings.defaultShippingCost;
  const total = subtotal + shipping;

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "الاسم مطلوب";
    if (!formData.phone.trim()) newErrors.phone = "رقم الجوال مطلوب";
    else if (!/^05\d{8}$/.test(formData.phone))
      newErrors.phone = "رقم جوال غير صحيح";
    if (!formData.city.trim()) newErrors.city = "المدينة مطلوبة";
    if (!formData.district.trim()) newErrors.district = "الحي مطلوب";
    if (!formData.street.trim()) newErrors.street = "الشارع مطلوب";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmitOrder = async (paypalPayment?: {
    paypalOrderId: string;
    captureId: string;
  }) => {
    if (!user) {
      navigate("/login?redirect=/checkout");
      return;
    }

    setLoading(true);

    try {
      // التحقق من توفر المخزون قبل إرسال الطلب
      const { products } = useStore.getState();
      const stockErrors: string[] = [];
      for (const item of cart) {
        const currentProduct = products.find((p) => p.id === item.product.id);
        if (currentProduct && currentProduct.stock < item.quantity) {
          stockErrors.push(
            `${item.product.name}: متوفر ${currentProduct.stock} فقط (طلبت ${item.quantity})`,
          );
        }
      }
      // إذا تم سحب المبلغ عبر PayPal فلا نلغي الطلب هنا؛ نُنشئه ويتابع المتجر
      // نقص المخزون مع العميل بدل ضياع دفعة تمت بالفعل.
      if (stockErrors.length > 0 && !paypalPayment) {
        showToast(
          "بعض المنتجات غير متوفرة بالكمية المطلوبة:\n" +
            stockErrors.join("\n"),
          "error"
        );
        setLoading(false);
        return;
      }

      const isEmkan = formData.paymentMethod === "emkan";
      const isTamara = formData.paymentMethod === "tamara";

      const orderData = {
        userId: user.id,
        customer: formData.fullName,
        email: user.email,
        phone: formData.phone,
        items: cart.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          image: item.product.images[0] || "",
        })),
        total: total,
        subtotal: subtotal,
        shippingCost: shipping,
        status: "pending" as const,
        paymentMethod: formData.paymentMethod,
        ...(isEmkan || isTamara ? { paymentStatus: "pending" as const } : {}),
        // PayPal: الدفع تم بالفعل قبل إنشاء الطلب، لذا نحفظه مدفوعاً مع مراجعه.
        ...(paypalPayment
          ? {
              paymentStatus: "paid" as const,
              paypalOrderId: paypalPayment.paypalOrderId,
              paypalCaptureId: paypalPayment.captureId,
              paidAt: new Date(),
            }
          : {}),
        shippingAddress: `${formData.city}، ${formData.district}، ${formData.street}${formData.building ? `، مبنى ${formData.building}` : ""}${formData.nationalAddress ? `، العنوان الوطني: ${formData.nationalAddress}` : ""}`,

        address: {
          fullName: formData.fullName,
          phone: formData.phone,
          city: formData.city,
          district: formData.district,
          street: formData.street,
          building: formData.building,
          nationalAddress: formData.nationalAddress,
        },
        notes: formData.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // المخزون يُخصم على الخادم داخل onOrderCreated (معاملة ذرية).
      // كما يُرسل onOrderCreated تنبيهاً لصاحب المتجر عبر Resend لطلبات إمكان.
      const newOrderId = await addOrder(orderData);

      if (isTamara) {
        const nameParts = formData.fullName.trim().split(/\s+/);
        const firstName = nameParts[0] || formData.fullName;
        const lastName = nameParts.slice(1).join(" ") || firstName;
        const tamaraResult = await createTamaraCheckout({
          orderReferenceId: newOrderId,
          totalAmount: total,
          currency: "SAR",
          items: cart.map((item) => ({
            reference_id: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            unit_price: item.product.price,
            image_url: item.product.images[0] || undefined,
          })),
          consumer: {
            first_name: firstName,
            last_name: lastName,
            email: user.email,
            phone: formData.phone,
          },
          shippingAddress: {
            first_name: firstName,
            last_name: lastName,
            line1: `${formData.district}، ${formData.street}${formData.building ? `، مبنى ${formData.building}` : ""}`,
            city: formData.city,
            phone: formData.phone,
          },
          shippingAmount: shipping,
          successUrl: `${window.location.origin}/order-confirmation/${newOrderId}?tamara=success`,
          failureUrl: `${window.location.origin}/order-confirmation/${newOrderId}?tamara=failure`,
          cancelUrl: `${window.location.origin}/order-confirmation/${newOrderId}?tamara=cancel`,
          description: `طلب #${newOrderId}`,
        });

        await updateOrderData(newOrderId, {
          tamaraCheckoutId: tamaraResult.checkout_id,
        });
        window.location.assign(tamaraResult.checkout_url);
        return;
      }

      setOrderPlaced(true);
      clearCart();
      setStep(3);
      navigate(`/order-confirmation/${newOrderId}`, { replace: true });
    } catch (error) {
      console.error("Error creating order:", error);
      showToast("حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى.", "error");
    } finally {
      setLoading(false);
    }
  };

  // صفحة تسجيل الدخول إذا لم يكن هناك مستخدم (احتياطي؛ يتم التوجيه تلقائياً)
  if (!user) {
    return (
      <>
        <Header />
        <div className="checkout-page">
          <div className="container">
            <div className="login-required">
              <AlertCircle size={60} />
              <h2>يجب تسجيل الدخول أولاً</h2>
              <p>قم بتسجيل الدخول لإتمام عملية الشراء</p>
              <Link
                to="/login?redirect=/checkout"
                className="btn btn-primary btn-lg"
              >
                تسجيل الدخول
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="checkout-page">
        <div className="container">
          {/* خطوات الطلب */}
          <div className="checkout-steps">
            <div
              className={`step ${step >= 1 ? "active" : ""} ${step > 1 ? "completed" : ""}`}
            >
              <span className="step-number">
                {step > 1 ? <Check size={16} /> : "1"}
              </span>
              <span className="step-label">العنوان</span>
            </div>
            <div className="step-line"></div>
            <div
              className={`step ${step >= 2 ? "active" : ""} ${step > 2 ? "completed" : ""}`}
            >
              <span className="step-number">
                {step > 2 ? <Check size={16} /> : "2"}
              </span>
              <span className="step-label">الدفع</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 3 ? "active" : ""}`}>
              <span className="step-number">3</span>
              <span className="step-label">التأكيد</span>
            </div>
          </div>

          {step < 3 && (
            <div className="checkout-content">
              {/* الخطوة 1: العنوان */}
              {step === 1 && (
                <div className="checkout-form">
                  <div className="form-card">
                    <div className="card-header">
                      <MapPin size={22} />
                      <h2>عنوان التوصيل</h2>
                    </div>
                    <div className="form-body">
                      <div className="form-row">
                        <div className="form-group">
                          <label>الاسم الكامل *</label>
                          <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                fullName: e.target.value,
                              })
                            }
                            placeholder="الاسم الكامل"
                            className={errors.fullName ? "error" : ""}
                          />
                          {errors.fullName && (
                            <span className="error-text">
                              {errors.fullName}
                            </span>
                          )}
                        </div>
                        <div className="form-group">
                          <label>رقم الجوال *</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phone: e.target.value,
                              })
                            }
                            placeholder="05xxxxxxxx"
                            className={errors.phone ? "error" : ""}
                          />
                          {errors.phone && (
                            <span className="error-text">{errors.phone}</span>
                          )}
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>المدينة *</label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) =>
                              setFormData({ ...formData, city: e.target.value })
                            }
                            placeholder="مثال: الرياض"
                            className={errors.city ? "error" : ""}
                          />
                          {errors.city && (
                            <span className="error-text">{errors.city}</span>
                          )}
                        </div>
                        <div className="form-group">
                          <label>الحي *</label>
                          <input
                            type="text"
                            value={formData.district}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                district: e.target.value,
                              })
                            }
                            placeholder="مثال: حي النرجس"
                            className={errors.district ? "error" : ""}
                          />
                          {errors.district && (
                            <span className="error-text">
                              {errors.district}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>الشارع *</label>
                          <input
                            type="text"
                            value={formData.street}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                street: e.target.value,
                              })
                            }
                            placeholder="اسم الشارع"
                            className={errors.street ? "error" : ""}
                          />
                          {errors.street && (
                            <span className="error-text">{errors.street}</span>
                          )}
                        </div>
                        <div className="form-group">
                          <label>رقم المبنى (اختياري)</label>
                          <input
                            type="text"
                            value={formData.building}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                building: e.target.value,
                              })
                            }
                            placeholder="رقم المبنى أو الشقة"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>العنوان الوطني (اختياري)</label>
                        <input
                          type="text"
                          value={formData.nationalAddress}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              nationalAddress: e.target.value,
                            })
                          }
                          placeholder="مثال: RRRD2929"
                        />
                      </div>
                      <div className="form-group">
                        <label>ملاحظات إضافية (اختياري)</label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) =>
                            setFormData({ ...formData, notes: e.target.value })
                          }
                          placeholder="أي تعليمات خاصة للتوصيل..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <Link to="/cart" className="btn btn-outline">
                      <ArrowRight size={18} />
                      العودة للسلة
                    </Link>
                    <button
                      className="btn btn-primary"
                      onClick={handleNextStep}
                    >
                      التالي: طريقة الدفع
                    </button>
                  </div>
                </div>
              )}

              {/* الخطوة 2: الدفع */}
              {step === 2 && (
                <div className="checkout-form">
                  <div className="form-card">
                    <div className="card-header">
                      <CreditCard size={22} />
                      <h2>طريقة الدفع</h2>
                    </div>
                    <div className="form-body">
                      <div className="payment-options">
                        {paymentMethods
                          .filter((m) => m.enabled)
                          .map((method) => (
                            <label key={method.id} className="payment-option">
                              <input
                                type="radio"
                                name="paymentMethod"
                                value={method.id}
                                checked={formData.paymentMethod === method.id}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    paymentMethod: e.target.value,
                                  })
                                }
                              />
                              <div className="option-content">
                                {method.id === "cash" && <Truck size={24} />}
                                {method.id === "bank" && (
                                  <CreditCard size={24} />
                                )}
                                {method.id === "card" && (
                                  <CreditCard size={24} />
                                )}
                                {method.id === "emkan" && <Clock size={24} />}
                                {method.id === "tamara" && <Clock size={24} />}
                                <div>
                                  <strong>{method.name}</strong>
                                  {method.id === "cash" && (
                                    <span>ادفع نقداً عند استلام طلبك</span>
                                  )}
                                  {method.id === "bank" && (
                                    <span>تحويل إلى الحساب البنكي</span>
                                  )}
                                  {method.id === "card" && (
                                    <span>
                                      ادفع مباشرة ببطاقتك بشكل آمن عبر PayPal
                                    </span>
                                  )}
                                  {method.id === "emkan" && (
                                    <span>
                                      قسّم فاتورتك على 5 دفعات عبر إمكان
                                    </span>
                                  )}
                                  {method.id === "tamara" && (
                                    <span>
                                      قسّم فاتورتك على 3 دفعات عبر تمارا
                                    </span>
                                  )}
                                </div>
                              </div>
                            </label>
                          ))}
                      </div>

                      {formData.paymentMethod === "bank" && (
                        <div className="bank-details">
                          <h4>بيانات الحساب البنكي</h4>
                          <p>
                            <strong>البنك:</strong> البنك الأهلي
                          </p>
                          <p>
                            <strong>اسم الحساب:</strong>{" "}
                            {storeInfo.storeName || "متجري"}
                          </p>
                          <p>
                            <strong>رقم الآيبان:</strong>{" "}
                            SA0000000000000000000000
                          </p>
                          <p className="note">
                            يرجى إرسال إيصال التحويل عبر الواتساب
                          </p>
                        </div>
                      )}

                      {formData.paymentMethod === "card" && (
                        <div className="card-payment-details">
                          <PayPalCardForm
                            amount={total}
                            currency="SAR"
                            orderId={paypalReference}
                            items={cart.map((item) => ({
                              productId: item.product.id,
                              quantity: item.quantity,
                            }))}
                            onProcessing={setPaypalProcessing}
                            onSuccess={(capture) =>
                              handleSubmitOrder({
                                paypalOrderId: capture.paypalOrderId,
                                captureId: capture.captureId,
                              })
                            }
                            onError={(message) => showToast(message, "error")}
                          />
                        </div>
                      )}

                      {formData.paymentMethod === "emkan" && (
                        <div className="emkan-details">
                          <div className="emkan-info">
                            <h4>قسّمها على 5 دفعات مع إمكان</h4>
                            <div className="emkan-installments">
                              {[
                                "الدفعة 1",
                                "الدفعة 2",
                                "الدفعة 3",
                                "الدفعة 4",
                                "الدفعة 5",
                              ].map((label) => (
                                <div className="installment" key={label}>
                                  <span className="label">{label}</span>
                                  <span className="amount">
                                    {formatPrice(total / 5)}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <p className="emkan-note">
                              عند تأكيد الطلب سيُسجَّل كطلب قيد الانتظار،
                              وسيتواصل معك المتجر عبر واتساب لإرسال رابط الدفع
                              حتى تكمل التقسيط على 5 دفعات عبر إمكان.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      className="btn btn-outline"
                      onClick={() => setStep(1)}
                      disabled={loading || paypalProcessing}
                    >
                      <ArrowRight size={18} />
                      السابق
                    </button>
                    {/* الدفع بالبطاقة يتم من داخل نموذج PayPal نفسه، لذا لا
                        نعرض زر التأكيد اليدوي في هذه الحالة. */}
                    {formData.paymentMethod !== "card" && (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleSubmitOrder()}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader className="spinner" size={18} />
                            جاري إرسال الطلب...
                          </>
                        ) : formData.paymentMethod === "emkan" ? (
                          `تأكيد الطلب (قيد الانتظار) - ${formatPrice(total)}`
                        ) : (
                          `تأكيد الطلب - ${formatPrice(total)}`
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ملخص الطلب */}
              <div className="order-summary">
                <h3>ملخص الطلب</h3>
                <div className="summary-items">
                  {cart.map((item) => (
                    <div key={item.product.id} className="summary-item">
                      <img
                        src={
                          item.product.images?.[0] ||
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='120' height='120' fill='%23ece9e3'/%3E%3Cpath d='M28 82l22-28 15 17 11-13 16 24z' fill='%23c9c6bd'/%3E%3Ccircle cx='44' cy='42' r='9' fill='%23c9c6bd'/%3E%3C/svg%3E"
                        }
                        alt={item.product.name}
                      />
                      <div className="item-info">
                        <span className="item-name">{item.product.name}</span>
                        <span className="item-qty">
                          الكمية: {item.quantity}
                        </span>
                      </div>
                      <span className="item-price">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="summary-totals">
                  <div className="summary-row">
                    <span>المجموع الفرعي</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="summary-row">
                    <span>الشحن</span>
                    <span className={shipping === 0 ? "free" : ""}>
                      {shipping === 0 ? "مجاني" : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="summary-row total">
                    <span>الإجمالي</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
                <div className="shipping-info">
                  <Truck size={18} />
                  <span>
                    التوصيل خلال {shippingSettings.estimatedDays} أيام عمل
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* الخطوة 3: التأكيد */}
          {step === 3 && (
            <div className="order-success">
              <div className="success-icon">
                <Check size={60} />
              </div>
              <h1>تم استلام طلبك بنجاح!</h1>
              <p>شكراً لك على طلبك. سنتواصل معك قريباً لتأكيد الطلب.</p>

              <div className="order-actions">
                <Link to="/account" className="btn btn-primary">
                  <ShoppingBag size={18} />
                  تتبع طلباتي
                </Link>
                <Link to="/products" className="btn btn-outline">
                  متابعة التسوق
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;
