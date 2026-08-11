import { useCallback, useEffect, useState } from 'react';

import { getMyOrderById } from '../api';
import type { Order } from '../types';

export interface UseOrderDetailResult {
  order: Order | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useOrderDetail(orderId: string | undefined): UseOrderDetailResult {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!orderId) {
      setError('Order id is missing.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetched = await getMyOrderById(orderId);
      setOrder(fetched);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load order.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { order, isLoading, error, refetch };
}