import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from '@/store/auth.store';
import { openUpgradeModalFromInterceptor } from '@/store/ui.store';
import { API_CONFIG } from '@/utils/constants';
import type { ApiError } from '@/types';

// SECURITY: Create axios instance with credentials enabled for httpOnly cookies (FE-001)
// SECURITY: API versioning prefix (BE-017)
export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true, // SECURITY: Enable cookie transmission (FE-001, FE-002)
});

// Request interceptor - no longer attaching JWT token since cookies handle auth
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // SECURITY: Token is now sent via httpOnly cookie automatically (FE-001)
    // No need to manually attach Authorization header

    // When sending FormData (file uploads), remove the default Content-Type header
    // so axios can auto-set 'multipart/form-data' with the correct boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors and token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized - SECURITY: Cookie-based refresh (FE-001)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // Cookies are refreshed automatically, just retry the request
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // SECURITY: Check if user is authenticated (based on local state)
      const isAuthenticated = useAuthStore.getState().isAuthenticated;

      if (!isAuthenticated) {
        // Already logged out — just reject so React state drives the redirect
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      try {
        // SECURITY: Refresh endpoint now reads token from httpOnly cookie (FE-001)
        // Cookies are sent automatically with withCredentials: true
        await axios.post(
          `${API_CONFIG.BASE_URL}/api/v1/auth/refresh`,
          {}, // Empty body - refresh token is in cookie
          { withCredentials: true }
        );

        // New tokens are set in cookies by the server
        processQueue(null, null);

        // Retry the original request - new cookie will be sent automatically
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        // Clear auth state — ProtectedRoute subscribes to isAuthenticated
        // and will redirect to /login via React <Navigate> (no hard reload needed)
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 Premium Required
    if (error.response?.status === 403) {
      const message = error.response.data?.message || '';
      if (
        message.toLowerCase().includes('premium') ||
        message.toLowerCase().includes('subscription')
      ) {
        openUpgradeModalFromInterceptor();
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
