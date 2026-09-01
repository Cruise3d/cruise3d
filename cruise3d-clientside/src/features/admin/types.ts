export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: LowStockProduct[];
}

export interface LowStockProduct {
  id: string;
  title: string;
  stock: number;
  sku?: string;
}

export interface AdminProduct {
  id: string;
  title: string;
  description?: string;
  sku: string;
  price: number;
  stock: number;
  isInStock: boolean;
  material?: string;
  weightGrams?: number;
  dimensions?: string;
  estimatedDelivery?: string;
  colorType: 'fixed' | 'custom';
  defaultColorName?: string;
  defaultColorHex?: string;
  isFeatured: boolean;
  isBestseller: boolean;
  isActive: boolean;
  createdAt: string;
  categoryId?: string;
  categoryName?: string;
  primaryImageUrl?: string;
  images?: AdminProductImage[];
  colors?: AdminProductColor[];
  specs?: AdminProductSpec[];
  averageRating?: number;
  reviewCount?: number;
}

export interface AdminProductImage {
  id?: string;
  url: string;
  isPrimary?: boolean;
  sortOrder?: number;
  productColorId?: string;
}

export interface AdminProductColor {
  id?: string;
  colorName: string;
  colorHex: string;
  stockOverride?: number;
  sortOrder?: number;
}

export interface AdminProductSpec {
  id?: string;
  specKey: string;
  specValue: string;
  sortOrder?: number;
}
export interface AdminOrderAddress {
  fullName: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

export interface AdminOrderItem {
  id: string;
  productId: string;
  productTitle: string;
  productImageUrl?: string | null;
  quantity: number;
  priceAtPurchase: number;
  itemTotal: number;
  colorName?: string | null;
  colorHex?: string | null;
}

export interface AdminOrder {
  id: string;
  status: 'pending' | 'confirmed' | 'printing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'unpaid' | 'paid' | 'failed' | 'refunded';
  paymentId?: string | null;
  dtdcTrackingId?: string | null;
  subtotal: number;
  shippingCharge: number;
  totalAmount: number;
  placedAt: string;
  address: AdminOrderAddress;
  items: AdminOrderItem[];
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string;
  sortOrder?: number;
}

export interface AdminTestimonial {
  id: string;
  author: string;
  role?: string;
  rating: number;
  content: string;
  status: 'approved' | 'pending' | 'rejected';
  createdAt?: string;
}
