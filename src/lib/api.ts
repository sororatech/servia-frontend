// src/lib/api.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,  // Backend uses /users/* directly
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  withCredentials: true,  // Send cookies automatically
});

// Add auth token to requests if available (for non-cookie fallback)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_type');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ TYPES ============

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user_id: string;
  user_type: 'candidate' | 'recruiter';
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

// ============ AUTH API FUNCTIONS ============

export const authAPI = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/users/login/', credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/users/register/', data);
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

  async logout(): Promise<void> {
    await api.post('/users/logout/');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_type');
      localStorage.removeItem('user_id');
    }
  },
};