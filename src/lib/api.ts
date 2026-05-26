import axios from 'axios';
import { ENDPOINTS } from '@/utils/endpoints';
import { AnalyticsData } from '@/types/analytics';
import { AUTH_STORAGE } from '@/lib/auth';
import { getApiBaseUrl } from './config';

const API_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, 
  withCredentials: true,
});

export async function fetchAnalyticsData(): Promise<AnalyticsData> {
  const res = await fetch(`${API_URL}/api/recruiter/analytics/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch analytics: ${res.status}`);
  }

  return res.json();
}


async function fetchAllResults<T>(url: string, dateFilter?: string): Promise<T[]> {
  let results: T[] = [];
  let currentUrl = url;
  let attempt = 0;
  const MAX_ATTEMPTS = 3;

  const separator = currentUrl.includes('?') ? '&' : '?';
  if (dateFilter && !currentUrl.includes('created_at__gte')) {
    currentUrl = `${currentUrl}${separator}created_at__gte=${dateFilter}`;
  }

  while (currentUrl && attempt < MAX_ATTEMPTS) {
    try {
      attempt++;
      const { data } = await api.get<{ results: T[]; next: string | null }>(currentUrl);

      if (data?.results && Array.isArray(data.results)) {
        results = [...results, ...data.results];
        currentUrl = data.next || '';
      } else if (Array.isArray(data)) {
        results = [...results, ...data];
        currentUrl = '';
      } else {
        console.warn(` Unexpected format for ${currentUrl}`);
        break;
      }
    } catch (error: any) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.error(` Timeout fetching ${currentUrl} (attempt ${attempt}/${MAX_ATTEMPTS})`);
      } else {
        console.warn(` Failed to fetch ${currentUrl}:`, error.message);
      }
      break; 
    }
  }
  return results;
}

function getCurrentRecruiterId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('user_id');
}

function parseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

function getDayName(date: Date): string {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
}

