// src/hooks/useRegister.ts
'use client';

import { useState } from 'react';
import { authAPI, RegisterData } from '@/lib/api';
import { AUTH_STORAGE } from '@/lib/auth';

interface UseRegisterReturn {
  loading: boolean;
  error: string | null;
  register: (data: RegisterData) => Promise<void>;
}

export const useRegister = (): UseRegisterReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (data: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.register(data);
      
      // Store user type from response (for redirects)
      AUTH_STORAGE.setUserType(response.user_type);
      
      // Backend sets cookies automatically, so token is in httpOnly cookie
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 
                          JSON.stringify(err.response?.data) || 
                          'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, register };
};