import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { Application } from '@/types/applications';
import { CanceledError } from 'axios';

export const useApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/candidates/my-applications/', {
          signal: abortController.signal,
          timeout: 60000,
        });
        const data = response.data;
        if (data?.results && Array.isArray(data.results)) {
          setApplications(data.results);
        } else if (Array.isArray(data)) {
          setApplications(data);
        } else {
          setApplications([]);
        }
      } catch (err: any) {
        if (err instanceof CanceledError || err.name === 'CanceledError') {
          return; // ignore
        }
        console.error('Failed to fetch applications:', err);
        if (err.response?.status === 401) setError('Session expired. Please log in again.');
        else if (err.response?.status === 403) setError('You do not have permission to view applications.');
        else setError('Failed to load applications. Please try again.');
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
    return () => abortController.abort();
  }, []);

  const refresh = async () => {
    const abortController = new AbortController();
    setLoading(true);
    try {
      const response = await api.get('/candidates/my-applications/', { signal: abortController.signal });
      const data = response.data;
      if (data?.results && Array.isArray(data.results)) setApplications(data.results);
      else if (Array.isArray(data)) setApplications(data);
    } catch (err) {
      if (err instanceof CanceledError) return;
      console.error('Failed to refresh applications:', err);
    } finally {
      setLoading(false);
    }
  };

  return { applications, loading, error, refresh };
};