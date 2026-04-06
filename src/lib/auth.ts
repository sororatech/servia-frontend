// src/lib/auth.ts

export const AUTH_STORAGE = {
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  },

  setUserType(type: 'candidate' | 'recruiter'): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_type', type);
    }
  },

  getUserType(): 'candidate' | 'recruiter' | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user_type') as 'candidate' | 'recruiter';
    }
    return null;
  },

  setUserId(id: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_id', id);
    }
  },

  getUserId(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user_id');
    }
    return null;
  },

  clear(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_type');
      localStorage.removeItem('user_id');
    }
  },
};

export function getDashboardUrl(userType: 'candidate' | 'recruiter'): string {
  return userType === 'candidate' ? '/candidate/dashboard' : '/recruiter/dashboard';
}

export function isAuthenticated(): boolean {
  return !!AUTH_STORAGE.getToken();
}