import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Debug: Log the API URL being used (only in browser)
if (typeof window !== 'undefined') {
  console.log('🔗 API URL:', API_URL);
  console.log('🔗 Full API Base URL:', `${API_URL}/api`);
}

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Don't set Content-Type for FormData - let browser set it with boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

// Handle token refresh on 401 or 403 (invalid/expired token)
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
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
          
          // Update auth store if available
          try {
            const { useAuthStore } = await import('@/store/authStore');
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
        // Refresh failed - clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Update auth store to clear user
        try {
          const { useAuthStore } = await import('@/store/authStore');
          useAuthStore.getState().logout();
        } catch (e) {
          // Store might not be available, that's okay
        }
        
        // Only redirect if we're not already on login/register page
        if (typeof window !== 'undefined' && 
            !window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;



