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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProducts = searchProducts;
exports.getProductDetail = getProductDetail;
exports.getProductVariants = getProductVariants;
exports.getProductInventory = getProductInventory;
exports.getCJCategories = getCJCategories;
exports.createCJOrder = createCJOrder;
exports.confirmCJOrder = confirmCJOrder;
exports.listCJOrders = listCJOrders;
exports.queryCJOrder = queryCJOrder;
exports.calculateFreight = calculateFreight;
exports.getTrackingInfo = getTrackingInfo;
exports.getCJBalance = getCJBalance;
exports.testConnection = testConnection;
const node_fetch_1 = __importDefault(require("node-fetch"));
const admin = __importStar(require("firebase-admin"));
const CJ_BASE_URL = "https://developers.cjdropshipping.com/api2.0/v1";
// إعدادات CJ خاصة بكل متجر: stores/{storeId}/settings/cjDropshipping.
// حساب CJ (والتوكن المخزّن معه) لا يُشارك بين المتاجر.
function cjSettingsRef(storeId) {
    return admin.firestore().doc(`stores/${storeId}/settings/cjDropshipping`);
}
// الحصول على التوكن من Firestore أو إنشاء واحد جديد
async function getValidAccessToken(storeId) {
    const settingsDoc = await cjSettingsRef(storeId).get();
    const settings = settingsDoc.data();
    if (!(settings === null || settings === void 0 ? void 0 : settings.email) || !(settings === null || settings === void 0 ? void 0 : settings.apiKey)) {
        throw new Error("بيانات CJ غير مُعدة. يرجى إدخال البريد ومفتاح API في إعدادات CJ.");
    }
    // التحقق من صلاحية التوكن الحالي
    if (settings.accessToken && settings.tokenExpiresAt) {
        const expiryDate = settings.tokenExpiresAt.toDate
            ? settings.tokenExpiresAt.toDate()
            : new Date(settings.tokenExpiresAt);
        if (expiryDate > new Date()) {
            return settings.accessToken;
        }
    }
    // محاولة تجديد التوكن
    if (settings.refreshToken) {
        try {
            const refreshed = await refreshAccessToken(settings.refreshToken);
            await cjSettingsRef(storeId).update({
                accessToken: refreshed.accessToken,
                refreshToken: refreshed.refreshToken,
                tokenExpiresAt: new Date(refreshed.accessTokenExpiryDate),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return refreshed.accessToken;
        }
        catch (_a) {
            // فشل التجديد، نحصل على توكن جديد
        }
    }
    // الحصول على توكن جديد
    const tokens = await getNewAccessToken(settings.email, settings.apiKey);
    await cjSettingsRef(storeId).update({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: new Date(tokens.accessTokenExpiryDate),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return tokens.accessToken;
}
// الحصول على توكن جديد من CJ باستخدام البريد ومفتاح API
async function getNewAccessToken(email, password) {
    console.log("CJ Auth: requesting new access token with email:", email);
    const response = await (0, node_fetch_1.default)(`${CJ_BASE_URL}/authentication/getAccessToken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    console.log("CJ Auth response:", JSON.stringify({
        result: data.result,
        code: data.code,
        message: data.message,
        hasData: !!data.data,
    }));
    if (!data.result || data.code !== 200) {
        throw new Error(`فشل الحصول على توكن CJ: ${data.message || "خطأ غير معروف"} (code: ${data.code})`);
    }
    return data.data;
}
// تجديد التوكن
async function refreshAccessToken(refreshToken) {
    const response = await (0, node_fetch_1.default)(`${CJ_BASE_URL}/authentication/refreshAccessToken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
    });
    const data = await response.json();
    if (!data.result || data.code !== 200) {
        throw new Error("فشل تجديد توكن CJ");
    }
    return data.data;
}
// طلب عام مع التوكن
async function cjRequest(storeId, endpoint, method = "GET", body, queryParams) {
    const token = await getValidAccessToken(storeId);
    let url = `${CJ_BASE_URL}${endpoint}`;
    if (queryParams) {
        const params = new URLSearchParams(queryParams);
        url += `?${params.toString()}`;
    }
    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
            "CJ-Access-Token": token,
        },
    };
    if (body && (method === "POST" || method === "PATCH")) {
        options.body = JSON.stringify(body);
    }
    const response = await (0, node_fetch_1.default)(url, options);
    const data = await response.json();
    return data;
}
// ==================== Products ====================
async function searchProducts(storeId, params) {
    return cjRequest(storeId, "/product/list", "GET", undefined, {
        pageNum: String(params.pageNum || 1),
        pageSize: String(params.pageSize || 20),
        ...(params.productNameEn && { productNameEn: params.productNameEn }),
        ...(params.categoryKeyword && { categoryKeyword: params.categoryKeyword }),
        ...(params.categoryId && { categoryId: params.categoryId }),
    });
}
async function getProductDetail(storeId, pid) {
    return cjRequest(storeId, "/product/query", "GET", undefined, { pid });
}
async function getProductVariants(storeId, pid) {
    return cjRequest(storeId, "/product/variant/query", "GET", undefined, { pid });
}
async function getProductInventory(storeId, vid) {
    return cjRequest(storeId, "/product/stock/queryByVid", "GET", undefined, { vid });
}
async function getCJCategories(storeId) {
    return cjRequest(storeId, "/product/getCategory", "GET");
}
// ==================== Orders ====================
async function createCJOrder(storeId, orderData) {
    return cjRequest(storeId, "/shopping/order/createOrderV2", "POST", {
        ...orderData,
        payType: 2, // Balance payment
    });
}
async function confirmCJOrder(storeId, orderId) {
    return cjRequest(storeId, "/shopping/order/confirmOrder", "PATCH", { orderId });
}
async function listCJOrders(storeId, params) {
    return cjRequest(storeId, "/shopping/order/list", "GET", undefined, {
        pageNum: String(params.pageNum || 1),
        pageSize: String(params.pageSize || 20),
        ...(params.orderStatus && { orderStatus: params.orderStatus }),
    });
}
async function queryCJOrder(storeId, orderId) {
    return cjRequest(storeId, "/shopping/order/getOrderDetail", "GET", undefined, {
        orderId,
    });
}
// ==================== Logistics ====================
async function calculateFreight(storeId, params) {
    return cjRequest(storeId, "/logistic/freightCalculate", "POST", params);
}
async function getTrackingInfo(storeId, trackNumber) {
    return cjRequest(storeId, "/logistic/getTrackInfo", "GET", undefined, { trackNumber });
}
// ==================== Payment ====================
async function getCJBalance(storeId) {
    return cjRequest(storeId, "/shopping/pay/getBalance", "GET");
}
// ==================== Test Connection ====================
async function testConnection(storeId, email, apiKey) {
    try {
        console.log("Testing CJ connection with email:", email);
        const tokens = await getNewAccessToken(email, apiKey);
        if (tokens.accessToken) {
            // حفظ التوكن في Firestore بعد النجاح
            await cjSettingsRef(storeId).set({
                email,
                ...(apiKey && { apiKey }),
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                tokenExpiresAt: new Date(tokens.accessTokenExpiryDate),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
            console.log("CJ connection test SUCCESS - tokens saved to Firestore");
            return { success: true, message: "تم الاتصال بنجاح مع CJ Dropshipping!" };
        }
        console.log("CJ connection test FAILED - no access token in response");
        return { success: false, message: "فشل الاتصال - لم يتم استلام توكن" };
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : "خطأ غير متوقع";
        console.error("CJ connection test ERROR:", msg);
        return { success: false, message: msg };
    }
}
//# sourceMappingURL=cjClient.js.map