'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { AUTH_STORAGE, getDashboardUrl } from '@/lib/auth';

interface UseAuthReturn {
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.login({ email, password });
      
      if (rememberMe) {
        AUTH_STORAGE.setToken(response.user_id.toString());
        AUTH_STORAGE.setUserType(response.user_type);
      }
      
      const redirectPath = getDashboardUrl(response.user_type);
      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Invalid email or password. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      AUTH_STORAGE.clear();
      router.push('/login');
    }
  };

  return { loading, error, login, logout };
};