import { redirect } from 'next/navigation';
import ScheduleInterviewButton from '@/components/recruiter/ScheduleInterviewButton';
import InterviewTable from '@/components/recruiter/InterviewTable';
import ShortlistedCandidates from '@/components/recruiter/ShortlistedCandidates';
import { getRecruiterHeaders, SessionExpiredError } from '@/utils/serverFetch';
import { getInterviewsPageData } from '@/hooks/useInterviewsPageData';

export default async function RecruiterInterviewsPage() {
  const headers = await getRecruiterHeaders();

  if (!headers) {
    redirect('/login');
  }

  let pageData: Awaited<ReturnType<typeof getInterviewsPageData>>;
  try {
    pageData = await getInterviewsPageData(headers);
  } catch (error) {
    if (error instanceof SessionExpiredError) redirect('/api/auth/clear-session');
    throw error;
  }

  const { stats, interviews, shortlisted } = pageData;

  return (
    <main className="min-h-screen bg-page-gradient px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1400px]">

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[var(--color-foreground)] sm:text-5xl">
              Interview Overview
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-[var(--color-text-muted)]">
              Track and manage your interview pipeline, sorted by scheduled date.
            </p>
          </div>
          <ScheduleInterviewButton />
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total Interviews', value: stats.total },
            { label: 'Completed', value: stats.completed },
            { label: 'Pending', value: stats.pending },
            { label: 'Avg Interview Score', value: stats.avgScore !== null ? `${stats.avgScore}%` : 'N/A' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-[1.5rem] border border-black/10 bg-white/85 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm"
            >
              <p className="text-sm font-medium text-[var(--color-text-faint)]">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--color-primary)]">{stat.value}</p>
            </div>
          ))}
        </div>

        <ShortlistedCandidates candidates={shortlisted} />

        <InterviewTable interviews={interviews} />
      </div>
    </main>
  );
}
