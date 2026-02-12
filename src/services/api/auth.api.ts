import apiClient from './client';
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from '@/types';

const AUTH_BASE = '/auth';

export const authApi = {
  // Register new user
  register: async (data: RegisterRequest): Promise<void> => {
    await apiClient.post(`${AUTH_BASE}/register`, data);
  },

  // Login
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      `${AUTH_BASE}/login`,
      data
    );
    return response.data.data!;
  },

  // Refresh token - SECURITY: Token is now in httpOnly cookie, no need to pass in body (FE-001)
  refresh: async (): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      `${AUTH_BASE}/refresh`,
      {} // Empty body - refresh token is in httpOnly cookie
    );
    return response.data.data!;
  },

  // Verify email - SECURITY: Uses request body instead of URL parameter
  verifyEmail: async (token: string): Promise<void> => {
    await apiClient.post(`${AUTH_BASE}/verify-email`, { token });
  },

  // Resend verification email
  resendVerification: async (email: string): Promise<void> => {
    await apiClient.post(`${AUTH_BASE}/resend-verification`, { email });
  },

  // Forgot password - request reset - SECURITY: Uses request body instead of URL parameter
  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post(`${AUTH_BASE}/forgot-password`, { email });
  },

  // Reset password with token
  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await apiClient.post(`${AUTH_BASE}/reset-password`, data);
  },

  // Change password (authenticated)
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post(`${AUTH_BASE}/change-password`, data);
  },

  // SECURITY: Logout - Clears httpOnly cookies and blacklists tokens on backend (FE-001, FE-012)
  logout: async (): Promise<void> => {
    // Tokens are in httpOnly cookies - backend will read and clear them
    await apiClient.post(`${AUTH_BASE}/logout`, {});
  },
};
