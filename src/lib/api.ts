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

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const publicRoutes = [
      '/users/login/', '/users/register/', '/users/verify-email/',
      '/users/resend-verification/', '/users/password-reset/'
    ];
    const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));
    if (!isPublicRoute) {
      let token = localStorage.getItem('auth_token');
      if (!token) {
        const match = document.cookie.match(/(?:^|;\s*)auth_token=([^;]+)/);
        token = match ? decodeURIComponent(match[1]) : null;
      }
      if (token) {
        const cleanToken = token.replace(/^["']|["']$/g, '');
        config.headers.Authorization = `Token ${cleanToken}`;
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

async function fetchAllResults<T>(url: string): Promise<T[]> {
  try {
    const { data } = await api.get<{ results: T[]; next: string | null }>(url);
    return data?.results || [];
  } catch (error) {
    console.warn(`️ Failed to fetch data for ${url}`);
    return [];
  }
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

export async function fetchAnalyticsFromMultipleEndpoints(): Promise<AnalyticsData> {
  const recruiterId = getCurrentRecruiterId();

  const [jobsResult, candidatesResult, interviewsResult, aiReportsResult] = await Promise.allSettled([
    fetchAllResults<any>(ENDPOINTS.JOBS),
    fetchAllResults<any>(ENDPOINTS.CANDIDATES),
    fetchAllResults<any>(ENDPOINTS.INTERVIEWS),
    fetchAllResults<any>(ENDPOINTS.AI_REPORTS),
  ]);

  const jobs = jobsResult.status === 'fulfilled' ? jobsResult.value : [];
  const candidates = candidatesResult.status === 'fulfilled' ? candidatesResult.value : [];
  const interviews = interviewsResult.status === 'fulfilled' ? interviewsResult.value : [];
  const aiReports = aiReportsResult.status === 'fulfilled' ? aiReportsResult.value : [];

  console.log('Jobs:', jobs);
  console.log('Candidates:', candidates);
  console.log('AI Reports:', aiReports);

  // ---- Build job map (all jobs) ----
  const allJobsMap = new Map(jobs.map((j: any) => [String(j.id), j]));

  // ---- Build candidate → job map ----
  const candidateJobMap = new Map<string, string>();
  candidates.forEach((c: any) => {
    if (c.id && c.job) {
      const jobId = typeof c.job === 'object' ? c.job.id : c.job;
      candidateJobMap.set(c.id, jobId);
    }
  });
  console.log('Candidate→Job map:', candidateJobMap);

  // ---- Link AI reports to jobs ----
  const aiByJob: Record<string, number[]> = {};
  aiReports.forEach((report: any) => {
    let jobId: string | null = null;
    // Try via interview
    const interviewId = report.interview ? (typeof report.interview === 'object' ? report.interview.id : report.interview) : null;
    if (interviewId) {
      const interview = interviews.find((i: any) => String(i.id) === String(interviewId));
      if (interview?.job) {
        jobId = typeof interview.job === 'object' ? interview.job.id : interview.job;
      }
    }
    // Fallback via candidate
    if (!jobId && report.candidate) {
      const candidateId = typeof report.candidate === 'object' ? report.candidate.id : report.candidate;
      jobId = candidateJobMap.get(String(candidateId)) || null;
    }
    if (jobId) {
      const job = allJobsMap.get(String(jobId));
      if (job) {
        const jobTitle = job.title || job.job_title || job.name || `Job #${String(job.id).slice(0, 8)}`;
        if (!aiByJob[jobTitle]) aiByJob[jobTitle] = [];
        if (report.fit_score != null) aiByJob[jobTitle].push(Number(report.fit_score));
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

  console.log('AI fit score distribution:', ai_fit_score_distribution);

  // ---- Active jobs (for other metrics) ----
  const activeJobs = jobs.filter((job: any) =>
    job.is_active !== false &&
    (!job.deleted_at || job.deleted_at === null) &&
    (!recruiterId || String(job.posted_by) === String(recruiterId))
  );

  const total_applications = activeJobs.reduce((sum: number, job: any) =>
    sum + (job.candidate_count || 0), 0);
  const total_applicants = candidates.length;

  const scores = aiReports
    .map((r: any) => r.fit_score)
    .filter((s: any) => s != null && !isNaN(Number(s)));
  const avg_ai_fit_score = scores.length
    ? Math.round((scores.reduce((a: number, b: number) => a + b, 0) / scores.length) * 10) / 10
    : 0;

  // ---- Acceptance rate ----
  const hiredCount = interviews.filter((i: any) => {
    const status = (i.status || '').toLowerCase();
    return status === 'hired' || status === 'offer_accepted';
  }).length;
  const uniqueCandidatesInInterviews = new Set(interviews.map((i: any) => i.candidate)).size;
  const acceptance_rate = uniqueCandidatesInInterviews > 0
    ? Math.round((hiredCount / uniqueCandidatesInInterviews) * 1000) / 10
    : 0;

  // ---- Pipeline breakdown ----
  const statusCounts: Record<string, number> = {};
  interviews.forEach((interview: any) => {
    const status = (interview.status || 'unknown').toLowerCase().replace(/\s+/g, '_');
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  const pipeline_breakdown = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count: count as number,
  }));

  // ---- Applications over time ----
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  const dailyCounts: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (6 - i));
    dailyCounts[days[date.getDay()]] = 0;
  }
  candidates.forEach((candidate: any) => {
    const appliedDate = parseDate(candidate.created_at || candidate.applied_at);
    if (appliedDate) {
      const daysAgo = Math.floor((now.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysAgo >= 0 && daysAgo < 7) {
        const dayName = getDayName(appliedDate);
        dailyCounts[dayName] = (dailyCounts[dayName] || 0) + 1;
      }
    }
  });
  const applications_over_time = Object.entries(dailyCounts).map(([day, count]) => ({
    day,
    count: count as number,
  }));

  // ---- Applications by job (using active jobs only) ----
  const applications_by_job = activeJobs
    .map((job: any) => ({
      job_title: job.title || job.job_title || job.name || `Job #${job.id}`,
      applications: job.candidate_count || 0,
    }))
    .sort((a, b) => b.applications - a.applications)
    .slice(0, 5);

  console.log('Applications by job:', applications_by_job);

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
}

export interface LoginCredentials { email: string; password: string; }
export interface LoginResponse {
  user_id: string; user_type: 'candidate' | 'recruiter'; token: string;
  email: string; first_name: string; last_name: string;
}
export interface RegisterData {
  user: { email: string; password: string; first_name: string; last_name: string; };
  phone?: string; nationality?: string;
}
export interface VerificationData { email: string; code: string; }

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
  async confirmPasswordReset(uid: string, token: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/users/password-reset/confirm/', {
      uid, token, new_password: newPassword,
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
    try { await api.post('/users/logout/'); } catch (err) { console.error("Logout failed:", err); }
    finally {
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

  async getInterviews(): Promise<any[]> {
    return fetchAllResults('/interviews/interviews/');
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