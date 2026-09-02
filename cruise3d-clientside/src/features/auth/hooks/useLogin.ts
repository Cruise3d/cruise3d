import { useCallback, useState } from 'react';

import { useAuthStore } from '@/app/store/authStore';

import { login as loginRequest } from '../api';
import type { AuthResponse, LoginCredentials, User } from '../types';

function mapAuthResponseToUser(response: AuthResponse): User {
  const trimmedName = response.name.trim();
  const [firstName, ...rest] = trimmedName.split(/\s+/);
  const lastName = rest.join(' ');

  return {
    id: response.email,
    email: response.email,
    firstName: firstName || trimmedName,
    lastName,
    phone: response.phone,
    role: response.role,
    isEmailVerified: response.isEmailVerified,
    createdAt: new Date().toISOString(),
  };
}

export function useLogin() {
  const loginSession = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await loginRequest(credentials);

        // Check if account requires email verification
        if (response.isEmailVerified === false) {
          const unverifiedErr = new Error(
            'Your email address is not verified yet. Please verify your email before signing in.'
          );
          (unverifiedErr as unknown as { isUnverified: boolean; email: string }).isUnverified = true;
          (unverifiedErr as unknown as { isUnverified: boolean; email: string }).email = credentials.email;
          throw unverifiedErr;
        }

        loginSession(mapAuthResponseToUser(response), response.token, response.refreshToken ?? null);
        return response;
      } catch (err: unknown) {
        if ((err as { isUnverified?: boolean })?.isUnverified) {
          throw err;
        }

        let message = 'Unable to sign in right now.';
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
    [loginSession]
  );

  return { login, isLoading, error, setError };
}

