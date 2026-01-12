import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, AuthResponse } from '@/types';
import apiClient from '@/lib/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,
      hasHydrated: false,
      setHasHydrated: (state) => {
        set({ hasHydrated: state });
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Attempting login for:', email);
          const response = await apiClient.post<AuthResponse>('/auth/login', {
            email,
            password,
          });

          console.log('Login response:', response.data);

          const { user, accessToken, refreshToken } = response.data;

          if (!user || !accessToken || !refreshToken) {
            console.error('Missing data in login response:', { user, accessToken: !!accessToken, refreshToken: !!refreshToken });
            throw new Error('Invalid response from server. Missing user or tokens.');
          }

          // Store tokens in localStorage
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);

          set({
            user,
            accessToken,
            refreshToken,
            isLoading: false,
            error: null,
          });
          
          console.log('Login successful, tokens stored');
          
          console.log('Login successful, user set:', user.username);
        } catch (error: any) {
          console.error('=== AUTH STORE LOGIN ERROR ===');
          console.error('Full error:', error);
          console.error('Error response:', error.response);
          console.error('Error response data:', error.response?.data);
          console.error('Error status:', error.response?.status);
          console.error('Error message:', error.message);
          console.error('================================');
          
          const errorMessage =
            error.response?.data?.error || 
            error.response?.data?.message ||
            error.message || 
            'Login failed. Please try again.';
          set({
            isLoading: false,
            error: errorMessage,
            user: null,
            accessToken: null,
            refreshToken: null,
          });
          throw error;
        }
      },

      register: async (email: string, username: string, password: string, role?: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post<AuthResponse>('/auth/register', {
            email,
            username,
            password,
            role,
          });

          const { user, accessToken, refreshToken } = response.data;

          // Store tokens in localStorage
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);

          set({
            user,
            accessToken,
            refreshToken,
            isLoading: false,
            error: null,
          });
          
          console.log('Login successful, tokens stored');
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.error || 'Registration failed. Please try again.';
          set({
            isLoading: false,
            error: errorMessage,
            user: null,
            accessToken: null,
            refreshToken: null,
          });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          error: null,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => {
        return (state) => {
          // This callback runs after Zustand rehydrates from localStorage
          if (state) {
            state.setHasHydrated(true);
          }
        };
      },
    }
  )
);

