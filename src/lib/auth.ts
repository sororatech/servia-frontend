export const AUTH_STORAGE = {
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      document.cookie = `auth_token=${token}; path=/; max-age=${60*60*24*7}`;
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
      document.cookie = `user_type=${type}; path=/; max-age=${60*60*24*7}`;
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
      // Clear cookies
      document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      });
    }
  },
};

export function getDashboardUrl(userType: 'candidate' | 'recruiter'): string {
  return userType === 'candidate' ? '/candidate/dashboard' : '/recruiter/dashboard';
}

export function isAuthenticated(): boolean {
  return !!AUTH_STORAGE.getToken();
}