'use client';

import { LoadingSkeleton } from '@/components/ui';
import OverviewStats from './components/OverviewStats';
import RecentApplications from './components/RecentApplications';
import OpenRolesProgress from './components/OpenRolesProgress';
import { useDashboardData } from '@/hooks/useDashboardData';

export default function RecruiterOverviewPage() {
  const { data, loading, error } = useDashboardData();

  if (loading) {
    return (
      <div className="min-h-screen bg-page-gradient px-4 py-8 sm:px-6 lg:px-50">
        <div className="mx-auto max-w-7xl space-y-6">
          <LoadingSkeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <LoadingSkeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
          <LoadingSkeleton className="h-96 rounded-2xl" />
          <LoadingSkeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-page-gradient px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Provide fallback if data is null or incomplete
  const safeData = data || {
    recruiterName: 'Recruiter',
    stats: {
      totalCandidates: 0,
      shortlisted: 0,
      interviewsThisWeek: 0,
      avgAiScore: null,
    },
    recentApplications: [],
    openRoles: [],
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-page-gradient px-4 py-8 sm:px-6 lg:px-25">
      <div className="mx-auto max-w-8xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--color-secondary)]" spellCheck={false}>
            {getTimeGreeting()}, {safeData.recruiterName}!
          </h1>
          <p className="text-[var(--color-text-muted)] mt-2">
            Here&apos;s what has happened with your recruitment pipeline today.
          </p>
        </div>

        {/* Pass stats explicitly */}
        <OverviewStats
          totalCandidates={safeData.stats.totalCandidates ?? 0}
          shortlisted={safeData.stats.shortlisted ?? 0}
          interviewsThisWeek={safeData.stats.interviewsThisWeek ?? 0}
          avgAiScore={safeData.stats.avgAiScore ?? null}
        />

        <RecentApplications applications={safeData.recentApplications ?? []} />
        <OpenRolesProgress roles={safeData.openRoles ?? []} />
      </div>
    </div>
  );
}