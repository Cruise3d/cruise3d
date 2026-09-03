import axiosClient from '@/api/axiosClient';

import type { Category, CategoryWithProducts } from './types';

export interface CategoryUpsertPayload {
  name: string;
  slug?: string;
  sortOrder?: number;
}

export async function getCategories() {
  return axiosClient.get<Category[]>('/categories');
}

export async function getCategoriesWithProducts() {
  return axiosClient.get<CategoryWithProducts[]>('/categories/with-products');
}

export async function createCategory(payload: CategoryUpsertPayload) {
  return axiosClient.post<Category>('/categories', payload);
}

export async function updateCategory(id: string, payload: Partial<CategoryUpsertPayload>) {
  return axiosClient.put<Category>(`/categories/${id}`, payload);
}

export async function deleteCategory(id: string) {
  return axiosClient.delete<void>(`/categories/${id}`);
}
