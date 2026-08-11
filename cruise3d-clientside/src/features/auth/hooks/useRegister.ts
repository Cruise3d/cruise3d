import { useCallback, useState } from 'react';

import { useAuthStore } from '@/app/store/authStore';

import { register as registerRequest } from '../api';
import type { AuthResponse, RegisterData, User } from '../types';

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

export function useRegister() {
  const loginSession = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(
    async (data: RegisterData) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await registerRequest(data);
        loginSession(mapAuthResponseToUser(response), response.token, response.refreshToken ?? null);
        return response;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unable to create account right now.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [loginSession]
  );

  return { register, isLoading, error, setError };
}
