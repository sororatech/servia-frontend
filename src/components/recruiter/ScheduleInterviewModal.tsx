"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AUTH_STORAGE } from "@/lib/auth";

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
type Paginated<T> = { results: T[]; next: string | null };

function getApiUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

function toLocalDateTimeValue(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

async function fetchAll<T>(url: string, token: string): Promise<T[]> {
  const items: T[] = [];
  let next: string | null = url;

  while (next) {
    const res = await fetch(next, {
      headers: { Authorization: `Token ${token}` },
    });
    const data = (await res.json()) as T[] | Paginated<T>;
    if (Array.isArray(data)) {
      items.push(...data);
      break;
    }
    items.push(...data.results);
    next = data.next;
  }

  return items;
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

    const token = AUTH_STORAGE.getToken();
    if (!token) return;

    setCandidateId(defaultCandidateId);
    setJobId(defaultJobId);
    setError(null);
    setIsLoading(true);

    Promise.all([
      fetchAll<BackendCandidate>(getApiUrl("/candidates/candidates/"), token),
      fetchAll<BackendJob>(getApiUrl("/jobs/jobs/"), token),
    ])
      .then(([rawCandidates, rawJobs]) => {
        setCandidates(
          rawCandidates.map((c) => ({
            id: c.id,
            name: `${c.user.first_name} ${c.user.last_name}`.trim() || c.user.email,
            jobId: c.job,
          })),
        );
        setJobs(rawJobs.map((j) => ({ id: j.id, title: j.title })));
      })
      .catch(() => setError("Failed to load candidates and jobs."))
      .finally(() => setIsLoading(false));
  }, [isOpen, defaultCandidateId, defaultJobId]);

  useEffect(() => {
    if (!candidateId) return;
    const candidate = candidates.find((c) => c.id === candidateId);
    if (candidate?.jobId) setJobId(candidate.jobId);
  }, [candidateId, candidates]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const token = AUTH_STORAGE.getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    if (!candidateId || !jobId) {
      setError("Please select a candidate and job.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(getApiUrl("/interviews/interviews/"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
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
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-[#171717]">Schedule Interview</h2>

        {isLoading ? (
          <div className="mt-8 py-6 text-center text-sm text-gray-400">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#171717]">
                Candidate Name
              </label>
              <select
                value={candidateId}
                onChange={(e) => setCandidateId(e.target.value)}
                required
                className="w-full rounded-full border border-gray-200 bg-white px-5 py-3 text-sm text-[#374151] outline-none focus:border-[#26b9c8]"
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
              <label className="mb-1 block text-sm font-semibold text-[#171717]">
                Candidate Job
              </label>
              <select
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                required
                className="w-full rounded-full border border-gray-200 bg-white px-5 py-3 text-sm text-[#374151] outline-none focus:border-[#26b9c8]"
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
              <label className="mb-1 block text-sm font-semibold text-[#171717]">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
                className="w-full rounded-full border border-gray-200 bg-white px-5 py-3 text-sm text-[#374151] outline-none focus:border-[#26b9c8]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-[#171717]">
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
                className="w-full rounded-full border border-gray-200 bg-white px-5 py-3 text-sm text-[#374151] outline-none focus:border-[#26b9c8]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-[#171717]">
                Meeting Link
              </label>
              <input
                type="text"
                disabled
                placeholder="Auto-generated after scheduling"
                className="w-full rounded-full border border-gray-100 bg-gray-50 px-5 py-3 text-sm text-gray-400 outline-none cursor-not-allowed"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border border-gray-200 py-3 text-sm font-semibold text-[#374151] transition hover:border-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-full bg-[#26b9c8] py-3 text-sm font-semibold text-white transition hover:bg-[#1fa8b6] disabled:opacity-60"
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
