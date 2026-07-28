'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dashboardAPI } from '@/lib/api';
import { AxiosError } from 'axios';

export const DASHBOARD_RECENT_LIMIT = 5;

interface BackendStats {
  total_jobs: number;
  total_candidates: number;
  pending_review: number;
}

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
          dashboardAPI.getInterviews(), 
        ]);

        const [recruiterResult, statsResult, appsResult, rolesResult, interviewsResult] = results;

        const safeRecruiter = recruiterResult.status === 'fulfilled' ? recruiterResult.value : null;
        const safeStats = (statsResult.status === 'fulfilled' ? statsResult.value : {}) as BackendStats;
        const safeApps = appsResult.status === 'fulfilled' ? appsResult.value : [];
        const safeRoles = rolesResult.status === 'fulfilled' ? rolesResult.value : [];
        const safeInterviews = interviewsResult.status === 'fulfilled' ? interviewsResult.value : [];

        // Compute interviews this week (Sunday–Saturday)
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 = Sunday
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const interviewsThisWeek = safeInterviews.filter((interview: any) => {
          if (!interview.scheduled_time) return false;
          const scheduled = new Date(interview.scheduled_time);
          return scheduled >= startOfWeek && scheduled <= endOfWeek;
        }).length;

        // Map backend stats to frontend expected shape
        const mappedStats = {
          totalCandidates: safeStats.total_candidates ?? 0,
          shortlisted: safeApps.filter((app: any) => app.status?.toLowerCase() === 'shortlisted').length,
          interviewsThisWeek,
          avgAiScore: safeApps.length > 0
            ? Math.round(safeApps.reduce((sum: number, app: any) => sum + (app.ai_score || 0), 0) / safeApps.length)
            : null,
        };

        setData({
          recruiterName: safeRecruiter?.first_name || 'Recruiter',
          stats: mappedStats,
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