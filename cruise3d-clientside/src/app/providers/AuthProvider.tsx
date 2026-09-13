import { useEffect } from 'react';

import { useAuthStore } from '@/app/store/authStore';
import { useCartStore } from '@/features/cart/useCartStore';
import { getMe } from '@/features/auth/api';
import {
  getNotificationMessage,
  onForegroundMessage,
  registerFcmToken,
  unregisterFcmToken,
} from '@/lib/notifications/fcm';

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

    let isHandlingLogout = false;
    const handleAuthLogout = () => {
      if (isHandlingLogout) return;
      isHandlingLogout = true;

      logout();
      useCartStore.getState().reset();
      isHandlingLogout = false;
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, []);

  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') return;

    void registerFcmToken().catch((error) => {
      console.warn('FCM token registration failed.', error);
    });

    const unsubscribe = onForegroundMessage((payload) => {
      if (Notification.permission !== 'granted') return;

      const message = getNotificationMessage(payload);
      const title = payload.notification?.title || 'Cruise3D notification';
      const notification = new Notification(title, {
        body: message.replace(`${title}\n`, ''),
        icon: '/logo.png',
        data: payload.data || {},
      });
      notification.onclick = () => {
        window.focus();
        const route = payload.data?.route || '/admin/orders';
        window.location.assign(route);
      };
    });

    return unsubscribe;
  }, [isAuthenticated, user?.role]);

  // Keep the cart in sync when the auth state flips after login/register.
  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe((state, prev) => {
      if (state.isAuthenticated && !prev.isAuthenticated) {
        useCartStore.getState().fetchCart();
      } else if (!state.isAuthenticated && prev.isAuthenticated) {
        useCartStore.getState().reset();
        void unregisterFcmToken().catch((error) => {
          console.warn('FCM token cleanup failed.', error);
        });
      }
    });
    return unsubscribe;
  }, []);

  return <>{children}</>;
}
