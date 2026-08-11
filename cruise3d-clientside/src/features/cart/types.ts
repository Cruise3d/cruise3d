import type { Product } from '../products/types';

export interface CartItem {
  id: string;
  /** Server-side cart item id (currently same as id). Kept for clarity. */
  cartItemId: string;
  product: Product;
  quantity: number;
  selectedFinish?: string;
  priceAtAddition: number;
}

export interface CartSummaryData {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}
