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
      <div className="min-h-screen bg-page-gradient px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1400px] space-y-6">
          <LoadingSkeleton className="h-10 w-64 rounded-xl" />
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
        <div className="mx-auto max-w-[1400px] flex items-center justify-center h-64">
          {/* Matched the error card styling from JobsGrid */}
          <div className="text-center rounded-2xl border border-[var(--color-status-error-border)] bg-[var(--color-status-error-bg)] px-6 py-8">
            <p className="text-[var(--color-status-error-text)] mb-4 font-medium">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-full bg-[var(--color-primary)] text-white font-semibold text-sm hover:bg-[var(--color-primary-hover)] transition-colors"
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
    // Changed to <main> for semantic HTML, fixed px-25 to px-10 to match other pages
    <main className="min-h-screen bg-page-gradient px-4 py-8 sm:px-6 lg:px-10">
      {/* Changed max-w-8xl to max-w-[1400px] to perfectly align with Candidates/Jobs pages */}
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            {/* Changed text-[var(--color-secondary)] to text-[var(--color-foreground)] for dark mode readability */}
            <h1 
              className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[var(--color-foreground)] sm:text-5xl" 
              spellCheck={false}
            >
              {getTimeGreeting()}, {safeData.recruiterName}!
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-[var(--color-text-muted)]">
              Here&apos;s what has happened with your recruitment pipeline today.
            </p>
          </div>
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
    </main>
  );
}