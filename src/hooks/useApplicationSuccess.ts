import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import {
  extractJobInfo,
  extractRecruiterInfo,
  DEFAULT_RECRUITER,
  getStatusColor,
  getProgressWidth,
  formatStatus,
} from '@/utils/applicationSuccess';

export interface JobInfo {
  title: string;
  department: string;
  location: string;
  company?: string;
  recruiter?: {
    name: string;
    title: string;
    quote: string;
  } | null;
}

export interface ApplicationData {
  id: string;
  status: string;
  created_at: string;
  job: string | JobInfo | null;
}

export interface UseApplicationSuccessReturn {
  applicationData: ApplicationData | null;
  jobDetails: JobInfo | null;
  loading: boolean;
  error: string | null;
  
  refresh: () => Promise<void>;
  handleViewDashboard: () => void;
  handleReturnToJobs: () => void;
  
  getStatusColor: (status: string) => string;
  getProgressWidth: (status: string) => string;
  formatStatus: (status: string) => string;
  getDisplayJobTitle: () => string;
  getDisplayCompany: () => string;
  getDisplayRecruiter: () => typeof DEFAULT_RECRUITER;
}

export const useApplicationSuccess = (): UseApplicationSuccessReturn => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [jobDetails, setJobDetails] = useState<JobInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobDetails = useCallback(async (jobId: string) => {
    try {
      const response = await api.get(`/jobs/jobs/${jobId}/`);
      const jobData = response.data;
      
      if (!jobData) return null;
      
      const info = extractJobInfo(jobData);
      if (info) {
        setJobDetails(info as JobInfo);
        
        if (!jobData.recruiter && !jobData.hiring_manager) {
          await fetchRecruiterInfo(info.department);
        }
      }
      return info;
    } catch (err) {
      console.error('Error fetching job details:', err);
      return null;
    }
  }, []);

  const fetchRecruiterInfo = useCallback(async (department: string) => {
    try {
      const response = await api.get('/recruiters/', {
        params: { department }
      });
      
      const recruiter = extractRecruiterInfo(response.data);
      if (recruiter) {
        setJobDetails(prev => prev ? {
          ...prev,
          recruiter: {
            name: recruiter.name,
            title: recruiter.title,
            quote: recruiter.quote,
          }
        } : prev);
      }
    } catch (err: any) {
      if (err.response?.status !== 404) {
        console.error('Error fetching recruiter info:', err);
      }
    }
  }, []);

  const fetchSpecificApplication = useCallback(async (appId: string) => {
    try {
      const response = await api.get(`/candidates/candidates/${appId}/`);
      const appData = response.data;
      
      setApplicationData(appData);
      
      if (typeof appData.job === 'string') {
        await fetchJobDetails(appData.job);
      } else if (appData.job && typeof appData.job === 'object') {
        const info = extractJobInfo(appData.job);
        if (info) {
          setJobDetails(info as JobInfo);
        }
      }
    } catch (err) {
      console.error('Error fetching specific application:', err);
      await fetchMostRecentApplication();
    }
  }, [fetchJobDetails]);

  const fetchMostRecentApplication = useCallback(async () => {
    try {
      const response = await api.get('/candidates/candidates/');
      const data = response.data;
      const applications = data.results || data;
      
      if (applications?.length > 0) {
        const latestApp = applications[0];
        setApplicationData(latestApp);
        
        if (typeof latestApp.job === 'string') {
          await fetchJobDetails(latestApp.job);
        } else if (latestApp.job && typeof latestApp.job === 'object') {
          const info = extractJobInfo(latestApp.job);
          if (info) {
            setJobDetails(info as JobInfo);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching most recent application:', err);
      setError('Failed to load application data');
    }
  }, [fetchJobDetails]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const applicationId = searchParams.get('applicationId');
      
      if (applicationId) {
        await fetchSpecificApplication(applicationId);
      } else {
        await fetchMostRecentApplication();
      }
    } catch (err) {
      console.error('Error fetching application data', err);
      setError('Failed to load application data');
    } finally {
      setLoading(false);
    }
  }, [searchParams, fetchSpecificApplication, fetchMostRecentApplication]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => fetchData(), [fetchData]);

  const handleViewDashboard = useCallback(() => {
    router.push('/candidate/dashboard');
  }, [router]);

  const handleReturnToJobs = useCallback(() => {
    router.push('/');
  }, [router]);

  const getDisplayJobTitle = useCallback((): string => {
    return jobDetails?.title || 'Position Applied';
  }, [jobDetails]);

  const getDisplayCompany = useCallback((): string => {
    return jobDetails?.department || jobDetails?.company || jobDetails?.location || 'Servia Hotels';
  }, [jobDetails]);

  const getDisplayRecruiter = useCallback((): typeof DEFAULT_RECRUITER => {
    return jobDetails?.recruiter || DEFAULT_RECRUITER;
  }, [jobDetails]);

  return {
    applicationData,
    jobDetails,
    loading,
    error,
    
    refresh,
    handleViewDashboard,
    handleReturnToJobs,
    
    getStatusColor,
    getProgressWidth,
    formatStatus,
    getDisplayJobTitle,
    getDisplayCompany,
    getDisplayRecruiter,
  };
};