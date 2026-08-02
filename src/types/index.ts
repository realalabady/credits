// ==================== Product Variants ====================

export interface ProductVariantOption {
  name: string; // مثل "أحمر", "أزرق", "L", "XL"
  value: string; // القيمة المخزنة
  image?: string; // صورة هذا الخيار (للألوان مثلاً)
  images?: string[]; // صور متعددة لهذا الخيار (من أمازون)
}

export interface ProductVariantType {
  name: string; // "اللون", "المقاس", "السعة"
  nameEn?: string; // "Color", "Size", "Capacity"
  options: ProductVariantOption[];
}

export interface ProductVariant {
  id: string;
  sku?: string;
  options: Record<string, string>; // { "اللون": "أحمر", "المقاس": "L" }
  price?: number; // سعر خاص لهذا المتغير
  oldPrice?: number;
  stock: number;
  images: string[]; // صور هذا المتغير
}

// ==================== Main Product ====================

export interface Product {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  price: number;
  oldPrice?: number;
  images: string[];
  stock: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
  specs?: Record<string, string>;
  
  // المتغيرات (الألوان، المقاسات، إلخ)
  hasVariants?: boolean;
  variantTypes?: ProductVariantType[]; // أنواع المتغيرات
  variants?: ProductVariant[]; // قائمة المتغيرات

  // حقول إضافية للعرض
  brand?: string;
  rating?: number;
  reviewCount?: number;
  features?: string[];
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Address {
  fullName: string;
  phone: string;
  city: string;
  district: string;
  street: string;
  building?: string;
  nationalAddress?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: "customer" | "admin";
  addresses: Address[];
  createdAt: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariants?: Record<string, string>; // الخيارات المختارة (اللون، المقاس...)
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: Order[];
  monthlyRevenue: { month: string; revenue: number }[];
}
