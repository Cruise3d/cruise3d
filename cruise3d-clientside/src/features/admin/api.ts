import axiosClient from '@/api/axiosClient';

import type {
  AdminCategory,
  AdminOrder,
  AdminProduct,
  AdminTestimonial,
  DashboardStats,
} from './types';

// Dashboard
export async function fetchDashboardStats() {
  return axiosClient.get<DashboardStats>('/admin/dashboard');
}

// Products - Admin
export interface AdminProductsResponse {
  items: AdminProduct[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function fetchAdminProducts(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  return axiosClient.get<AdminProductsResponse>('/products', {
    params: { ...params },
  });
}

export async function fetchProductById(id: string) {
  return axiosClient.get<AdminProduct>(`/products/${id}`);
}

export interface ProductUpdatePayload {
  title?: string;
  sku?: string;
  price?: number;
  stock?: number;
  categoryId?: string;
  description?: string;
  material?: string;
  weightGrams?: number;
  dimensions?: string;
  estimatedDelivery?: string;
  colorType?: 'fixed' | 'custom';
  defaultColorName?: string;
  defaultColorHex?: string;
  colors?: Array<{
    colorName: string;
    colorHex: string;
    stockOverride?: number;
    sortOrder?: number;
  }>;
  specs?: Array<{
    specKey: string;
    specValue: string;
    sortOrder?: number;
  }>;
  isFeatured?: boolean;
  isBestseller?: boolean;
  isActive?: boolean;
}

export async function updateProduct(id: string, payload: ProductUpdatePayload) {
  return axiosClient.put<AdminProduct>(`/products/${id}`, payload);
}

export async function deleteProduct(id: string) {
  return axiosClient.delete<void>(`/products/${id}`);
}

export interface CloudinarySignatureResponse {
  cloudName: string;
  apiKey: string;
  timestamp: string;
  signature: string;
  folder: string;
}

export async function fetchCloudinarySignature(data: string, folder = 'cruise3d/products') {
  return axiosClient.get<CloudinarySignatureResponse>('/upload/signature', {
    params: { data, folder },
  });
}

// Categories - Admin
export async function fetchAdminCategories() {
  return axiosClient.get<AdminCategory[]>('/categories');
}

export interface CategoryPayload {
  name: string;
  slug?: string;
  iconUrl?: string;
}

export async function createCategory(payload: CategoryPayload) {
  return axiosClient.post<AdminCategory>('/categories', payload);
}

export async function updateCategory(id: string, payload: CategoryPayload) {
  return axiosClient.put<AdminCategory>(`/categories/${id}`, payload);
}

export async function deleteCategory(id: string) {
  return axiosClient.delete<void>(`/categories/${id}`);
}

// Orders - Admin
export interface AdminOrdersResponse {
  items: AdminOrder[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function fetchAdminOrders(params?: {
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  return axiosClient.get<AdminOrdersResponse>('/orders', { params });
}

export interface OrderStatusUpdatePayload {
  status: 'pending' | 'confirmed' | 'printing' | 'shipped' | 'delivered' | 'cancelled';
}

export async function updateOrderStatus(
  orderId: string,
  payload: OrderStatusUpdatePayload
) {
  return axiosClient.put<AdminOrder>(`/orders/${orderId}/status`, payload);
}

export interface OrderTrackingUpdatePayload {
  dtdcTrackingId: string | null;
}

export async function updateOrderTracking(
  orderId: string,
  payload: OrderTrackingUpdatePayload
) {
  return axiosClient.put<AdminOrder>(`/orders/${orderId}/tracking`, payload);
}

// Testimonials - Admin (placeholder)
export async function fetchAdminTestimonials() {
  // Placeholder - returns empty array as API is not implemented
  return Promise.resolve([] as AdminTestimonial[]);
}

export async function approveTestimonial(_id: string) {
  // Placeholder - API not implemented
  return Promise.resolve();
}
