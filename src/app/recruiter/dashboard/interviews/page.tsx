import { redirect } from 'next/navigation';
import ScheduleInterviewButton from '@/components/recruiter/ScheduleInterviewButton';
import InterviewTable from '@/components/recruiter/InterviewTable';
import ShortlistedCandidates from '@/components/recruiter/ShortlistedCandidates';
import { getRecruiterHeaders } from '@/utils/serverFetch';
import { getInterviewsPageData } from '@/hooks/useInterviewsPageData';

export default async function RecruiterInterviewsPage() {
  const headers = await getRecruiterHeaders();

  if (!headers) {
    redirect('/login');
  }

  const { stats, interviews, shortlisted } = await getInterviewsPageData(headers);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(38,185,200,0.12),_transparent_22%),linear-gradient(180deg,#fbfaf8_0%,#f3ece7_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1400px]">

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#171717] sm:text-5xl">
              Interview Overview
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-[#635b55]">
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
              <p className="text-sm font-medium text-[#7e756f]">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold text-[#26b9c8]">{stat.value}</p>
            </div>
          ))}
        </div>

        <ShortlistedCandidates candidates={shortlisted} />

        <InterviewTable interviews={interviews} />
      </div>
    </main>
  );
}
