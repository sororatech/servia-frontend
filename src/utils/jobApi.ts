'use client';

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
  core_skills?: string[];
  openings_remaining?: number;
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