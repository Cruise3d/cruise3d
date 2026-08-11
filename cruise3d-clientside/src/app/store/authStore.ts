import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../../features/auth/types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string, refreshToken?: string | null) => void;
  setSession: (session: {
    user: User;
    token: string;
    refreshToken?: string | null;
  }) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (user, token, refreshToken = null) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', token);
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          } else {
            localStorage.removeItem('refreshToken');
          }
        }

        set({ user, token, refreshToken, isAuthenticated: true });
      },

      setSession: ({ user, token, refreshToken = null }) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', token);
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          } else {
            localStorage.removeItem('refreshToken');
          }
        }

        set({ user, token, refreshToken, isAuthenticated: true });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }

        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
    }),
    {
      name: 'cruise3d-auth',
    }
  )
);
