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
  
  // ✅ Ref to track mounted state (prevents state updates after unmount)
  const isMountedRef = useRef(true);
  // ✅ Ref to store active timeout ID (ensures cleanup on unmount)
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ✅ FIX: Properly initialize isMountedRef on mount AND cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;  // ✅ Set to true when component mounts
    return () => {
      isMountedRef.current = false;  // Set to false when component unmounts
      // Clear any pending setTimeout to prevent memory leaks
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    };
  }, []); // Empty deps = runs only on mount/unmount

  // ✅ safeRedirect: Stores timeout in ref and checks mounted state before executing
  const safeRedirect = useCallback((url: string, delayMs = 0) => {
    // Clear any existing pending redirect to avoid stacking timeouts
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
    
    if (delayMs === 0) {
      // Immediate redirect - no setTimeout needed
      router.push(url);
    } else {
      // Store timeout in ref so cleanup effect can clear it on unmount
      redirectTimerRef.current = setTimeout(() => {
        // Only execute redirect if component is still mounted
        if (isMountedRef.current) {
          router.push(url);
        }
      }, delayMs);
    }
  }, [router]);

  // ✅ Load job when jobId changes
  useEffect(() => {
    if (!jobId) {
      // No jobId means invalid route - stop loading and show error
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
        // ✅ Always stop loading, even if component unmounts (safe because setLoading is idempotent)
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadJob();

    // Cleanup: prevent state updates if component unmounts during fetch
    return () => {
      isCancelled = true;
    };
  }, [jobId]); // Re-run when jobId changes

  // ✅ handleApply: Immediate redirect for new applications, safeRedirect for existing
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
      
      // ✅ Support both id and application_id fields from backend
      const applicationId = result.id || result.application_id;
      
      if (!applicationId) {
        console.error('Missing application ID in response:', result);
        setErrorMessage('Application created but missing ID. Please try again.');
        setApplying(false);
        return;
      }
      
      // ✅ NEW APPLICATION: Immediate redirect (no setTimeout = no cleanup needed)
      if (!result.exists) {
        // Clear any pending redirects first
        if (redirectTimerRef.current) {
          clearTimeout(redirectTimerRef.current);
          redirectTimerRef.current = null;
        }
        router.push(`/candidate/dashboard/cv?application=${applicationId}`);
        return;
      }
      
      // ✅ EXISTING APPLICATION: Use safeRedirect with cleanup guarantee
      setErrorMessage('You have already applied to this job. Redirecting...');
      safeRedirect(`/candidate/dashboard/cv?application=${applicationId}`, 1500);
      
    } catch (error: any) {
      if (!isMountedRef.current) return;
      
      console.error('Apply error:', error);
      
      // Auth errors → redirect to login with return URL
      if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
        setErrorMessage('Please login to continue.');
        const returnTo = encodeURIComponent(`/jobs/${jobId}`);
        safeRedirect(`/login?returnTo=${returnTo}`, 1500);
        return;
      }
      
      // Validation errors (including "already applied" from backend)
      if (error.message.startsWith('VALIDATION_ERROR:')) {
        const validationMsg = error.message.split(':')[1];
        try {
          const parsed = JSON.parse(validationMsg);
          // ✅ If backend returns exists: true with id, redirect immediately
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
      
      // Generic error
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