export const AUTH_STORAGE = {
  saveAuth(token: string, type: 'candidate' | 'recruiter', userId: string, rememberMe: boolean, firstName?: string, lastName?: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_role', type); 
      localStorage.setItem('user_id', userId);
      if (firstName) localStorage.setItem('first_name', firstName);
      if (lastName) localStorage.setItem('last_name', lastName);

      const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 86400; 
      const expiry = `; max-age=${maxAge}`;
      
      document.cookie = `auth_token=${token}; path=/; samesite=lax${expiry}`;
      document.cookie = `user_role=${type}; path=/; samesite=lax${expiry}`;
    }
  },

  getToken: () => typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null,

  /** Token for WebSocket auth (localStorage first, then auth_token cookie). */
  getWebSocketToken(): string | null {
    if (typeof window === 'undefined') return null;
    const fromStorage = localStorage.getItem('auth_token');
    if (fromStorage) {
      return fromStorage.replace(/^["']|["']$/g, '');
    }
    const match = document.cookie.match(/(?:^|;\s*)auth_token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  },
  
  getUserRole: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('user_role') as 'candidate' | 'recruiter';
  },
  
  getFirstName: () => typeof window !== 'undefined' ? localStorage.getItem('first_name') : null,
  getLastName: () => typeof window !== 'undefined' ? localStorage.getItem('last_name') : null,
  getUserId: () => typeof window !== 'undefined' ? localStorage.getItem('user_id') : null,
  getUserEmail: () => typeof window !== 'undefined' ? localStorage.getItem('user_email') : null,
  setAvatarUrl(url: string | null): void {
    if (typeof window !== 'undefined') {
      if (url) localStorage.setItem('avatar_url', url);
      else localStorage.removeItem('avatar_url');
    }
  },

  getAvatarUrl(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('avatar_url');
  },
  clear(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role'); 
      localStorage.removeItem('user_id');
      localStorage.removeItem('first_name');
      localStorage.removeItem('last_name');
      localStorage.removeItem('user_email'); 
      localStorage.removeItem('avatar_url');
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    }
  },
};

export function getDashboardUrl(userType: 'candidate' | 'recruiter'): string {
  return userType === 'candidate' ? '/' : '/recruiter/dashboard/overview';
}