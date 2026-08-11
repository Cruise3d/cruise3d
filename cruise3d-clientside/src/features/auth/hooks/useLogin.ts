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
        loginSession(mapAuthResponseToUser(response), response.token, response.refreshToken ?? null);
        return response;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unable to sign in right now.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [loginSession]
  );

  return { login, isLoading, error, setError };
}
