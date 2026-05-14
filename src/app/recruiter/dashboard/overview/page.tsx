'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoadingSkeleton } from '@/components/ui';
import OverviewStats from './components/OverviewStats';
import RecentApplications from './components/RecentApplications';
import OpenRolesProgress from './components/OpenRolesProgress';
import { dashboardAPI } from '@/lib/api';

export default function RecruiterOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [recruiterName, setRecruiterName] = useState('');
  const [stats, setStats] = useState({
    totalCandidates: 0,
    shortlisted: 0,
    interviewsThisWeek: 0,
    avgAiScore: null as number | null,
  });
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [openRoles, setOpenRoles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [recruiter, statsData, applications, roles] = await Promise.all([
          dashboardAPI.getCurrentRecruiter(),
          dashboardAPI.getStats(),
          dashboardAPI.getRecentApplications(5),
          dashboardAPI.getOpenRoles(5),
        ]);

        setRecruiterName(recruiter.first_name || 'Recruiter');
        setStats(statsData);
        setRecentApplications(applications);
        setOpenRoles(roles);
      } catch (err) {
        console.error('Failed to load dashboard ', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="px-6 lg:px-10 py-8">
          <div className="space-y-6">
            <LoadingSkeleton className="h-10 w-64" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <LoadingSkeleton key={i} className="h-32" />
              ))}
            </div>
            <LoadingSkeleton className="h-96" />
            <LoadingSkeleton className="h-80" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="px-6 lg:px-10 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout>
      {/* Page Background is default white */}
      <div className="px-6 lg:px-10 py-8 min-h-screen">
        {/* Welcome Header - spellCheck false prevents red underline */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#0F2A44]" spellCheck={false}>
            Welcome back, {recruiterName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what has happened with your recruitment pipeline today.
          </p>
        </div>

        {/* Stats Cards */}
        <OverviewStats {...stats} />

        {/* Recent Applications */}
        <RecentApplications applications={recentApplications} />

        {/* Open Roles Progress */}
        <OpenRolesProgress roles={openRoles} />
      </div>
    </DashboardLayout>
  );
}