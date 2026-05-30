"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CandidateOption = {
  id: string;
  name: string;
  jobId: string;
};

type JobOption = {
  id: string;
  title: string;
};

type BackendCandidate = {
  id: string;
  job: string;
  user: { first_name: string; last_name: string; email: string };
};

type BackendJob = { id: string; title: string };

function toLocalDateTimeValue(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

async function fetchFromRoute<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  defaultCandidateId?: string;
  defaultJobId?: string;
};

export default function ScheduleInterviewModal({
  isOpen,
  onClose,
  defaultCandidateId = "",
  defaultJobId = "",
}: Props) {
  const router = useRouter();
  const [candidates, setCandidates] = useState<CandidateOption[]>([]);
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [candidateId, setCandidateId] = useState(defaultCandidateId);
  const [jobId, setJobId] = useState(defaultJobId);
  const [scheduledTime, setScheduledTime] = useState(
    toLocalDateTimeValue(new Date(Date.now() + 24 * 60 * 60 * 1000)),
  );
  const [duration, setDuration] = useState("30");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setCandidateId(defaultCandidateId);
    setJobId(defaultJobId);
    setError(null);
    setIsLoading(true);

    Promise.all([
      fetchFromRoute<BackendCandidate[]>("/api/recruiter/candidates"),
      fetchFromRoute<BackendJob[]>("/api/recruiter/jobs"),
    ])
      .then(([rawCandidates, rawJobs]) => {
        setCandidates(
          rawCandidates.map((c: BackendCandidate) => ({
            id: c.id,
            name: `${c.user.first_name} ${c.user.last_name}`.trim() || c.user.email,
            jobId: c.job,
          })),
        );
        setJobs(rawJobs.map((j: BackendJob) => ({ id: j.id, title: j.title })));
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load candidates and jobs.");
      })
      .finally(() => setIsLoading(false));
  }, [isOpen, defaultCandidateId, defaultJobId]);

  useEffect(() => {
    if (!candidateId) return;
    const candidate = candidates.find((c) => c.id === candidateId);
    if (candidate?.jobId) setJobId(candidate.jobId);
  }, [candidateId, candidates]);

  async function handleSubmit() {
    setError(null);

    if (!candidateId || !jobId) {
      setError("Please select a candidate and job.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/recruiter/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate: candidateId,
          job: jobId,
          scheduled_time: new Date(scheduledTime).toISOString(),
          duration_minutes: Number(duration),
          status: "scheduled",
        }),
      });

      const payload = (await res.json()) as { id?: string; detail?: string };

      if (!res.ok || !payload.id) {
        throw new Error(payload.detail ?? "Unable to schedule interview.");
      }

      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to schedule interview.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-3xl bg-[var(--color-warm-surface)] p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-[var(--color-foreground)]">Schedule Interview</h2>

        {isLoading ? (
          <div className="mt-8 py-6 text-center text-sm text-[var(--color-text-subtle)]">Loading...</div>
        ) : error === "session_expired" ? (
          <div className="mt-8 flex flex-col items-center gap-4 py-6 text-center">
            <p className="text-sm text-[var(--color-status-error-text)]">
              Your session has expired. Please log in again to continue.
            </p>
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="rounded-full bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--color-foreground)]">
                Candidate Name
              </label>
              <select
                value={candidateId}
                onChange={(e) => setCandidateId(e.target.value)}
                required
                className="w-full rounded-full border border-[var(--color-warm-border)] bg-[var(--color-input-bg-light)] px-5 py-3 text-sm text-[var(--color-text-darkest)] outline-none focus:border-[var(--color-primary)]"
              >
                <option value="">Select candidate</option>
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--color-foreground)]">
                Candidate Job
              </label>
              <select
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                required
                className="w-full rounded-full border border-[var(--color-warm-border)] bg-[var(--color-input-bg-light)] px-5 py-3 text-sm text-[var(--color-text-darkest)] outline-none focus:border-[var(--color-primary)]"
              >
                <option value="">Select job</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--color-foreground)]">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
                className="w-full rounded-full border border-[var(--color-warm-border)] bg-[var(--color-input-bg-light)] px-5 py-3 text-sm text-[var(--color-text-darkest)] outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--color-foreground)]">
                Duration
              </label>
              <input
                type="number"
                min="15"
                step="15"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Duration (minutes)"
                required
                className="w-full rounded-full border border-[var(--color-warm-border)] bg-[var(--color-input-bg-light)] px-5 py-3 text-sm text-[var(--color-text-darkest)] placeholder:text-[var(--color-text-subtle)] outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--color-foreground)]">
                Meeting Link
              </label>
              <input
                type="text"
                disabled
                placeholder="Auto-generated after scheduling"
                className="w-full rounded-full border border-[var(--color-warm-border-faint)] bg-[var(--color-warm-bg)] px-5 py-3 text-sm text-[var(--color-text-subtle)] placeholder:text-[var(--color-text-subtle)] outline-none cursor-not-allowed opacity-60"
              />
            </div>

            {error && (
              <p className="text-sm text-[var(--color-status-error-text)]">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border border-[var(--color-warm-border)] py-3 text-sm font-semibold text-[var(--color-text-dark)] transition hover:border-[var(--color-warm-border-deep)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-full bg-[var(--color-primary)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
              >
                {isSubmitting ? "Scheduling..." : "Done"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
