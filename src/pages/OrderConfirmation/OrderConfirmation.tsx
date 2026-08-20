import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CheckCircle, Loader, ShoppingBag, Package } from "lucide-react";
import { getDoc } from "firebase/firestore";
import { storeDoc } from "../../config/store";
import { authorizeTamaraOrder, getTamaraPaymentStatus } from "../../services/tamara";
import { useStore } from "../../store/useStore";
import "./OrderConfirmation.css";

interface ConfirmationOrder {
  id: string;
  total?: number;
  paymentStatus?: string;
  status?: string;
  customer?: string;
  paymentMethod?: string;
  tamaraCheckoutId?: string;
  tamaraOrderId?: string;
  tamaraStatus?: string;
}

const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { storeInfo } = useStore();
  const [order, setOrder] = useState<ConfirmationOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [tamaraError, setTamaraError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(storeDoc("orders", orderId));
        if (!snap.exists()) {
          return;
        }

        let loadedOrder = { id: snap.id, ...snap.data() } as ConfirmationOrder;
        const tamaraReturn = new URLSearchParams(window.location.search).get("tamara");

        if (
          tamaraReturn === "success" &&
          loadedOrder.paymentMethod === "tamara" &&
          loadedOrder.paymentStatus !== "paid"
        ) {
          const checkoutId =
            new URLSearchParams(window.location.search).get("checkout_id") ||
            loadedOrder.tamaraCheckoutId;
          if (!checkoutId) {
            throw new Error("لم يتم العثور على معرف جلسة تمارا");
          }

          const payment = await getTamaraPaymentStatus(checkoutId);
          const status = payment.status.toLowerCase();
          const completedStatuses = [
            "authorised",
            "authorized",
            "captured",
            "fully_captured",
            "completed",
          ];
          if (!completedStatuses.includes(status)) {
            await authorizeTamaraOrder(
              payment.order_id,
              loadedOrder.id,
              loadedOrder.id,
            );
          }

          const updatedSnap = await getDoc(storeDoc("orders", loadedOrder.id));
          if (updatedSnap.exists()) {
            loadedOrder = {
              id: updatedSnap.id,
              ...updatedSnap.data(),
            } as ConfirmationOrder;
          }
        } else if (tamaraReturn === "failure" || tamaraReturn === "cancel") {
          setTamaraError(
            tamaraReturn === "cancel"
              ? "تم إلغاء عملية الدفع في تمارا. يمكنك إعادة المحاولة من طلباتك."
              : "لم تكتمل عملية الدفع في تمارا. يمكنك إعادة المحاولة من طلباتك.",
          );
        }

        if (active) {
          setOrder(loadedOrder);
        }
      } catch (err) {
        console.error("Error loading order confirmation:", err);
        if (active) {
          setTamaraError(
            err instanceof Error
              ? err.message
              : "تعذر التحقق من حالة الدفع في تمارا",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [orderId]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: storeInfo.currency || "SAR",
    }).format(price);

  const orderNumber = orderId ? orderId.slice(-8).toUpperCase() : "";

  return (
    <div className="order-confirmation-page">
      <div className="container">
        <div className="confirmation-card">
          {loading ? (
            <div className="confirmation-loading">
              <Loader className="spinner" size={40} aria-hidden="true" />
              <p>جاري تحميل تفاصيل الطلب…</p>
            </div>
          ) : (
            <>
              <div className="confirmation-icon" aria-hidden="true">
                <CheckCircle size={72} />
              </div>
              <h1>تم استلام طلبك بنجاح!</h1>
              <p className="confirmation-subtitle">
                شكراً لك على الشراء من {storeInfo.storeName || "متجرنا"}
              </p>

              <div className="confirmation-order-box">
                <span className="label">رقم الطلب</span>
                <span className="order-number">#{orderNumber}</span>
              </div>

              {order?.total != null && (
                <div className="confirmation-total">
                  <Package size={18} aria-hidden="true" />
                  <span>الإجمالي: </span>
                  <strong>{formatPrice(order.total)}</strong>
                </div>
              )}

              {order?.paymentStatus === "paid" && (
                <div className="confirmation-paid">تم الدفع بنجاح ✓</div>
              )}

              {tamaraError && (
                <div className="confirmation-pending">{tamaraError}</div>
              )}

              {order?.paymentMethod === "emkan" && (
                <div className="confirmation-pending">
                  طلبك قيد الانتظار. سيتواصل معك المتجر عبر واتساب لإرسال رابط
                  الدفع حتى تكمل التقسيط على 5 دفعات عبر إمكان.
                </div>
              )}

              <div className="confirmation-actions">
                <Link to="/account" className="btn btn-primary">
                  عرض طلباتي
                </Link>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate("/products")}
                >
                  <ShoppingBag size={18} aria-hidden="true" />
                  مواصلة التسوق
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
