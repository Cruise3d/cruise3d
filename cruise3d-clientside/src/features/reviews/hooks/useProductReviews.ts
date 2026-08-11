import { useCallback, useState } from 'react';

import { getReviewsByProduct } from '../api';
import type { Review } from '../types';

export interface UseProductReviewsResult {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Load reviews for a product. Reviews are fetched only when the consumer
 * calls `load()` (so we don't fetch eagerly for every page render) and
 * expose a `refetch` handle for pull-to-refresh / post-submit flows.
 */
export function useProductReviews(productId: string | undefined): UseProductReviewsResult {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!productId) return;
    setIsLoading(true);
    setError(null);
    try {
      const list = await getReviewsByProduct(productId);
      setReviews(list);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load reviews.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  return { reviews, isLoading, error, refetch };
}