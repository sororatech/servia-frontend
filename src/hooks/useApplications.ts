import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { Application } from '@/types/applications';

export const useApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        
            const response = await api.get('/candidates/my-applications/', {
        timeout: 90000, // 90 seconds
      });
        
        let data = response.data;
        if (data?.results && Array.isArray(data.results)) {
          setApplications(data.results);
        } else if (Array.isArray(data)) {
          setApplications(data);
        } else {
          console.warn('Unexpected API response format:', data);
          setApplications([]);
        }
      } catch (err: any) {
        console.error('Failed to fetch applications:', err);
        
        if (err.response?.status === 401) {
          setError('Session expired. Please log in again.');
        } else if (err.response?.status === 403) {
          setError('You do not have permission to view applications.');
        } else {
          setError('Failed to load applications. Please try again.');
        }
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const response = await api.get('/candidates/my-applications/');
      let data = response.data;
      if (data?.results && Array.isArray(data.results)) {
        setApplications(data.results);
      } else if (Array.isArray(data)) {
        setApplications(data);
      }
    } catch (err) {
      console.error('Failed to refresh applications:', err);
    } finally {
      setLoading(false);
    }
  };

  return { applications, loading, error, refresh };
};