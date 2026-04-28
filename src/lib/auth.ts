// src/lib/auth.ts

export const AUTH_STORAGE = {
  saveAuth(
    token: string,
    type: 'candidate' | 'recruiter',
    userId: string,
    rememberMe: boolean,
    name?: string,
  ) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_role', type); 
      localStorage.setItem('user_id', userId);
      if (name) {
        localStorage.setItem('user_name', name);
      }

      const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 86400; 
      const expiry = `; max-age=${maxAge}`;
      
      document.cookie = `auth_token=${token}; path=/; samesite=lax${expiry}`;
      document.cookie = `user_role=${type}; path=/; samesite=lax${expiry}`;
    }
  },

  getToken: () => typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null,
  getUserRole: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('user_role') as 'candidate' | 'recruiter';
  },
  getUserName: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('user_name');
  },
  
  clear(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role'); 
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_name');
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    }
  },
};

export function getDashboardUrl(userType: 'candidate' | 'recruiter'): string {
  return userType === 'candidate' ? '/candidate/dashboard' : '/recruiter/dashboard';
}
