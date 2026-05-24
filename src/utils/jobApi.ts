import { api } from '@/lib/api';

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  description: string;
  requirements?: string;
  posted_date?: string;
  is_active?: boolean;
  salary?: string;
  salary_range?: string;
  salary_min?: number | string;
  salary_max?: number | string;
  salary_currency?: string;
  salary_period?: string;
  core_skills?: string[];
  openings_remaining?: number;
  application_deadline?: string | null;
  created_at?: string;
}

export interface ApplicationResponse {
  id: string;
  exists?: boolean;
  [key: string]: any;
}

export interface JobsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Job[];
}

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('auth_token');
  if (!token) return null;
  return token.replace(/^["'](.+)["']$/, '$1');
};

export const fetchJobs = async (): Promise<Job[]> => {
  try {
    const response = await api.get('/jobs/jobs/');
    const data = response.data;
    
    if (Array.isArray(data)) return data;
    if (data.results && Array.isArray(data.results)) return data.results;
    return [];
  } catch (error: any) {
    console.error('Failed to fetch jobs:', error);
    throw error;
  }
};

export const fetchJob = async (jobId: string): Promise<Job> => {
  try {
    const response = await api.get(`/jobs/jobs/${jobId}/`);
    return response.data;
  } catch (error: any) {
    console.error(`Failed to fetch job ${jobId}:`, error);
    throw error;
  }
};

export const createApplication = async (jobId: string): Promise<ApplicationResponse> => {
  try {
    const response = await api.post('/candidates/candidates/', { job: jobId });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('UNAUTHORIZED');
    } else if (error.response?.status === 403) {
      throw new Error('FORBIDDEN');
    } else if (error.response?.status === 400) {
      const errorData = error.response?.data || {};
      throw new Error(`VALIDATION_ERROR:${JSON.stringify(errorData)}`);
    }
    throw new Error(`FAILED:${error.response?.status || error.message}`);
  }
};

export const checkApplicationExists = async (jobId: string): Promise<boolean> => {
  try {
    const token = getAuthToken();
    if (!token) return false;
    
    const response = await api.get(`/candidates/candidates/?job=${jobId}`);
    return response.data?.count > 0;
  } catch {
    return false;
  }
};


export type JobType = 'full-time' | 'part-time' | 'contract' | string;

export const normalizeJobType = (type: string): JobType => {
  return type?.toLowerCase().replace('_', '-') || 'full-time';
};

export const formatPostedDate = (dateStr?: string): string => {
  if (!dateStr) return 'Recently Posted';
  
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

export const formatDeadlineText = (deadline?: string | null): { text: string; className: string } | null => {
  if (!deadline) return null;
  
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { text: 'Closed', className: 'text-gray-400' };
  if (diffDays === 0) return { text: '• Closes today', className: 'text-red-500 font-medium' };
  if (diffDays === 1) return { text: '• 1 day left', className: 'text-orange-500 font-medium' };
  if (diffDays <= 3) return { text: `• ${diffDays} days left`, className: 'text-orange-500' };
  if (diffDays <= 7) return { text: `• ${diffDays} days left`, className: 'text-yellow-600' };
  return { text: `• ${diffDays} days remaining`, className: 'text-green-400' };
};

export const formatSalary = (job: {
  salary?: string;
  salary_range?: string;
  salary_min?: number | string;
  salary_max?: number | string;
  salary_currency?: string;
  salary_period?: string;
}): { amount: string; detail: string } => {
  const amount = job.salary_range || job.salary || 
    (job.salary_min && job.salary_max ? `${job.salary_min} - ${job.salary_max}` : 'Not specified');
  
  const currency = job.salary_currency || '';
  const period = job.salary_period || '';
  const detail = currency || period ? `${currency}/${period}` : '';
  
  return { amount, detail };
};

export const cleanRequirement = (req: string): string => {
  return req.replace(/^[\s•\-\*]+/, '').trim();
};