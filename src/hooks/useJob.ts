import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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

export type DepartmentGroup = Record<string, { value: string; label: string }[]>;

const fetchJobs = async (): Promise<Job[]> => {
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

const fetchJob = async (jobId: string): Promise<Job> => {
  try {
    const response = await api.get(`/jobs/jobs/${jobId}/`);
    return response.data;
  } catch (error: any) {
    console.error(`Failed to fetch job ${jobId}:`, error);
    throw error;
  }
};

const createApplication = async (jobId: string): Promise<ApplicationResponse> => {
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

const normalizeJobType = (type: string): string => {
  return type?.toLowerCase().replace('_', '-') || 'full-time';
};

const formatPostedDate = (dateStr?: string): string => {
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

const formatDeadlineText = (deadline?: string | null): { text: string; className: string } | null => {
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

const formatSalary = (job: {
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

const cleanRequirement = (req: string): string => {
  return req.replace(/^[\s•\-\*]+/, '').trim();
};

export const useJobDetail = (jobId: string | undefined) => {
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) loadJob();
  }, [jobId]);

  const loadJob = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchJob(jobId as string);
      setJob(data);
      setErrorMessage(null); 
    } catch (error) {
      console.error('Failed to load job:', error);
      setErrorMessage('Failed to load job details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  const handleApply = useCallback(async () => {
    if (!jobId) return;
    
    setErrorMessage(null); 
    setApplying(true);
    
    try {
      const result: ApplicationResponse = await createApplication(jobId);
      
      if (result.exists) {
        setErrorMessage('You have already applied to this job. Redirecting...');
        setTimeout(() => {
          router.push(`/candidate/dashboard/cv?application=${result.id}`);
        }, 1500);
      } else {
        setErrorMessage('Application started! Redirecting to upload your CV...');
        setTimeout(() => {
          router.push(`/candidate/dashboard/cv?application=${result.id}`);
        }, 1500);
      }
      
    } catch (error: any) {
      if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
        setErrorMessage('Please login to continue.');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
        return;
      }
      
      if (error.message.startsWith('VALIDATION_ERROR:')) {
        const validationMsg = error.message.split(':')[1];
        try {
          const parsed = JSON.parse(validationMsg);
          const firstError = Object.values(parsed)[0] as string;
          setErrorMessage(firstError || 'Validation failed. Please check your input.');
        } catch {
          setErrorMessage(validationMsg || 'Validation failed.');
        }
        return;
      }
      
      setErrorMessage('Failed to start application. Please try again.');
    } finally {
      setApplying(false);
    }
  }, [jobId, router]);

  const clearError = useCallback(() => setErrorMessage(null), []);

  const salaryInfo = useMemo(() => job ? formatSalary(job) : { amount: '', detail: '' }, [job]);
  
  const formattedDeadline = useMemo(() => {
    if (!job?.application_deadline) return null;
    const date = new Date(job.application_deadline);
    return isNaN(date.getTime()) ? null : date.toLocaleDateString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    });
  }, [job]);

  const requirements = useMemo(() => {
    if (!job?.requirements) return [];
    return job.requirements
      .split('\n')
      .filter((r: string) => r.trim() !== '') 
      .map(cleanRequirement);
  }, [job]);
  
  const skills = useMemo(() => job?.core_skills || [], [job]);

  return {
    job,
    loading,
    applying,
    errorMessage, 
    
    handleApply,
    clearError,   
    
    salaryInfo,
    formattedDeadline,
    requirements,
    skills,
    
    goToJobs: () => router.push('/jobs'),
    goToDashboard: () => router.push('/candidate/dashboard'),
    goToProfile: () => router.push('/candidate/profile'),
  };
};

export const useBrowseJobs = () => {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentGroups, setDepartmentGroups] = useState<DepartmentGroup>({});
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState({ jobType: [] as string[], department: [] as string[] });

  useEffect(() => {
    loadJobs();
    loadDepartmentCategories();
  }, []);

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchJobs();
      setJobs(data);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDepartmentCategories = useCallback(async () => {
    try {
      const response = await api.get('/jobs/departments/categories/');
      setDepartmentGroups(response.data);
    } catch (error) {
      console.error('Failed to load department categories:', error);
      setDepartmentGroups({});
    }
  }, []);

  const toggleJobType = useCallback((value: string) => {
    setFilters(prev => ({
      ...prev,
      jobType: prev.jobType.includes(value) ? prev.jobType.filter(v => v !== value) : [...prev.jobType, value]
    }));
  }, []);

  const toggleDepartment = useCallback((value: string) => {
    setFilters(prev => ({
      ...prev,
      department: prev.department.includes(value) ? prev.department.filter(v => v !== value) : [...prev.department, value]
    }));
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ jobType: [], department: [] });
    setSearchQuery('');
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        job.title.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.location.toLowerCase().includes(searchLower) ||
        job.department.toLowerCase().includes(searchLower);

      const matchesJobType = filters.jobType.length === 0 || 
        filters.jobType.includes(normalizeJobType(job.employment_type));
      
      const deptNormalized = job.department.toLowerCase().replace(/_/g, ' ');
      const matchesDepartment = filters.department.length === 0 || 
        filters.department.includes(deptNormalized);

      return matchesSearch && matchesJobType && matchesDepartment;
    });
  }, [jobs, searchQuery, filters]);

  return {
    jobs: filteredJobs,
    loading,
    searchQuery,
    setSearchQuery,
    departmentGroups,
    expandedCategories,
    filters,
    toggleJobType,
    toggleDepartment,
    toggleCategory,
    clearFilters,
    getPostedDate: (job: Job) => formatPostedDate(job.created_at),
    getDeadlineText: (job: Job) => formatDeadlineText(job.application_deadline),
    goToJob: (id: string) => router.push(`/jobs/${id}`),
    goToDashboard: () => router.push('/candidate/dashboard'),
    goToProfile: () => router.push('/candidate/profile'),
  };
};