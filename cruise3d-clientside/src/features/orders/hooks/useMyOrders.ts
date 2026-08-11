import { useCallback, useEffect, useState } from 'react';

import { getMyOrders } from '../api';
import type { Order } from '../types';

export interface UseMyOrdersResult {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMyOrders(): UseMyOrdersResult {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await getMyOrders();
      setOrders(list);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load orders.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { orders, isLoading, error, refetch };
}