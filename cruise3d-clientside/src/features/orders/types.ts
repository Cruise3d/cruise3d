export type OrderStatus =
  | 'placed'
  | 'processing'
  | 'printing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface BillingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
}

export type PaymentMethod = 'credit-card' | 'upi' | 'cod';

export interface OrderItem {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  selectedFinish?: string;
  quantity: number;
  priceAtAddition: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  billingAddress: BillingAddress;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  shippingCarrier?: string;
}

export interface CheckoutFormData {
  billingAddress: BillingAddress;
  shippingAddress: ShippingAddress;
  sameAsBilling: boolean;
  paymentMethod: PaymentMethod;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  placed: 'Order Placed',
  processing: 'Processing',
  printing: 'Printing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  placed: 'bg-blue-100 text-blue-700 border-blue-200',
  processing: 'bg-amber-100 text-amber-700 border-amber-200',
  printing: 'bg-purple-100 text-purple-700 border-purple-200',
  shipped: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

export const ORDER_STATUS_TIMELINE: OrderStatus[] = [
  'placed',
  'processing',
  'printing',
  'shipped',
  'delivered',
];
