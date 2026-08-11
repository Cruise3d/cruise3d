import axiosClient from '@/api/axiosClient';
import type { PaginatedResponse } from '@/types/api';

import { normalizeProduct, normalizeProducts } from './normalizeProduct';
import type { Product } from './types';

export interface ProductColorInput {
  colorName: string;
  colorHex: string;
  stockOverride?: number;
  sortOrder?: number;
}

export interface ProductSpecInput {
  specKey: string;
  specValue: string;
  sortOrder?: number;
}

export interface ProductImageInput {
  url: string;
  isPrimary?: boolean;
  sortOrder?: number;
  productColorId?: string;
}

export interface ProductQueryParams {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
  featured?: boolean;
  bestsellers?: boolean;
  inStockOnly?: boolean;
}

export interface ProductCreatePayload {
  title: string;
  sku: string;
  price: number;
  stock?: number;
  categoryId?: string;
  description?: string;
  material?: string;
  weightGrams?: number;
  dimensions?: string;
  estimatedDelivery?: string;
  colorType: 'fixed' | 'custom';
  defaultColorName?: string;
  defaultColorHex?: string;
  colors?: ProductColorInput[];
  images?: ProductImageInput[];
  specs?: ProductSpecInput[];
  isFeatured?: boolean;
  isBestseller?: boolean;
  isActive?: boolean;
}

export type ProductUpsertPayload = ProductCreatePayload;

export type ProductListResponse = PaginatedResponse<Product> | Product[];

function unwrapList<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[];
  const maybePaginated = response as { items?: T[] } | undefined;
  if (maybePaginated && Array.isArray(maybePaginated.items)) {
    return maybePaginated.items;
  }
  return [];
}

export async function getProducts(params?: ProductQueryParams) {
  const response = await axiosClient.get<unknown>('/products', { params });
  return normalizeProducts(unwrapList(response));
}

export async function getFeaturedProducts() {
  const response = await axiosClient.get<unknown>('/products/featured');
  return normalizeProducts(unwrapList(response));
}

export async function getBestsellers() {
  const response = await axiosClient.get<unknown>('/products/bestsellers');
  return normalizeProducts(unwrapList(response));
}

export async function getProductById(id: string) {
  const response = await axiosClient.get<unknown>(`/products/${id}`);
  return normalizeProduct(response as Parameters<typeof normalizeProduct>[0]);
}

export async function createProduct(payload: ProductCreatePayload) {
  return axiosClient.post<Product>('/products', payload);
}

export async function updateProduct(id: string, payload: Partial<ProductUpsertPayload>) {
  return axiosClient.put<Product>(`/products/${id}`, payload);
}

export async function deleteProduct(id: string) {
  return axiosClient.delete<void>(`/products/${id}`);
}
