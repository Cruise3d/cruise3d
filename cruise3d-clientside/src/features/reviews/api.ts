import axiosClient from '@/api/axiosClient';

import type { CreateReviewPayload, Review } from './types';

/**
 * Fetch all reviews for a product.
 * Public endpoint — anyone can read.
 */
export async function getReviewsByProduct(productId: string): Promise<Review[]> {
  return axiosClient.get<Review[]>(`/reviews/product/${productId}`);
}

export async function createReview(payload: CreateReviewPayload): Promise<Review> {
  return axiosClient.post<Review, CreateReviewPayload>('/reviews', payload);
}