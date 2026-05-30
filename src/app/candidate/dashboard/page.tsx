"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { slugifyInterviewLabel } from "@/lib/interviewRoutes";
import type { ApiResponse, BackendInterview } from "@/types/api";

type InterviewsResponse =
  | ApiResponse<BackendInterview[]>
  | {
      count: number;
      next: string | null;
      previous: string | null;
      results: BackendInterview[];
    }
  | BackendInterview[];

const INTERVIEW_PRIORITY: Record<string, number> = {
  in_progress: 0,
  confirmed: 1,
  scheduled: 2,
};

function unwrapInterviews(payload: InterviewsResponse): BackendInterview[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if ("data" in payload && Array.isArray(payload.data)) {
    return payload.data;
  }

  if ("results" in payload && Array.isArray(payload.results)) {
    return payload.results;
  }

  return [];
}

function compareInterviews(left: BackendInterview, right: BackendInterview) {
  const priorityDifference =
    (INTERVIEW_PRIORITY[left.status] ?? Number.MAX_SAFE_INTEGER) -
    (INTERVIEW_PRIORITY[right.status] ?? Number.MAX_SAFE_INTEGER);

  if (priorityDifference !== 0) {
    return priorityDifference;
  }

  const leftTime = left.scheduled_time
    ? new Date(left.scheduled_time).getTime()
    : Number.MAX_SAFE_INTEGER;
  const rightTime = right.scheduled_time
    ? new Date(right.scheduled_time).getTime()
    : Number.MAX_SAFE_INTEGER;

  if (leftTime !== rightTime) {
    return leftTime - rightTime;
  }

  return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
}

export default function CandidateDashboard() {
  const router = useRouter();
  const [isResolvingInterview, setIsResolvingInterview] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function resolveInterviewRedirect() {
      try {
        const response = await api.get<InterviewsResponse>("/interviews/interviews/");
        const interviews = unwrapInterviews(response.data);
        const activeInterview = interviews
          .filter((interview) => interview.status in INTERVIEW_PRIORITY)
          .sort(compareInterviews)[0];

        if (activeInterview) {
          router.replace(
            `/candidate/interviews/live/${slugifyInterviewLabel("my interview")}?interviewId=${activeInterview.id}`,
          );
          return;
        }
      } catch {
        if (isMounted) {
          setError("We could not check your interview status right now.");
        }
      } finally {
        if (isMounted) {
          setIsResolvingInterview(false);
        }
      }
    }

    void resolveInterviewRedirect();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <main className="p-4 md:p-8">
      <h1 className="mb-4 text-2xl font-heading font-bold text-[var(--color-secondary)]">
        Candidate Dashboard
      </h1>
      <p className="text-[var(--color-foreground)]/70">
        {isResolvingInterview
          ? "Checking whether you have a live or scheduled interview..."
          : "Your applications, AI feedback, and interview status will appear here."}
      </p>
      {error ? (
        <p className="mt-4 text-sm text-[var(--color-status-error-text)]">
          {error}
        </p>
      ) : null}
    </main>
  );
}
