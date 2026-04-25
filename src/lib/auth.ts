export const AUTH_STORAGE = {
  saveAuth(token: string, type: 'candidate' | 'recruiter', userId: string, rememberMe: boolean) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_type', type);
      localStorage.setItem('user_id', userId);

      const maxAge = rememberMe ? 30 * 24 * 60 * 60 : ''; 
      const expiry = maxAge ? `; max-age=${maxAge}` : '';
      
      document.cookie = `auth_token=${token}; path=/; samesite=lax${expiry}`;
      document.cookie = `user_role=${type}; path=/; samesite=lax${expiry}`;
    }
  },

  getToken: () => typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null,
  getUserType: () => typeof window !== 'undefined' ? localStorage.getItem('user_type') as 'candidate' | 'recruiter' : null,
  
  clear(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_type');
      localStorage.removeItem('user_id');
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    }
  },
};

export function getDashboardUrl(userType: 'candidate' | 'recruiter'): string {
  return userType === 'candidate' ? '/candidate/dashboard' : '/recruiter/dashboard';
}