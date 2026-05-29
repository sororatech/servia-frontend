import axios from 'axios';
import { getApiBaseUrl } from './config';

const API_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const publicRoutes = [
      '/users/login/',
      '/users/register/',
      '/users/verify-email/',
      '/users/resend-verification/',
      '/users/password-reset/'
    ];

    const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));

    if (!isPublicRoute) {
      const token = localStorage.getItem('auth_token');

      if (token) {
        const cleanToken = token.replace(/^["'](.+)["']$/, '$1');
        config.headers.Authorization = `Token ${cleanToken}`;
      } else {
        console.warn(`No token found in localStorage for: ${config.url}`);
      }
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_id');

        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user_id: string;
  user_type: 'candidate' | 'recruiter';
  token: string;
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

export interface VerificationData {
  email: string;
  code: string;
}

export const authAPI = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/users/login/', credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<any> {
    const response = await api.post('/users/register/', data);
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

  async verifyEmail(data: VerificationData): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/users/verify-email/', data);
    return response.data;
  },

  async resendVerificationCode(data: { email: string }): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/users/resend-verification/', data);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/users/logout/');
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_id');
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      }
    }
  },
};

export interface DashboardStats {
  totalCandidates: number;
  shortlisted: number;
  interviewsThisWeek: number;
  avgAiScore: number | null;
}

export interface RecentApplication {
  id: string;
  candidate: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_photo?: string;
  };
  job: {
    id: string;
    title: string;
    department?: string;
  };
  applied_at: string;
  status: 'applied' | 'shortlisted' | 'interviewing' | 'rejected' | 'hired';
  ai_score?: number;
}

export interface OpenRole {
  id: string;
  title: string;
  department?: string;
  location?: string;
  openings_count: number;
  applications_count: number;
  created_at: string;
}

export interface RecruiterProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  user_type?: 'recruiter' | 'candidate';
  profile?: {
    department?: string;
    role?: string;
  };
}

export const dashboardAPI = {
  async getCurrentRecruiter(): Promise<RecruiterProfile> {
    const response = await api.get<RecruiterProfile>('/users/profile/');
        if (process.env.NODE_ENV === 'development') {
      console.log('Profile response:', response.data);
    }
    
    return response.data;
  },

  async getStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/users/recruiters/me/stats/');
    return response.data;
  },

  async getRecentApplications(limit: number = 5): Promise<RecentApplication[]> {
    const response = await api.get('/candidates/candidates/', {
      params: {
        limit,
        ordering: '-applied_at', 
      },
    });

    const results = response.data.results || response.data || [];

    return results.map((item: any) => ({
      id: item.id,
      candidate: {
        id: item.user?.id?.toString() || '',
        first_name: item.user?.first_name || '',
        last_name: item.user?.last_name || '',
        email: item.user?.email || '',
        profile_photo: item.user?.profile_photo,
      },
      job: {
        id: item.job?.id || '',
        title: item.job?.title || 'Unknown Job',
        department: item.job?.department,
      },
      applied_at: item.applied_at,
      status: item.status,
      ai_score: item.ai_score,
      video_intro_url: item.video_intro_url,
    }));
  },

  async getOpenRoles(limit: number = 5): Promise<OpenRole[]> {
    const response = await api.get('/jobs/jobs/', {
      params: {
        is_active: true,
        limit,
        ordering: '-created_at', 
      },
    });

    const results = response.data.results || response.data || [];

    return results.map((job: any) => ({
      id: job.id,
      title: job.title,
      department: job.department,
      location: job.location,
      openings_count: job.openings_count,
      applications_count: job.candidate_count || 0, 
      created_at: job.created_at,
    }));
  },
};