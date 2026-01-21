import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthResponse } from '../types';
import apiClient from '../lib/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  // Computed getter for isAuthenticated
  getIsAuthenticated: () => boolean;
  
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,
  // Computed getter - always returns boolean
  getIsAuthenticated: () => {
    const state = get();
    return Boolean(state.accessToken && state.refreshToken);
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        email,
        password,
      });

      const { user, accessToken, refreshToken } = response.data;

      // Store tokens
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);

      set({
        user,
        accessToken,
        refreshToken,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (email: string, username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', {
        email,
        username,
        password,
      });

      const { user, accessToken, refreshToken } = response.data;

      // Store tokens
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);

      set({
        user,
        accessToken,
        refreshToken,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
    });
  },

  fetchUserProfile: async () => {
    try {
      const response = await apiClient.get<{ user: User }>('/user/profile');
      set({ user: response.data.user });
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error);
    }
  },

  clearError: () => set({ error: null }),
}));

// Initialize auth state from AsyncStorage on app start
AsyncStorage.multiGet(['accessToken', 'refreshToken']).then((values) => {
  const accessToken = values[0][1];
  const refreshToken = values[1][1];
  
  if (accessToken && refreshToken) {
    useAuthStore.setState({
      accessToken,
      refreshToken,
    });
    // Fetch user profile
    useAuthStore.getState().fetchUserProfile();
  }
});
