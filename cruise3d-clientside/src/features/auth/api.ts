import axiosClient from '@/api/axiosClient';

import type { AuthResponse, LoginCredentials, RegisterData, User } from './types';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  return axiosClient.post<AuthResponse>('/auth/login', credentials) as unknown as Promise<AuthResponse>;
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  return axiosClient.post<AuthResponse>('/auth/register', data) as unknown as Promise<AuthResponse>;
}

export async function getMe(): Promise<User> {
  return axiosClient.get<User>('/auth/me') as unknown as Promise<User>;
}