export async function fetchAnalyticsFromMultipleEndpoints(): Promise<AnalyticsData | { error: true; message: string }> {
  const recruiterId = getCurrentRecruiterId();
  
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateFilter = thirtyDaysAgo.toISOString().split('T')[0]; 

    const [jobsResult, candidatesResult, interviewsResult, aiReportsResult] = await Promise.allSettled([
      fetchAllResults<any>(ENDPOINTS.JOBS, dateFilter),
      fetchAllResults<any>(ENDPOINTS.CANDIDATES, dateFilter),
      fetchAllResults<any>(ENDPOINTS.INTERVIEWS, dateFilter),
      fetchAllResults<any>(ENDPOINTS.AI_REPORTS, dateFilter),
    ]);

    const rejected = [jobsResult, candidatesResult, interviewsResult, aiReportsResult].filter(r => r.status === 'rejected');
    if (rejected.length > 0) {
      const errorMsg = `Failed to fetch ${rejected.length} endpoint(s): ${rejected.map(r => (r as PromiseRejectedResult).reason?.message).join(', ')}`;
      console.error('Analytics fetch errors:', errorMsg);
      return { error: true, message: errorMsg };
    }

    const jobs = jobsResult.status === 'fulfilled' ? jobsResult.value : [];
    const candidates = candidatesResult.status === 'fulfilled' ? candidatesResult.value : [];
    const interviews = interviewsResult.status === 'fulfilled' ? interviewsResult.value : [];
    const aiReports = aiReportsResult.status === 'fulfilled' ? aiReportsResult.value : [];

    if (jobsResult.status === 'rejected') console.warn(' Jobs endpoint failed');
    if (interviewsResult.status === 'rejected') console.warn(' Interviews endpoint failed');

    const activeJobs = jobs.filter((job: any) => 
      job.is_active !== false && 
      (!job.deleted_at || job.deleted_at === null) &&
      (!recruiterId || job.posted_by === recruiterId)
    );

    const total_applications = activeJobs.reduce((sum, job: any) => 
      sum + (job.candidate_count || 0), 0);

    const total_applicants = candidates.length;

    const scores = aiReports
      .map((r: any) => r.fit_score)
      .filter((s: any) => s != null && !isNaN(Number(s)));
    
    const avg_ai_fit_score = scores.length 
      ? Math.round((scores.reduce((a: number, b: number) => a + b, 0) / scores.length) * 10) / 10 
      : 0;

    const hiredCount = interviews.filter((i: any) => {
      const status = (i.status || '').toLowerCase();
      return status === 'hired' || status === 'offer_accepted';
    }).length;
    
    const uniqueCandidatesInInterviews = new Set(interviews.map((i: any) => i.candidate)).size;
    const acceptance_rate = uniqueCandidatesInInterviews > 0 
      ? Math.round((hiredCount / uniqueCandidatesInInterviews) * 1000) / 10 
      : 0;

  

const interviewMap = new Map(interviews.map((i: any) => [i.id, i]));
const jobMap = new Map(activeJobs.map((j: any) => [j.id, j]));

const aiByJob: Record<string, number[]> = {};

aiReports.forEach((report: any) => {
  const interview = interviewMap.get(report.interview);
  if (interview?.job) {
    const job = jobMap.get(interview.job);
    
    let jobTitle = 'Unknown Job';
    
    if (job) {
      const priorityFields = ['title', 'job_title', 'name', 'position', 'role', 'label'];
      for (const field of priorityFields) {
        const val = (job as any)[field];
        if (val && typeof val === 'string' && val.trim().length > 0) {
          jobTitle = val.trim();
          break;
        }
      }
      
      if (jobTitle === 'Unknown Job') {
        const keys = Object.keys(job).filter(k => 
          !k.toLowerCase().includes('id') && 
          !k.toLowerCase().includes('date') && 
          !k.toLowerCase().includes('time') &&
          !k.toLowerCase().includes('url')
        );
        
        for (const key of keys) {
          const val = (job as any)[key];
          if (val && typeof val === 'string' && val.length > 3 && val.length < 150) {
            jobTitle = val.trim();
            console.log(` Auto-detected title from field "${key}":`, jobTitle);
            break;
          }
        }
      }
    }
    
    if (!aiByJob[jobTitle]) aiByJob[jobTitle] = [];
    if (report.fit_score != null) {
      aiByJob[jobTitle].push(Number(report.fit_score));
    }
  }
});

const ai_fit_score_distribution = Object.entries(aiByJob)
  .map(([job_title, scores]) => ({
    job_title,
    average_score: Math.round((scores.reduce((a: number, b: number) => a + b, 0) / scores.length) * 10) / 10,
  }))
  .sort((a, b) => b.average_score - a.average_score)
  .slice(0, 5);

    const statusCounts: Record<string, number> = {};
    
    interviews.forEach((interview: any) => {
      const status = (interview.status || 'unknown').toLowerCase().replace(/\s+/g, '_');
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    const pipeline_breakdown = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count: count as number,
    }));

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const dailyCounts: Record<string, number> = {};
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      dailyCounts[days[date.getDay()]] = 0;
    }
    
    activeJobs.forEach(job => {
      const created = parseDate(job.created_at);
      if (created) {
        const daysAgo = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        if (daysAgo >= 0 && daysAgo < 7) {
          const dayName = getDayName(created);
          dailyCounts[dayName] = (dailyCounts[dayName] || 0) + (job.candidate_count || 0);
        }
      }
    });
    
    const applications_over_time = Object.entries(dailyCounts).map(([day, count]) => ({
      day,
      count: count as number,
    }));

    const applications_by_job = activeJobs
      .map((job: any) => ({
        job_title: job.title || `Job #${job.id}`,
        applications: job.candidate_count || 0,
      }))
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 5);

    return {
      total_applications,
      total_applicants,
      avg_ai_fit_score,
      acceptance_rate,
      ai_fit_score_distribution,
      pipeline_breakdown,
      applications_over_time,
      applications_by_job,
    };

  } catch (error: any) {
    console.error('Analytics aggregation error:', error);
    return { error: true, message: error?.message || 'Unknown analytics error' };
  }
}

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
        const cleanToken = token.replace(/^["']|["']$/g, '');
        config.headers.Authorization = `Token ${cleanToken}`;
      } else {
        console.warn(`⚠️ No token found in localStorage for: ${config.url}`);
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
        console.warn('🔐 [Auth] 401 detected - clearing auth and redirecting');
        
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
    
    if (typeof window !== 'undefined' && response.data?.token) {
      AUTH_STORAGE.saveAuth(
        response.data.token,
        response.data.user_type,
        String(response.data.user_id),
        true
      );
    }
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