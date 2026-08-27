// src/features/offers/hooks/useActiveOffer.ts
import { useEffect, useState, useCallback } from 'react';

import { getActiveOffer } from '../api';
import type { Offer } from '../types';

/**
 * Fetches the storefront's currently active offer.
 *
 * Returns `null` both while the request is in flight and when the backend
 * reports that no offer is currently active. Errors are surfaced as
 * `error` so callers can log them, but the UI should not block on them:
 * the absence of an offer is a perfectly normal state.
 */
export function useActiveOffer() {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getActiveOffer();
      setOffer(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load active offer');
      setOffer(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { offer, isLoading, error, refetch };
}
