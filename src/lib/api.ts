import axios from 'axios';
import { getApiBaseUrl } from './config';

const API_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const publicRoutes = [
      '/users/login/',
      '/users/register/',
      '/users/verify-email/',
      '/users/resend-verification/',
      '/users/password-reset/'
    ];

    const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));

    if (!isPublicRoute) {
      const token = localStorage.getItem('auth_token');

      if (token) {
        const cleanToken = token.replace(/^["'](.+)["']$/, '$1');
        config.headers.Authorization = `Token ${cleanToken}`;
      } else {
        console.warn(`⚠️ No token found in localStorage for: ${config.url}`);
      }
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_id');

        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user_id: string;
  user_type: 'candidate' | 'recruiter';
  token: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface RegisterData {
  user: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  };
  phone?: string;
  nationality?: string;
}

export interface VerificationData {
  email: string;
  code: string;
}

export const authAPI = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/users/login/', credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<any> {
    const response = await api.post('/users/register/', data);
    return response.data;
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/users/password-reset/', { email });
    return response.data;
  },

  async confirmPasswordReset(
    uid: string,
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/users/password-reset/confirm/', {
      uid,
      token,
      new_password: newPassword,
    });
    return response.data;
  },

  async verifyEmail(data: VerificationData): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/users/verify-email/', data);
    return response.data;
  },

  async resendVerificationCode(data: { email: string }): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/users/resend-verification/', data);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/users/logout/');
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_id');
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      }
    }
  },
};
