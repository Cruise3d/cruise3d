import { useCallback, useState } from 'react';
import { getReviewsByProduct } from '../api';
import type { Review } from '../types';

export interface UseProductReviewsResult {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProductReviews(productId: string | undefined): UseProductReviewsResult {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!productId) return;
    setIsLoading(true);
    setError(null);
    // ✅ REMOVE: setReviews([]) - keep old reviews while loading!
    try {
      const list = await getReviewsByProduct(productId);
      setReviews(list);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load reviews.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  return { reviews, isLoading, error, refetch };
}