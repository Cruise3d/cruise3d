import { useCallback, useEffect, useState } from 'react';

import { getMe } from '@/features/auth/api';
import type { User } from '@/features/auth/types';

export interface UseProfileResult {
  profile: User | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProfile(): UseProfileResult {
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetched = await getMe();
      setProfile(fetched);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load profile.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { profile, isLoading, error, refetch };
}