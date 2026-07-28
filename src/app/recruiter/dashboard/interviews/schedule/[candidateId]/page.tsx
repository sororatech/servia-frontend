import Link from 'next/link';
import { getScheduleInterviewPageData } from '@/hooks/useScheduleInterviewPage';
import {
  MEETING_LINK_HELP,
  MEETING_LINK_INPUT_PATTERN,
  MEETING_LINK_PLACEHOLDER,
} from '@/lib/meetLink';
import type { ScheduleInterviewPageProps } from '@/types/interview';

export default async function ScheduleInterviewPage({ params, searchParams }: ScheduleInterviewPageProps) {
  const { candidateName, candidateEmail, candidateRole, error, action } =
    await getScheduleInterviewPageData(params, searchParams);

  return (
    <main className="min-h-screen bg-[var(--color-warm-bg-deep)] px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-[var(--color-warm-border)] bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-text-faint)]">
              Schedule Interview
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-[var(--color-foreground)]">{candidateName}</h1>
            <p className="mt-2 text-[var(--color-text-muted)]">{candidateRole}</p>
            <p className="text-sm text-[var(--color-text-subtle)]">{candidateEmail}</p>
          </div>
          <Link
            href="/recruiter/dashboard/interviews"
            className="rounded-full border border-[var(--color-warm-border-deep)] px-4 py-2 text-sm font-semibold text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-teal-dark)]"
          >
            Back
          </Link>
        </div>

        <form action={action} className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--color-text-body)]">
              Interview Date &amp; Time
            </span>
            <input
              type="datetime-local"
              name="scheduled_time"
              className="w-full rounded-[1rem] border border-[var(--color-warm-border-faint)] bg-[var(--color-input-bg-light)] px-4 py-3 text-sm text-[var(--color-text-darkest)] outline-none transition focus:border-[var(--color-primary)]"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--color-text-body)]">Duration</span>
            <select
              name="duration_minutes"
              defaultValue="30"
              className="w-full rounded-[1rem] border border-[var(--color-warm-border-faint)] bg-[var(--color-input-bg-light)] px-4 py-3 text-sm text-[var(--color-text-darkest)] outline-none transition focus:border-[var(--color-primary)]"
            >
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--color-text-body)]">Stage</span>
            <select
              name="stage"
              defaultValue="stage_1"
              className="w-full rounded-[1rem] border border-[var(--color-warm-border-faint)] bg-[var(--color-input-bg-light)] px-4 py-3 text-sm text-[var(--color-text-darkest)] outline-none transition focus:border-[var(--color-primary)]"
            >
              <option value="stage_1">Stage 1</option>
              <option value="stage_2">Stage 2</option>
              <option value="stage_3">Stage 3</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--color-text-body)]">
              Meeting Link
            </span>
            <input
              type="url"
              name="meet_link"
              placeholder={MEETING_LINK_PLACEHOLDER}
              pattern={MEETING_LINK_INPUT_PATTERN}
              title={MEETING_LINK_HELP}
              className="w-full rounded-[1rem] border border-[var(--color-warm-border-faint)] bg-[var(--color-input-bg-light)] px-4 py-3 text-sm text-[var(--color-text-darkest)] outline-none transition focus:border-[var(--color-primary)]"
              required
            />
            <span className="mt-2 block text-xs text-[var(--color-text-subtle)]">
              {MEETING_LINK_HELP} The AI bot will automatically join this meeting.
            </span>
          </label>

          {error && (
            <div className="rounded-[1rem] border border-[var(--color-status-error-border)] bg-[var(--color-status-error-bg)] px-4 py-3 text-sm text-[var(--color-status-error-text)]">
              {decodeURIComponent(error)}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
          >
            Schedule Interview
          </button>
        </form>
      </div>
    </main>
  );
}
