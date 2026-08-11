import { useEffect } from 'react';

import { useAuthStore } from '@/app/store/authStore';
import { useCartStore } from '@/features/cart/useCartStore';
import { getMe } from '@/features/auth/api';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider hydrates the auth state on app load and listens for the
 * `auth:logout` event emitted by the axios 401 interceptor. It also
 * triggers a server-cart fetch whenever the user becomes authenticated
 * (and resets the client cart on logout).
 */
export default function AuthProvider({ children }: AuthProviderProps) {
  useEffect(() => {
    const { token, user, logout } = useAuthStore.getState();

    // If a token is persisted but the user object is missing (e.g. after a
    // refresh), rehydrate from the backend.
    if (token && !user) {
      getMe()
        .then((freshUser) => {
          useAuthStore.setState({
            user: freshUser,
            isAuthenticated: true,
          });
          useCartStore.getState().fetchCart();
        })
        .catch(() => {
          // Token is invalid — fall back to logged-out state.
          logout();
        });
    } else if (token && user) {
      useCartStore.getState().fetchCart();
    }

    const handleAuthLogout = () => {
      logout();
      useCartStore.getState().reset();
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, []);

  // Keep the cart in sync when the auth state flips after login/register.
  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe((state, prev) => {
      if (state.isAuthenticated && !prev.isAuthenticated) {
        useCartStore.getState().fetchCart();
      } else if (!state.isAuthenticated && prev.isAuthenticated) {
        useCartStore.getState().reset();
      }
    });
    return unsubscribe;
  }, []);

  return <>{children}</>;
}
