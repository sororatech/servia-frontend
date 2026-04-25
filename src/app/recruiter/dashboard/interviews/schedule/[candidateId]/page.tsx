'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { AUTH_STORAGE } from '@/lib/auth';

type ScheduleInterviewPageProps = {
  params: Promise<{ candidateId: string }>;
};

function getApiUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

function toLocalDateTimeValue(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

export default function ScheduleInterviewPage({
  params,
}: ScheduleInterviewPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [candidateId, setCandidateId] = useState('');
  const [scheduledTime, setScheduledTime] = useState(
    toLocalDateTimeValue(new Date(Date.now() + 24 * 60 * 60 * 1000)),
  );
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [stage, setStage] = useState('stage_1');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    params.then((value) => setCandidateId(value.candidateId));
  }, [params]);

  const candidateName = searchParams.get('candidateName') ?? 'Candidate';
  const candidateEmail = searchParams.get('candidateEmail') ?? '';
  const candidateRole = searchParams.get('candidateRole') ?? 'Open Role';
  const jobId = searchParams.get('jobId') ?? '';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const token = AUTH_STORAGE.getToken();
    const userType = AUTH_STORAGE.getUserType();

    if (!token || userType !== 'recruiter') {
      router.push('/login');
      return;
    }

    if (!candidateId || !jobId) {
      setError('Missing candidate or job details for scheduling.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(getApiUrl('/interviews/interviews/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          candidate: candidateId,
          job: jobId,
          scheduled_time: new Date(scheduledTime).toISOString(),
          duration_minutes: Number(durationMinutes),
          stage,
          status: 'scheduled',
        }),
      });

      const payload = (await response.json()) as { id?: string; detail?: string };

      if (!response.ok || !payload.id) {
        throw new Error(payload.detail ?? 'Unable to schedule interview right now.');
      }

      router.push('/recruiter/dashboard/interviews');
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to schedule interview right now.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f5f2] px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#eaded8] bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a817b]">
              Schedule Interview
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-[#171717]">
              {candidateName}
            </h1>
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

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#4f4a45]">
              Interview Date & Time
            </span>
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(event) => setScheduledTime(event.target.value)}
              className="w-full rounded-[1rem] border border-[#ddd5cf] bg-[#fcfbfa] px-4 py-3 text-sm text-[#1f1c19] outline-none transition focus:border-[#26b9c8]"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#4f4a45]">
              Duration
            </span>
            <select
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(event.target.value)}
              className="w-full rounded-[1rem] border border-[#ddd5cf] bg-[#fcfbfa] px-4 py-3 text-sm text-[#1f1c19] outline-none transition focus:border-[#26b9c8]"
            >
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#4f4a45]">
              Stage
            </span>
            <select
              value={stage}
              onChange={(event) => setStage(event.target.value)}
              className="w-full rounded-[1rem] border border-[#ddd5cf] bg-[#fcfbfa] px-4 py-3 text-sm text-[#1f1c19] outline-none transition focus:border-[#26b9c8]"
            >
              <option value="stage_1">Stage 1</option>
              <option value="stage_2">Stage 2</option>
              <option value="stage_3">Stage 3</option>
            </select>
          </label>

          {error ? (
            <div className="rounded-[1rem] border border-[#efc7bf] bg-[#fff0ec] px-4 py-3 text-sm text-[#b13d2f]">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-[#26b9c8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1598a6] disabled:cursor-not-allowed disabled:bg-[#8fd7de]"
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule Interview'}
          </button>
        </form>
      </div>
    </main>
  );
}
