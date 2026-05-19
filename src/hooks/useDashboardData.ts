'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dashboardAPI } from '@/lib/api';

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

        const [recruiter, statsData, applications, roles] = await Promise.all([
          dashboardAPI.getCurrentRecruiter(),
          dashboardAPI.getStats(),
          dashboardAPI.getRecentApplications(5),
          dashboardAPI.getOpenRoles(5),
        ]);

        setData({
          recruiterName: recruiter?.first_name || 'Recruiter',
          stats: statsData,
          recentApplications: applications,
          openRoles: roles,
        });
      } catch (err: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to load dashboard ', err);
        }
        
        if (err.response?.status === 401) {
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