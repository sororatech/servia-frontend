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

      AUTH_STORAGE.saveAuth(
        response.token,
        response.user_type,
        response.user_id.toString(),
        rememberMe,
      );

      const redirectPath = getDashboardUrl(response.user_type);
      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || 'Invalid email or password. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      AUTH_STORAGE.clear();
      setLoading(false);
      router.push('/login');
      router.refresh();
    }
  };

  return { loading, error, login, logout };
};
