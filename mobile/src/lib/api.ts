import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API URL - use production backend
const API_URL = __DEV__ 
  ? 'https://lioarcade-production.up.railway.app'  // Use production even in dev
  : 'https://lioarcade-production.up.railway.app';

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Don't set Content-Type for FormData
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

// Handle token refresh on 401 or 403
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const errorMessage = error.response?.data?.error || '';

    // Handle both 401 (unauthorized) and 403 (forbidden) for token issues
    if ((status === 401 || status === 403) && 
        (errorMessage.includes('token') || errorMessage.includes('Token') || errorMessage.includes('Invalid')) &&
        !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        if (accessToken) {
          await AsyncStorage.setItem('accessToken', accessToken);
          
          // Update auth store if available
          try {
            const { useAuthStore } = await import('../store/authStore');
            useAuthStore.setState({ accessToken });
          } catch (e) {
            // Store might not be available, that's okay
          }

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } else {
          throw new Error('No access token in refresh response');
        }
      } catch (refreshError) {
        // Refresh failed - clear tokens
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        
        // Update auth store to clear user
        try {
          const { useAuthStore } = await import('../store/authStore');
          useAuthStore.getState().logout();
        } catch (e) {
          // Store might not be available, that's okay
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
