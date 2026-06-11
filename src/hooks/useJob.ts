import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

import { 
  fetchJobs, 
  fetchJob, 
  createApplication, 
  Job, 
  ApplicationResponse,
  normalizeJobType,
  formatPostedDate,
  formatDeadlineText,
  formatSalary,
  cleanRequirement,
} from '@/utils/jobApi';

export type DepartmentGroup = Record<string, { value: string; label: string }[]>;

export const useJobDetail = (jobId: string | undefined) => {
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const isMountedRef = useRef(true);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isMountedRef.current = true;  
    return () => {
      isMountedRef.current = false;  
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    };
  }, []); 

  const safeRedirect = useCallback((url: string, delayMs = 0) => {
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
    
    if (delayMs === 0) {
      router.push(url);
    } else {
      redirectTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          router.push(url);
        }
      }, delayMs);
    }
  }, [router]);

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      setErrorMessage('Invalid job ID');
      return;
    }
    
    let isCancelled = false;

    const loadJob = async () => {
      try {
        setLoading(true);
        const data = await fetchJob(jobId);
        if (!isCancelled) {
          setJob(data);
          setErrorMessage(null);
        }
      } catch (error) {
        console.error('Failed to load job:', error);
        if (!isCancelled) {
          setErrorMessage('Failed to load job details. Please try again.');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadJob();

    return () => {
      isCancelled = true;
    };
  }, [jobId]); 

  const handleApply = useCallback(async () => {
    if (!jobId) {
      setErrorMessage('Invalid job ID');
      return;
    }
    
    if (isMountedRef.current) {
      setErrorMessage(null);
      setApplying(true);
    }
    
    try {
      const result: ApplicationResponse = await createApplication(jobId);
      
      if (!isMountedRef.current) return;
      
      const applicationId = result.id || result.application_id;
      
      if (!applicationId) {
        console.error('Missing application ID in response:', result);
        setErrorMessage('Application created but missing ID. Please try again.');
        setApplying(false);
        return;
      }
      
      if (!result.exists) {
        if (redirectTimerRef.current) {
          clearTimeout(redirectTimerRef.current);
          redirectTimerRef.current = null;
        }
        router.push(`/candidate/dashboard/cv?application=${applicationId}`);
        return;
      }
      
      setErrorMessage('You have already applied to this job. Redirecting...');
      safeRedirect(`/candidate/dashboard/cv?application=${applicationId}`, 1500);
      
    } catch (error: any) {
      if (!isMountedRef.current) return;
      
      console.error('Apply error:', error);
      
      if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
        setErrorMessage('Please login to continue.');
        const returnTo = encodeURIComponent(`/jobs/${jobId}`);
        safeRedirect(`/login?returnTo=${returnTo}`, 1500);
        return;
      }
      
      if (error.message.startsWith('VALIDATION_ERROR:')) {
        const validationMsg = error.message.split(':')[1];
        try {
          const parsed = JSON.parse(validationMsg);
          if (parsed.exists && parsed.id) {
            router.push(`/candidate/dashboard/cv?application=${parsed.id}`);
            return;
          }
          const firstError = Object.values(parsed)[0] as string;
          setErrorMessage(firstError || 'Validation failed. Please check your input.');
        } catch {
          setErrorMessage(validationMsg || 'Validation failed.');
        }
        return;
      }
      
      setErrorMessage('Failed to start application. Please try again.');
      
    } finally {
      if (isMountedRef.current) {
        setApplying(false);
      }
    }
  }, [jobId, router, safeRedirect]);

  const clearError = useCallback(() => {
    if (isMountedRef.current) {
      setErrorMessage(null);
    }
  }, []);

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
    clearError,
    handleApply,
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
    const now = Date.now(); 
    
    return jobs.filter(job => {
      // Exclude expired jobs
      if (job.application_deadline) {
        const deadlineTime = new Date(job.application_deadline).getTime();
        if (deadlineTime < now) {
          return false; 
        }
      }

      const matchesSearch = !searchQuery || 
        job.title.toLowerCase().includes(searchQuery.toLowerCase());

      // Job type filter
      const matchesJobType = filters.jobType.length === 0 || 
        filters.jobType.includes(normalizeJobType(job.employment_type));
      
      // Department filter
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