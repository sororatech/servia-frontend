import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { CanceledError } from 'axios';

interface UseApplicationDetailReturn {
  application: any;
  jobDetails: any;
  loading: boolean;
  error: string | null;
  withdraw: () => Promise<void>;
  withdrawing: boolean;
  showWithdrawModal: boolean;
  setShowWithdrawModal: (show: boolean) => void;
  showCVPreview: boolean;
  setShowCVPreview: (show: boolean) => void;
  refresh: () => Promise<void>;
}

export const useApplicationDetail = (id: string): UseApplicationDetailReturn => {
  const [application, setApplication] = useState<any>(null);
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showCVPreview, setShowCVPreview] = useState(false);

  const fetchApplication = useCallback(async (signal: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/candidates/candidates/${id}/`, { timeout: 30000, signal });
      const appData = response.data;
      setApplication(appData);

      if (typeof appData.job === 'string' && appData.job) {
        try {
          const jobRes = await api.get(`/jobs/jobs/${appData.job}/`, { timeout: 15000, signal });
          setJobDetails(jobRes.data);
        } catch (jobErr) {
          if (!(jobErr instanceof CanceledError)) console.error('Failed to fetch job details:', jobErr);
        }
      } else if (appData.job && typeof appData.job === 'object') {
        setJobDetails(appData.job);
      }
    } catch (err: any) {
      if (err instanceof CanceledError || err.name === 'CanceledError') return;
      console.error('Failed to fetch application:', err);
      let errorMsg = 'Unable to load application details. Please try again later.';
      if (err.code === 'ECONNABORTED') errorMsg = 'Request timed out. The server may be busy. Please try again later.';
      else if (err.response?.status === 401) errorMsg = 'Session expired. Please log in again.';
      else if (err.response?.status === 404) errorMsg = 'Application not found.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const abortController = new AbortController();
    fetchApplication(abortController.signal);
    return () => abortController.abort();
  }, [fetchApplication]);

  const withdraw = async () => {
    setWithdrawing(true);
    setError(null);
    try {
      await api.patch(`/candidates/candidates/${id}/`, { status: 'withdrawn' }, { timeout: 30000 });
      const abortController = new AbortController();
      await fetchApplication(abortController.signal);
      setShowWithdrawModal(false);
    } catch (err: any) {
      console.error('Failed to withdraw application:', err);
      let errorMsg = 'Failed to withdraw application. Please try again.';
      if (err.code === 'ECONNABORTED') {
        errorMsg = 'Request timed out. The server may be busy. Please try again later.';
      } else if (err.response?.data?.status) {
        errorMsg = err.response.data.status;
      } else if (err.response?.data?.non_field_errors) {
        errorMsg = err.response.data.non_field_errors.join(', ');
      }
      setError(errorMsg);
    } finally {
      setWithdrawing(false);
    }
  };

  const refresh = async () => {
    const abortController = new AbortController();
    await fetchApplication(abortController.signal);
  };

  return {
    application,
    jobDetails,
    loading,
    error,
    withdraw,
    withdrawing,
    showWithdrawModal,
    setShowWithdrawModal,
    showCVPreview,
    setShowCVPreview,
    refresh,
  };
};