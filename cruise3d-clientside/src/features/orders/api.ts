import axiosClient from '@/api/axiosClient';

import type { CheckoutFormData, Order, OrderStatus, VerifyPaymentResponse } from './types';
import type { AddressId } from '../profile/types';

export type CreateOrderPayload = CheckoutFormData;

export interface AdminOrderQueryParams {
  status?: OrderStatus;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}

export async function createOrder(payload: CreateOrderPayload) {
  return axiosClient.post<Order>('/orders', payload);
}

export interface RazorpayOrderResponse {
  key: string; // Razorpay key (publishable)
  orderId: string; // Razorpay order id
  amount: number; // amount in smallest currency unit or as documented by backend
  currency: string;
  checkoutSummary?: unknown;
  // Backend may create and return an addressId to be used during verification
  addressId?: AddressId;
}

export interface CreateRazorpayOrderPayload {
  addressId?: AddressId;
}

/**
 * Payments (Razorpay) integration
 * The backend exposes two endpoints used by the frontend flow:
 *  - POST /payments/create-order  -> returns razorpay key, order id, amount, currency, checkout summary and an addressId
 *  - POST /payments/verify        -> verifies razorpay signature and returns the created Order
 */
export async function createRazorpayOrder(payload: CreateRazorpayOrderPayload = {}) {
  return axiosClient.post<RazorpayOrderResponse, CreateRazorpayOrderPayload>(
    '/payments/create-order',
    payload
  );
}

export interface VerifyPaymentPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  addressId: AddressId;
}

export async function verifyPayment(payload: VerifyPaymentPayload) {
  return axiosClient.post<VerifyPaymentResponse>('/payments/verify', payload);
}

export async function getMyOrders() {
  return axiosClient.get<Order[]>('/orders/my');
}

export async function getMyOrderById(orderId: string) {
  return axiosClient.get<Order>(`/orders/my/${orderId}`);
}

export async function getAdminOrders(params?: AdminOrderQueryParams) {
  return axiosClient.get<Order[]>('/orders', { params });
}

export async function updateOrderStatus(orderId: string, payload: UpdateOrderStatusPayload) {
  return axiosClient.put<Order>(`/orders/${orderId}/status`, payload);
}
