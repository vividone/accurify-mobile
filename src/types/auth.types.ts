import type { UserRole } from './enums';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  emailVerified: boolean;
  hasCompletedOnboarding: boolean;
  createdAt: string;
}

// SECURITY: Tokens are now in httpOnly cookies, not in response body (FE-001)
export interface AuthResponse {
  accessToken?: string;    // Optional - no longer returned in body
  refreshToken?: string;   // Optional - no longer returned in body
  expiresIn: number;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type AccountType = 'BUSINESS' | 'ACCOUNTANT';

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  accountType?: AccountType;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;  // Backend expects 'password', not 'newPassword'
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
