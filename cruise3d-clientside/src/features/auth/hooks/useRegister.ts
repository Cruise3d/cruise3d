import { useCallback, useState } from 'react';

import { register as registerRequest } from '../api';
import type { AuthResponse, RegisterData } from '../types';

export function useRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(
    async (data: RegisterData): Promise<AuthResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await registerRequest(data);
        return response;
      } catch (err: unknown) {
        let message = 'Unable to create account right now.';
        if (typeof err === 'string') {
          message = err;
        } else if (err && typeof err === 'object') {
          const anyErr = err as Record<string, unknown>;
          if (anyErr.response && typeof anyErr.response === 'object') {
            const resData = (anyErr.response as Record<string, unknown>).data as Record<string, unknown> | string;
            if (typeof resData === 'string') {
              message = resData;
            } else if (resData && typeof resData.message === 'string') {
              message = resData.message;
            }
          } else if (typeof anyErr.message === 'string') {
            message = anyErr.message;
          }
        }
        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { register, isLoading, error, setError };
}

