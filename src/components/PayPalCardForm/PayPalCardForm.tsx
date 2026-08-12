import React, { useEffect, useRef, useState } from "react";
import { CreditCard, Loader, AlertCircle, Lock } from "lucide-react";
import {
  createPayPalOrder,
  capturePayPalOrder,
} from "../../services/paypal";
import "./PayPalCardForm.css";

// نفس سعر التحويل المستخدم في الخادم (functions/src/paypalClient.ts).
// PayPal لا يدعم الريال، فيُحوَّل المبلغ إلى الدولار قبل الدفع.
const SAR_TO_USD = 0.27;

// تحميل SDK مرة واحدة لكل الصفحة. سابقاً كان كل تركيب للمكوّن يحذف الوسم
// ويعيد إضافته، فينتج زرّان عند تركيب React للمكوّن مرتين (StrictMode).
let sdkPromise: Promise<void> | null = null;

function loadPayPalSDK(): Promise<void> {
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    if (!clientId) {
      reject(new Error("PayPal Client ID غير موجود"));
      return;
    }

    if ((window as any).paypal) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&components=buttons,funding-eligibility&locale=ar_SA`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      sdkPromise = null; // اسمح بإعادة المحاولة عند فشل الشبكة
      reject(new Error("فشل تحميل PayPal"));
    };
    document.body.appendChild(script);
  });

  return sdkPromise;
}

interface PayPalCardFormProps {
  amount: number;
  currency?: string;
  orderId: string;
  items: { productId: string; quantity: number }[];
  onSuccess: (captureData: {
    paypalOrderId: string;
    captureId: string;
    status: string;
  }) => void;
  onError: (error: string) => void;
  onProcessing?: (isProcessing: boolean) => void;
}

const PayPalCardForm: React.FC<PayPalCardFormProps> = ({
  amount,
  currency = "SAR",
  orderId,
  items,
  onSuccess,
  onError,
  onProcessing,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // الزر يُركَّب مرة واحدة، بينما المبلغ والسلة قد يتغيّران. نحتفظ بأحدث القيم
  // في مراجع ليقرأها createOrder لحظة الضغط بدل إعادة بناء الزر كلما تغيّرت.
  const latest = useRef({
    amount,
    currency,
    orderId,
    items,
    onSuccess,
    onError,
    onProcessing,
  });
  latest.current = {
    amount,
    currency,
    orderId,
    items,
    onSuccess,
    onError,
    onProcessing,
  };

  const usdAmount = (amount * SAR_TO_USD).toFixed(2);

  useEffect(() => {
    let cancelled = false;
    let instance: { close?: () => void } | null = null;

    const initCardButton = async () => {
      try {
        await loadPayPalSDK();
        if (cancelled) return;

        const paypal = (window as any).paypal;
        const container = containerRef.current;
        if (!paypal || !container) return;

        // نظّف أي زر سابق قبل الرسم حتى لا تتراكم الأزرار.
        container.innerHTML = "";

        const buttons = paypal.Buttons({
          fundingSource: paypal.FUNDING.CARD,
          style: {
            layout: "vertical",
            color: "black",
            shape: "rect",
            label: "pay",
            height: 50,
          },
          createOrder: async () => {
            const l = latest.current;
            try {
              l.onProcessing?.(true);
              setError(null);

              const result = await createPayPalOrder({
                amount: l.amount,
                currency: l.currency,
                orderId: l.orderId,
                items: l.items,
                description: `طلب #${l.orderId}`,
              });
              return result.id;
            } catch (err: any) {
              console.error("Create order error:", err);
              const msg = err.message || "خطأ في إنشاء طلب الدفع";
              setError(msg);
              l.onProcessing?.(false);
              throw err;
            }
          },
          onApprove: async (data: { orderID: string }) => {
            const l = latest.current;
            try {
              l.onProcessing?.(true);
              // ملاحظة: طلب Firestore يُنشأ بعد نجاح الالتقاط في هذا التدفق،
              // لذا لا نمرر firestoreOrderId هنا. التحقق يتم عبر سجل الدفع المعلّق.
              const result = await capturePayPalOrder({
                paypalOrderId: data.orderID,
              });

              if (result.status === "COMPLETED") {
                l.onSuccess({
                  paypalOrderId: data.orderID,
                  captureId: result.captureId,
                  status: result.status,
                });
              } else {
                throw new Error("لم يكتمل الدفع");
              }
            } catch (err: any) {
              console.error("Capture error:", err);
              const msg = err.message || "خطأ في تأكيد الدفع";
              setError(msg);
              l.onError(msg);
            } finally {
              l.onProcessing?.(false);
            }
          },
          onCancel: () => {
            setError("تم إلغاء عملية الدفع");
            latest.current.onProcessing?.(false);
          },
          onError: (err: any) => {
            console.error("Card button error:", err);
            setError("حدث خطأ في معالجة البطاقة");
            latest.current.onError("حدث خطأ في معالجة البطاقة");
            latest.current.onProcessing?.(false);
          },
        });

        instance = buttons;
        await buttons.render(container);

        // قد يُفكَّك المكوّن أثناء الرسم — عندها ننظّف ما رُسم للتو.
        if (cancelled) {
          container.innerHTML = "";
          return;
        }
        setLoading(false);
      } catch (err: any) {
        if (cancelled) return;
        console.error("PayPal Card init error:", err);
        setError(err.message || "خطأ في تهيئة نموذج الدفع");
        setLoading(false);
      }
    };

    initCardButton();

    return () => {
      cancelled = true;
      try {
        instance?.close?.();
      } catch {
        // close() يرمي أحياناً إذا لم يكتمل الرسم — لا يضر تجاهله.
      }
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, []);

  return (
    <div className="paypal-card-form">
      <div className="card-form-header">
        <CreditCard size={20} />
        <span>ادفع بالبطاقة</span>
        <div className="card-brands">
          <img
            src="https://www.paypalobjects.com/webstatic/mktg/logo/AM_mc_vs_dc_ae.jpg"
            alt="Visa Mastercard Amex"
            loading="lazy"
          />
        </div>
      </div>

      <div className="currency-notice">
        <span className="sar-amount">{amount.toFixed(2)} ر.س</span>
        <span className="usd-equivalent">≈ ${usdAmount} USD</span>
      </div>

      {error && (
        <div className="card-form-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="paypal-loading">
          <Loader className="spinner" size={24} />
          <span>جاري تحميل نموذج الدفع...</span>
        </div>
      )}

      <div ref={containerRef} className="paypal-card-button-container"></div>

      <p className="card-form-note">
        <Lock size={14} />
        <span>معاملة آمنة ومشفرة - بياناتك محمية</span>
      </p>
    </div>
  );
};

export default PayPalCardForm;
