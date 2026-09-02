import axiosClient from '@/api/axiosClient';

import type { AuthResponse, ForgotPasswordResponse, LoginCredentials, RegisterData, User } from './types';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  return axiosClient.post<AuthResponse>('/auth/login', credentials) as unknown as Promise<AuthResponse>;
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  return axiosClient.post<AuthResponse>('/auth/register', data) as unknown as Promise<AuthResponse>;
}

export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  return axiosClient.post<ForgotPasswordResponse>('/auth/forgot-password', { email }) as unknown as Promise<ForgotPasswordResponse>;
}

export async function verifyEmail(token: string): Promise<{ message?: string }> {
  return axiosClient.post<{ message?: string }>('/auth/verify-email', { token }) as unknown as Promise<{ message?: string }>;
}

export async function resendVerificationEmail(email: string): Promise<{ message?: string }> {
  return axiosClient.post<{ message?: string }>('/auth/resend-verification', { email }) as unknown as Promise<{ message?: string }>;
}

export async function getMe(): Promise<User> {
  return axiosClient.get<User>('/auth/me') as unknown as Promise<User>;
}


