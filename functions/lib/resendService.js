"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOwnerEmkanNotification = void 0;
const resend_1 = require("resend");
const admin = __importStar(require("firebase-admin"));
const formatPrice = (price) => `${new Intl.NumberFormat("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
}).format(price)} ر.س`;
/** اسم المتجر وبريد صاحبه، من stores/{storeId}/settings/store. */
const getStoreContact = async (storeId) => {
    try {
        const storeDoc = await admin
            .firestore()
            .doc(`stores/${storeId}/settings/store`)
            .get();
        const data = storeDoc.data() || {};
        const store = data.store || data;
        return {
            storeName: store.storeName || "متجرنا",
            ownerEmail: typeof store.storeEmail === "string" ? store.storeEmail.trim() : "",
        };
    }
    catch (_a) {
        return { storeName: "متجرنا", ownerEmail: "" };
    }
};
const buildTemplate = (order, storeName) => {
    const rows = order.items
        .map((item) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:left;">${formatPrice(item.price * item.quantity)}</td>
        </tr>`)
        .join("");
    return `
  <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
    <div style="background:#6c5ce7;color:#fff;padding:20px;border-radius:12px 12px 0 0;">
      <h2 style="margin:0;">طلب جديد عبر إمكان — بانتظار الدفع</h2>
      <p style="margin:6px 0 0;">${storeName}</p>
    </div>
    <div style="border:1px solid #eee;border-top:none;padding:20px;border-radius:0 0 12px 12px;">
      <p>وصل طلب جديد اختار فيه العميل الدفع عبر <strong>إمكان (تقسيط على 5 دفعات)</strong>.
      يرجى التواصل مع العميل عبر واتساب وإرسال رابط الدفع.</p>

      <h3 style="margin:20px 0 8px;">المبلغ المطلوب</h3>
      <p style="font-size:22px;font-weight:bold;color:#6c5ce7;margin:0;">${formatPrice(order.total)}</p>

      <h3 style="margin:20px 0 8px;">بيانات العميل</h3>
      <p style="margin:4px 0;"><strong>الاسم:</strong> ${order.customer}</p>
      <p style="margin:4px 0;"><strong>الجوال (واتساب):</strong> ${order.phone}</p>
      <p style="margin:4px 0;"><strong>البريد:</strong> ${order.email}</p>
      <p style="margin:4px 0;"><strong>العنوان:</strong> ${order.shippingAddress}</p>
      <p style="margin:4px 0;"><strong>رقم الطلب:</strong> ${order.id}</p>

      <h3 style="margin:20px 0 8px;">المنتجات</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:#f7f7f7;">
            <th style="padding:8px;text-align:right;">المنتج</th>
            <th style="padding:8px;text-align:center;">الكمية</th>
            <th style="padding:8px;text-align:left;">الإجمالي</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <table style="width:100%;margin-top:12px;font-size:14px;">
        ${order.subtotal != null
        ? `<tr><td style="padding:4px 8px;">المجموع الفرعي</td><td style="padding:4px 8px;text-align:left;">${formatPrice(order.subtotal)}</td></tr>`
        : ""}
        ${order.shippingCost != null
        ? `<tr><td style="padding:4px 8px;">الشحن</td><td style="padding:4px 8px;text-align:left;">${formatPrice(order.shippingCost)}</td></tr>`
        : ""}
        <tr><td style="padding:8px;font-weight:bold;">الإجمالي</td><td style="padding:8px;text-align:left;font-weight:bold;">${formatPrice(order.total)}</td></tr>
      </table>
    </div>
  </div>`;
};
const sendOwnerEmkanNotification = async (storeId, order) => {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    if (!apiKey) {
        console.log("Resend not configured (RESEND_API_KEY missing) - skipping owner notification");
        return { success: false, skipped: true };
    }
    // المستلم يخص المتجر نفسه؛ OWNER_EMAIL على مستوى المشروع احتياطي فقط،
    // فهو لا يصلح عندما تتشارك عدة متاجر نفس نشر الدوال.
    const { storeName, ownerEmail: storeOwnerEmail } = await getStoreContact(storeId);
    const ownerEmail = storeOwnerEmail || process.env.OWNER_EMAIL;
    if (!ownerEmail) {
        console.log(`No owner email for store ${storeId} (settings/store.storeEmail or OWNER_EMAIL) - skipping`);
        return { success: false, skipped: true };
    }
    try {
        const resend = new resend_1.Resend(apiKey);
        const { error } = await resend.emails.send({
            from: `${storeName} <${fromEmail}>`,
            to: ownerEmail,
            subject: `طلب إمكان جديد بانتظار الدفع — ${formatPrice(order.total)}`,
            html: buildTemplate(order, storeName),
        });
        if (error) {
            console.error("Resend owner notification error:", error);
            return { success: false, error: String(error.message || error) };
        }
        return { success: true };
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Failed to send owner Emkan notification:", message);
        return { success: false, error: message };
    }
};
exports.sendOwnerEmkanNotification = sendOwnerEmkanNotification;
//# sourceMappingURL=resendService.js.map