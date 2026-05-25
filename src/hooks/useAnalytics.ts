'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAnalyticsFromMultipleEndpoints } from '@/lib/api';
import { AnalyticsData } from '../types/analytics';

interface UseAnalyticsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; 
  initialData?: AnalyticsData;
}

export function useAnalytics({ 
  autoRefresh = false, 
  refreshInterval = 30000, 
  initialData 
}: UseAnalyticsOptions = {}) {
  const [data, setData] = useState<AnalyticsData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchAnalyticsFromMultipleEndpoints();
      setData(result);
    } catch (err: any) {
      if (err?.response?.status === 401 || err?.message?.includes('401')) {
        console.warn('Auth required. Redirecting to login...');
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return; 
      }
      
      setError(err instanceof Error ? err : new Error('Failed to fetch analytics'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!data) {
      fetchData();
    }
    
    if (autoRefresh && data) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchData, data]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
  };
}