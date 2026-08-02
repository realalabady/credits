import {
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  Timestamp,
  increment,
} from "firebase/firestore";
import { storeCol, storeDoc, STORE_ID } from "../config/store";
import type { Product } from "../types";

// كل المسارات هنا مقيّدة بمتجر واحد (stores/{STORE_ID}/...) عبر storeCol/storeDoc.
// لا تستخدم collection(db, "...") مباشرة: المسارات العامة مشتركة بين كل المتاجر.

// onSnapshot بلا معالج أخطاء يطبع "Uncaught Error in snapshot listener" بلا أي
// إشارة إلى المسار الفاشل، وهو عديم الفائدة عند تشخيص صلاحيات متعددة المتاجر.
// هذا المعالج يذكر المجموعة والمتجر بالضبط.
const snapshotError = (path: string) => (error: Error) => {
  console.error(
    `[Firestore] فشل الاشتراك في stores/${STORE_ID}/${path}:`,
    error.message,
  );
};

// ==================== Products ====================

export const productsCollection = storeCol("products");

export const getProducts = async (): Promise<Product[]> => {
  const snapshot = await getDocs(
    query(productsCollection, orderBy("createdAt", "desc")),
  );
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  })) as Product[];
};

export const addProduct = async (
  product: Omit<Product, "id">,
): Promise<string> => {
  const docRef = await addDoc(productsCollection, {
    ...product,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateProduct = async (
  id: string,
  product: Partial<Product>,
): Promise<void> => {
  const docRef = storeDoc("products", id);
  await updateDoc(docRef, {
    ...product,
    updatedAt: Timestamp.now(),
  });
};

export const deleteProduct = async (id: string): Promise<void> => {
  const docRef = storeDoc("products", id);
  await deleteDoc(docRef);
};

export const decrementStock = async (
  productId: string,
  quantity: number,
): Promise<void> => {
  const docRef = storeDoc("products", productId);
  await updateDoc(docRef, {
    stock: increment(-quantity),
    updatedAt: Timestamp.now(),
  });
};

export const subscribeToProducts = (
  callback: (products: Product[]) => void,
) => {
  return onSnapshot(
    query(productsCollection, orderBy("createdAt", "desc")),
    (snapshot) => {
      const products = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Product[];
      callback(products);
    },
    snapshotError("products"),
  );
};

// ==================== Orders ====================

export const ordersCollection = storeCol("orders");

export interface FirestoreOrder {
  id: string;
  userId?: string;
  customer: string;
  email: string;
  phone: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }[];
  total: number;
  subtotal?: number;
  shippingCost?: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  paymentStatus?: "pending" | "paid";
  paypalOrderId?: string;
  paypalCaptureId?: string;
  paidAt?: Date;
  shippingAddress: string;
  address?: {
    fullName: string;
    phone: string;
    city: string;
    district: string;
    street: string;
    building?: string;
    nationalAddress?: string;
  };
  notes?: string;
  // حقول الشحن
  trackingNumber?: string;
  trackingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const getOrders = async (): Promise<FirestoreOrder[]> => {
  const snapshot = await getDocs(
    query(ordersCollection, orderBy("createdAt", "desc")),
  );
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  })) as FirestoreOrder[];
};

