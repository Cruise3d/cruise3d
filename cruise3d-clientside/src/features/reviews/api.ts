import axiosClient from '@/api/axiosClient';

import type { Review } from './types';

/**
 * Fetch all reviews for a product.
 * Public endpoint — anyone can read.
 */
export async function getReviewsByProduct(productId: string): Promise<Review[]> {
  return axiosClient.get<Review[]>(`/reviews/product/${productId}`);
}