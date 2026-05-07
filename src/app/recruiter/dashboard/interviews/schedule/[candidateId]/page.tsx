import Link from 'next/link';
import { getScheduleInterviewPageData } from '@/hooks/useScheduleInterviewPage';
import type { ScheduleInterviewPageProps } from '@/types/interview';

export default async function ScheduleInterviewPage({ params, searchParams }: ScheduleInterviewPageProps) {
  const { candidateName, candidateEmail, candidateRole, error, action } =
    await getScheduleInterviewPageData(params, searchParams);

  return (
    <main className="min-h-screen bg-[#f8f5f2] px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#eaded8] bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a817b]">
              Schedule Interview
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-[#171717]">{candidateName}</h1>
            <p className="mt-2 text-[#5e5752]">{candidateRole}</p>
            <p className="text-sm text-[#7a726c]">{candidateEmail}</p>
          </div>
          <Link
            href="/recruiter/dashboard/interviews"
            className="rounded-full border border-[#d9cfc8] px-4 py-2 text-sm font-semibold text-[#5e5752] transition hover:border-[#26b9c8] hover:text-[#0c6c75]"
          >
            Back
          </Link>
        </div>

        <form action={action} className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#4f4a45]">
              Interview Date &amp; Time
            </span>
            <input
              type="datetime-local"
              name="scheduled_time"
              className="w-full rounded-[1rem] border border-[#ddd5cf] bg-[#fcfbfa] px-4 py-3 text-sm text-[#1f1c19] outline-none transition focus:border-[#26b9c8]"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#4f4a45]">Duration</span>
            <select
              name="duration_minutes"
              defaultValue="30"
              className="w-full rounded-[1rem] border border-[#ddd5cf] bg-[#fcfbfa] px-4 py-3 text-sm text-[#1f1c19] outline-none transition focus:border-[#26b9c8]"
            >
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#4f4a45]">Stage</span>
            <select
              name="stage"
              defaultValue="stage_1"
              className="w-full rounded-[1rem] border border-[#ddd5cf] bg-[#fcfbfa] px-4 py-3 text-sm text-[#1f1c19] outline-none transition focus:border-[#26b9c8]"
            >
              <option value="stage_1">Stage 1</option>
              <option value="stage_2">Stage 2</option>
              <option value="stage_3">Stage 3</option>
            </select>
          </label>

          {error && (
            <div className="rounded-[1rem] border border-[#efc7bf] bg-[#fff0ec] px-4 py-3 text-sm text-[#b13d2f]">
              {decodeURIComponent(error)}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-[#26b9c8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1598a6]"
          >
            Schedule Interview
          </button>
        </form>
      </div>
    </main>
  );
}
