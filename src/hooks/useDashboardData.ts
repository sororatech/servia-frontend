'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dashboardAPI } from '@/lib/api';
import { AxiosError } from 'axios';

export const DASHBOARD_RECENT_LIMIT = 5;

export interface DashboardData {
  recruiterName: string;
  stats: {
    totalCandidates: number;
    shortlisted: number;
    interviewsThisWeek: number;
    avgAiScore: number | null;
  };
  recentApplications: Array<{
    id: string;
    candidate: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
    };
    job: {
      id: string;
      title: string;
    };
    applied_at: string;
    status: string;
    ai_score?: number;
  }>;
  openRoles: Array<{
    id: string;
    title: string;
    department?: string;
    location?: string;
    openings_count: number;
    applications_count: number;
  }>;
}

export function useDashboardData() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const results = await Promise.allSettled([
          dashboardAPI.getCurrentRecruiter(),
          dashboardAPI.getStats(),
          dashboardAPI.getRecentApplications(DASHBOARD_RECENT_LIMIT),
          dashboardAPI.getOpenRoles(DASHBOARD_RECENT_LIMIT),
        ]);

        const [recruiterResult, statsResult, appsResult, rolesResult] = results;

        const safeRecruiter = recruiterResult.status === 'fulfilled' ? recruiterResult.value : null;
        const safeStats = statsResult.status === 'fulfilled' ? statsResult.value : { totalCandidates: 0, shortlisted: 0, interviewsThisWeek: 0, avgAiScore: null };
        const safeApps = appsResult.status === 'fulfilled' ? appsResult.value : [];
        const safeRoles = rolesResult.status === 'fulfilled' ? rolesResult.value : [];

        setData({
          recruiterName: safeRecruiter?.first_name || 'Recruiter',
          stats: safeStats,
          recentApplications: safeApps,
          openRoles: safeRoles,
        });

        if (recruiterResult.status === 'rejected') {
          const err = recruiterResult.reason as unknown;
          if (err instanceof AxiosError && err.response?.status === 401) {
            router.push('/login');
            return;
          }
          setError('Failed to load dashboard data. Please try again.');
        }
      } catch (err: unknown) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to load dashboard', err);
        }
        
        if (err instanceof AxiosError && err.response?.status === 401) {
          router.push('/login');
          return;
        }
        
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  return { data, loading, error };
}