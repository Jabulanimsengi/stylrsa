/**
 * Authentication API endpoints
 */

import { api } from './client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'salon_owner' | 'admin';
  avatar?: string;
  phone?: string;
  isVerified?: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'salon_owner';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
}

export const authApi = {
  /**
   * Login with email and password
   */
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>('/auth/login', credentials),

  /**
   * Register a new user
   */
  register: (data: RegisterData) =>
    api.post<AuthResponse>('/auth/register', data),

  /**
   * Get current user profile
   */
  getProfile: () => api.get<User>('/auth/profile'),

  /**
   * Update user profile
   */
  updateProfile: (data: Partial<User>) =>
    api.patch<User>('/auth/profile', data),

  /**
   * Request password reset
   */
  requestPasswordReset: (data: PasswordResetRequest) =>
    api.post('/auth/forgot-password', data),

  /**
   * Confirm password reset
   */
  confirmPasswordReset: (data: PasswordResetConfirm) =>
    api.post('/auth/reset-password', data),

  /**
   * Verify email with code
   */
  verifyEmail: (code: string) =>
    api.post('/auth/verify-email', { code }),

  /**
   * Resend verification email
   */
  resendVerification: () =>
    api.post('/auth/resend-verification'),

  /**
   * Logout
   */
  logout: () => api.post('/auth/logout'),

  /**
   * Refresh access token
   */
  refreshToken: (refreshToken: string) =>
    api.post<{ accessToken: string }>('/auth/refresh', { refreshToken }),
};