export const addOrder = async (
  order: Omit<FirestoreOrder, "id">,
): Promise<string> => {
  const docRef = await addDoc(ordersCollection, {
    ...order,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateOrderStatus = async (
  id: string,
  status: FirestoreOrder["status"],
): Promise<void> => {
  const docRef = storeDoc("orders", id);
  await updateDoc(docRef, {
    status,
    updatedAt: Timestamp.now(),
  });
};

export const updateOrderData = async (
  id: string,
  data: Partial<FirestoreOrder>,
): Promise<void> => {
  const docRef = storeDoc("orders", id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

export const subscribeToOrders = (
  callback: (orders: FirestoreOrder[]) => void,
) => {
  return onSnapshot(
    query(ordersCollection, orderBy("createdAt", "desc")),
    (snapshot) => {
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as FirestoreOrder[];
      callback(orders);
    },
    snapshotError("orders"),
  );
};

export const deleteOrder = async (id: string): Promise<void> => {
  const docRef = storeDoc("orders", id);
  await deleteDoc(docRef);
};

// Aliases for consistent naming
export const addProductToFirestore = addProduct;
export const updateProductInFirestore = updateProduct;
export const deleteProductFromFirestore = deleteProduct;
export const updateOrderStatusInFirestore = updateOrderStatus;

// Export Order type alias
export type Order = FirestoreOrder;

// ==================== Users ====================

import type { User } from "../types";

export const usersCollection = storeCol("users");

export const getUser = async (userId: string): Promise<User | null> => {
  const docRef = storeDoc("users", userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate() || new Date(),
    } as User;
  }
  return null;
};

export const getUserById = async (userId: string): Promise<User | null> => {
  const docRef = storeDoc("users", userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate() || new Date(),
    } as User;
  }
  return null;
};

export const createOrUpdateUser = async (user: User): Promise<void> => {
  const docRef = storeDoc("users", user.id);
  await setDoc(
    docRef,
    {
      email: user.email,
      name: user.name,
      phone: user.phone || "",
      role: user.role,
      addresses: user.addresses || [],
      createdAt: Timestamp.now(),
    },
    { merge: true },
  );
};

export const updateUserRole = async (
  userId: string,
  role: "customer" | "admin",
): Promise<void> => {
  const docRef = storeDoc("users", userId);
  await updateDoc(docRef, { role });
};

export const getAllUsers = async (): Promise<User[]> => {
  const snapshot = await getDocs(
    query(usersCollection, orderBy("createdAt", "desc")),
  );
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as User[];
};

export const subscribeToUsers = (callback: (users: User[]) => void) => {
  return onSnapshot(
    query(usersCollection, orderBy("createdAt", "desc")),
    (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as User[];
      callback(users);
    },
    snapshotError("users"),
  );
};

// ==================== User Orders ====================

export const getUserOrders = async (
  userId: string,
): Promise<FirestoreOrder[]> => {
  try {
    // محاولة الاستعلام مع الترتيب (يحتاج فهرس مركب)
    const q = query(
      ordersCollection,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as FirestoreOrder[];
  } catch (error: any) {
    // إذا فشل بسبب عدم وجود الفهرس، نستخدم استعلام بدون ترتيب
    console.warn("getUserOrders: Falling back to unordered query", error.message);
    if (error.code === "failed-precondition" || error.message?.includes("index")) {
      const q = query(
        ordersCollection,
        where("userId", "==", userId),
      );
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as FirestoreOrder[];
      // ترتيب يدوياً
      return orders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    throw error;
  }
};

export const subscribeToUserOrders = (
  userId: string,
  callback: (orders: FirestoreOrder[]) => void,
  onError?: (error: Error) => void,
) => {
  const q = query(
    ordersCollection,
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as FirestoreOrder[];
      callback(orders);
    },
    (error) => {
      console.error("subscribeToUserOrders error:", error);
      if (onError) {
        onError(error);
      }
    }
  );
};

// ==================== Settings ====================

export interface StoreSettings {
  store?: {
    storeName: string;
    storeEmail: string;
    storePhone: string;
    storeAddress: string;
    currency: string;
    language: string;
  };
  shipping?: {
    freeShippingThreshold: number;
    defaultShippingCost: number;
    enableFreeShipping: boolean;
    estimatedDays: string;
  };
  notifications?: {
    orderNotifications: boolean;
    lowStockAlert: boolean;
    customerMessages: boolean;
    marketingEmails: boolean;
    lowStockThreshold: number;
  };
  payment?: {
    methods: { id: string; name: string; enabled: boolean }[];
  };
  updatedAt?: Date;
}

export const getSettings = async (): Promise<StoreSettings | null> => {
  const docRef = storeDoc("settings", "store");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as StoreSettings;
  }
  return null;
};

export const updateSettings = async (
  settings: Partial<StoreSettings>,
): Promise<void> => {
  const docRef = storeDoc("settings", "store");
  await setDoc(
    docRef,
    {
      ...settings,
      updatedAt: Timestamp.now(),
    },
    { merge: true },
  );
};

export const subscribeToSettings = (
  callback: (settings: StoreSettings | null) => void,
) => {
  const docRef = storeDoc("settings", "store");
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as StoreSettings);
      } else {
        callback(null);
      }
    },
    snapshotError("settings/store"),
  );
};

// ==================== Email (SMTP) Settings ====================
// Stored in a separate, admin-only `settings/email` document so SMTP
// credentials are NEVER exposed to public visitors.

export interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
}

export const getEmailSettings = async (): Promise<EmailSettings | null> => {
  const docRef = storeDoc("settings", "email");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as EmailSettings;
  }
  return null;
};

export const updateEmailSettings = async (
  settings: Partial<EmailSettings>,
): Promise<void> => {
  const docRef = storeDoc("settings", "email");
  await setDoc(
    docRef,
    {
      ...settings,
      updatedAt: Timestamp.now(),
    },
    { merge: true },
  );
};

// ==================== Contact Messages ====================

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export const addContactMessage = async (
  message: Omit<ContactMessage, "id" | "read" | "createdAt">,
): Promise<string> => {
  const docRef = await addDoc(storeCol("contactMessages"), {
    ...message,
    read: false,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const subscribeToContactMessages = (
  callback: (messages: ContactMessage[]) => void,
) => {
  return onSnapshot(
    query(storeCol("contactMessages"), orderBy("createdAt", "desc")),
    (snapshot) => {
      const messages = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate() || new Date(),
      })) as ContactMessage[];
      callback(messages);
    },
    snapshotError("contactMessages"),
  );
};

export const markMessageRead = async (id: string): Promise<void> => {
  const docRef = storeDoc("contactMessages", id);
  await updateDoc(docRef, { read: true });
};

export const deleteContactMessage = async (id: string): Promise<void> => {
  const docRef = storeDoc("contactMessages", id);
  await deleteDoc(docRef);
};
