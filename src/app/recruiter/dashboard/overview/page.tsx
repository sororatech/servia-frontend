'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoadingSkeleton } from '@/components/ui';
import OverviewStats from './components/OverviewStats';
import RecentApplications from './components/RecentApplications';
import OpenRolesProgress from './components/OpenRolesProgress';
import { useDashboardData } from '@/hooks/useDashboardData';

export default function RecruiterOverviewPage() {
  const { data, loading, error } = useDashboardData();

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
                className="px-4 py-2 bg-[#26B9C8] text-white rounded-lg hover:bg-[#26B9C8]/90 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) return null;

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout>
      <div className="px-6 lg:px-10 py-8 min-h-screen bg-white">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#0F2A44]" spellCheck={false}>
            {getTimeGreeting()}, {data.recruiterName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here&apos;s what has happened with your recruitment pipeline today.
          </p>
        </div>
        <OverviewStats {...data.stats} />
        <RecentApplications applications={data.recentApplications} />
        <OpenRolesProgress roles={data.openRoles} />
      </div>
    </DashboardLayout>
  );
}