import axiosClient from '@/api/axiosClient';

import type { CartItem } from './types';

export interface AddToCartPayload {
  productId: string;
  quantity: number;
  colorId?: string;
  selectedFinish?: string;
}

export interface UpdateCartItemPayload {
  quantity: number;
}

export async function getCart() {
  // The backend may return either an array of items or a wrapper object { items, subtotal, totalItems }.
  // axiosClient already unwraps ApiResponse -> data, so `res` can be either shape. Normalize to always return the items array.
  const res = await axiosClient.get<unknown>('/cart');
  if (Array.isArray(res)) return res as unknown as CartItem[];
  if (res && typeof res === 'object' && Array.isArray((res as any).items)) return (res as any).items as CartItem[];
  return [] as CartItem[];
}

export async function addToCart(payload: AddToCartPayload) {
  return axiosClient.post<CartItem>('/cart', payload);
}

export async function updateCartItem(cartId: string, payload: UpdateCartItemPayload) {
  return axiosClient.put<CartItem>(`/cart/${cartId}`, payload);
}

export async function removeCartItem(cartId: string) {
  return axiosClient.delete<void>(`/cart/${cartId}`);
}

export async function clearCart() {
  return axiosClient.delete<void>('/cart');
}
