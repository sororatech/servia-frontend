// src/lib/auth.ts

export const AUTH_STORAGE = {
  saveAuth(token: string, type: 'candidate' | 'recruiter', userId: string, rememberMe: boolean) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      // FIXED: Changed 'user_type' to 'user_role' to match the cookie
      localStorage.setItem('user_role', type); 
      localStorage.setItem('user_id', userId);

      const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 86400; 
      const expiry = `; max-age=${maxAge}`;
      
      document.cookie = `auth_token=${token}; path=/; samesite=lax${expiry}`;
      document.cookie = `user_role=${type}; path=/; samesite=lax${expiry}`;
    }
  },

  getToken: () => typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null,
  
  // FIXED: Renamed function and key to user_role
  getUserRole: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('user_role') as 'candidate' | 'recruiter';
  },
  
  clear(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      // FIXED: Changed to 'user_role'
      localStorage.removeItem('user_role'); 
      localStorage.removeItem('user_id');
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    }
  },
};

export function getDashboardUrl(userType: 'candidate' | 'recruiter'): string {
  return userType === 'candidate' ? '/candidate/dashboard' : '/recruiter/dashboard';
}