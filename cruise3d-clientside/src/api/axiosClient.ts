import axios, { AxiosError, AxiosHeaders } from 'axios';
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

import type { ApiResponse } from '@/types/api';

type UnwrappedAxiosClient = Omit<
  AxiosInstance,
  'get' | 'delete' | 'head' | 'options' | 'post' | 'put' | 'patch' | 'request'
> & {
  request<T = unknown, D = unknown>(config: AxiosRequestConfig<D>): Promise<T>;
  get<T = unknown, D = unknown>(url: string, config?: AxiosRequestConfig<D>): Promise<T>;
  delete<T = unknown, D = unknown>(url: string, config?: AxiosRequestConfig<D>): Promise<T>;
  head<T = unknown, D = unknown>(url: string, config?: AxiosRequestConfig<D>): Promise<T>;
  options<T = unknown, D = unknown>(url: string, config?: AxiosRequestConfig<D>): Promise<T>;
  post<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T>;
  put<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T>;
  patch<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T>;
};

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
}) as UnwrappedAxiosClient;

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken')
        : null;

    if (token) {
      if (config.headers instanceof AxiosHeaders) {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers = AxiosHeaders.from(config.headers);
        config.headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => {
    const apiResponse = response.data as ApiResponse<unknown> | unknown;

    if (
      apiResponse &&
      typeof apiResponse === 'object' &&
      'success' in apiResponse &&
      'data' in apiResponse
    ) {
      if ((apiResponse as ApiResponse<unknown>).success === false) {
        return Promise.reject(apiResponse);
      }

      return (apiResponse as ApiResponse<unknown>).data;
    }

    return response.data;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Soft dispatch: let the AuthProvider clear the auth state and let
      // route guards (ProtectedRoute) handle the redirect. Avoid forcing
      // a hard navigation here so the user is not kicked out mid-action.
      localStorage.removeItem('accessToken');
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
