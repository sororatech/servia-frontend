"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/ui";
import { AlertCircle } from "lucide-react";
import {
  isValidMeetingLink,
  MEETING_LINK_HELP,
  MEETING_LINK_INPUT_PATTERN,
  MEETING_LINK_PLACEHOLDER,
} from "@/lib/meetLink";

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
  job: string | { id: string; title: string; department?: string };
  user: { first_name: string; last_name: string; email: string };
};

type BackendJob = { id: string; title: string };

type Paginated<T> = { results: T[] };

type ExistingInterview = {
  interview_id: string;
  candidate_id: string;
  status: string;
  scheduled_time: string;
  meet_link: string;
};

function toList<T>(payload: T[] | Paginated<T>): T[] {
  if (Array.isArray(payload)) return payload;
  return payload?.results ?? [];
}

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
  const [meetLink, setMeetLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [existingInterview, setExistingInterview] = useState<ExistingInterview | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setCandidateId(defaultCandidateId);
    setJobId(defaultJobId);
    setMeetLink("");
    setError(null);
    setIsLoading(true);
    setExistingInterview(null);
    setIsUpdating(false);

    Promise.all([
      fetchFromRoute<BackendCandidate[] | Paginated<BackendCandidate>>("/api/recruiter/candidates"),
      fetchFromRoute<BackendJob[] | Paginated<BackendJob>>("/api/recruiter/jobs"),
    ])
      .then(([rawCandidates, rawJobs]) => {
        setCandidates(
          toList(rawCandidates).map((c) => {
            const jobData = typeof c.job === 'object' && c.job !== null ? c.job : null;
            const jobId = jobData?.id || (typeof c.job === 'string' ? c.job : '');
            
            return {
              id: c.id,
              name: `${c.user.first_name} ${c.user.last_name}`.trim() || c.user.email,
              jobId: String(jobId),
            };
          }),
        );
        setJobs(toList(rawJobs).map((j) => ({ id: String(j.id), title: j.title })));
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load candidates and jobs.");
      })
      .finally(() => setIsLoading(false));
  }, [isOpen, defaultCandidateId, defaultJobId]);

  useEffect(() => {
    if (!candidateId || !isOpen) return;
    
    const checkExistingInterview = async () => {
      try {
        const res = await fetch(`/api/recruiter/interviews?candidate_id=${candidateId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.hasActiveInterview && data.interview) {
            setExistingInterview(data.interview);
            // Pre-fill the form with existing interview data
            if (data.interview.scheduled_time) {
              setScheduledTime(toLocalDateTimeValue(new Date(data.interview.scheduled_time)));
            }
            // Pre-fill meet link if it exists
            if (data.interview.meet_link) {
              setMeetLink(data.interview.meet_link);
            }
          } else {
            setExistingInterview(null);
          }
        }
      } catch (err) {
        console.error('Failed to check existing interview:', err);
      }
    };
    
    checkExistingInterview();
  }, [candidateId, isOpen]);

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

    const trimmedMeetLink = meetLink.trim();
    if (!isValidMeetingLink(trimmedMeetLink)) {
      setError(MEETING_LINK_HELP);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        candidate: candidateId,
        job: jobId,
        scheduled_time: new Date(scheduledTime).toISOString(),
        duration_minutes: Number(duration),
        meet_link: trimmedMeetLink,
        status: "scheduled",
      };

      let res: Response;
      
      // 👇 Use PUT if updating, POST if creating
      if (existingInterview) {
        res = await fetch(`/api/recruiter/interviews?id=${existingInterview.interview_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/recruiter/interviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const responseData = (await res.json()) as { 
        id?: string; 
        detail?: string; 
        candidate?: string | string[];
        [key: string]: any;
      };

      if (!res.ok || !responseData.id) {
        let errorMessage = "Unable to schedule interview.";
        
        if (responseData.detail) {
          errorMessage = typeof responseData.detail === 'string' 
            ? responseData.detail 
            : JSON.stringify(responseData.detail);
        } else if (responseData.candidate) {
          errorMessage = Array.isArray(responseData.candidate) 
            ? responseData.candidate.join(', ') 
            : String(responseData.candidate);
        } else if (responseData.non_field_errors) {
          errorMessage = Array.isArray(responseData.non_field_errors)
            ? responseData.non_field_errors.join(', ')
            : String(responseData.non_field_errors);
        }
        
        throw new Error(errorMessage);
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
        <h2 className="text-xl font-bold text-[var(--color-foreground)]">
          {existingInterview ? "Reschedule Interview" : "Schedule Interview"}
        </h2>

        {isLoading ? (
          <div className="mt-8 py-6">
            <LoadingSkeleton variant="card" />
          </div>
        ) : error === "session_expired" ? (
          <div className="mt-8 flex flex-col items-center gap-4 py-6 text-center">
            <p className="text-sm text-[var(--color-status-error-text)]">
              Your session has expired. Please log in again to continue.
            </p>
            <Button variant="primary" onClick={() => router.push("/login")}>
              Go to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="mt-6 space-y-4">
            {existingInterview && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4">
                <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                <div className="flex-1 text-sm">
                  <p className="font-semibold text-amber-900">
                    This candidate already has a scheduled interview
                  </p>
                  <p className="mt-1 text-amber-700">
                    Submitting will update the existing interview scheduled for{" "}
                    {new Date(existingInterview.scheduled_time).toLocaleString()}.
                  </p>
                </div>
              </div>
            )}

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
                Job (will auto-select based on candidate)
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
                Duration (minutes)
              </label>
              <input
                type="number"
                min="15"
                step="15"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
                className="w-full rounded-full border border-[var(--color-warm-border)] bg-[var(--color-input-bg-light)] px-5 py-3 text-sm text-[var(--color-text-darkest)] outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--color-foreground)]">
                Meeting Link
              </label>
              <input
                type="url"
                value={meetLink ?? ""}
                onChange={(e) => setMeetLink(e.target.value)}
                required
                placeholder={MEETING_LINK_PLACEHOLDER}
                pattern={MEETING_LINK_INPUT_PATTERN}
                title={MEETING_LINK_HELP}
                className="w-full rounded-full border border-[var(--color-warm-border)] bg-[var(--color-input-bg-light)] px-5 py-3 text-sm text-[var(--color-text-darkest)] placeholder:text-[var(--color-text-subtle)] outline-none focus:border-[var(--color-primary)]"
              />
              <p className="mt-1 text-xs text-[var(--color-text-subtle)]">
                {MEETING_LINK_HELP} The AI bot will join it automatically.
              </p>
            </div>

            {error && (
              <p className="text-sm text-[var(--color-status-error-text)]">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting 
                  ? (existingInterview ? "Updating..." : "Scheduling...") 
                  : (existingInterview ? "Update Interview" : "Schedule Interview")
                }
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}