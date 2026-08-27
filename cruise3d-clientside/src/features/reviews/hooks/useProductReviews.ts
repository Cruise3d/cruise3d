import { useCallback, useState } from 'react';
import { getReviewsByProduct } from '../api';
import type { Review } from '../types';

export interface UseProductReviewsResult {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasLoaded: boolean;
}

export function useProductReviews(productId: string | undefined): UseProductReviewsResult {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const refetch = useCallback(async () => {
    if (!productId) return;
    setIsLoading(true);
    setError(null);
    // DO NOT clear reviews - keep existing data while loading
    try {
      const list = await getReviewsByProduct(productId);
      setReviews(list);
      setHasLoaded(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load reviews.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  return { reviews, isLoading, error, refetch, hasLoaded };
}