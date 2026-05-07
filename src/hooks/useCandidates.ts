"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { api } from "@/lib/api";
import { AUTH_STORAGE } from "@/lib/auth";
import type { ApiResponse } from "@/types/api";
import type {
  BackendCandidate,
  BackendJobSummary,
  CandidateListItem,
} from "@/types/candidate";

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

type UseCandidatesResult = {
  candidates: CandidateListItem[];
  roles: string[];
  statuses: string[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => void;
};

function unwrapCollection<T>(
  payload: ApiResponse<T[]> | PaginatedResponse<T> | T[],
): { items: T[]; next: string | null } {
  if (Array.isArray(payload)) {
    return { items: payload, next: null };
  }

  if ("data" in payload && Array.isArray(payload.data)) {
    return { items: payload.data, next: null };
  }

  if ("results" in payload && Array.isArray(payload.results)) {
    return { items: payload.results, next: payload.next };
  }

  return { items: [], next: null };
}

function formatCandidateName(candidate: BackendCandidate) {
  const fullName =
    `${candidate.user.first_name} ${candidate.user.last_name}`.trim();
  return fullName || candidate.user.email || "Unnamed Candidate";
}

async function fetchAllPages<T>(path: string): Promise<T[]> {
  const firstResponse = await api.get<ApiResponse<T[]> | PaginatedResponse<T> | T[]>(
    path,
  );
  const firstPage = unwrapCollection(firstResponse.data);
  const items = [...firstPage.items];
  let nextUrl = firstPage.next;

  while (nextUrl) {
    const token = AUTH_STORAGE.getToken();
    const response = await fetch(nextUrl, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Token ${token}` } : {}),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Request failed for ${nextUrl} with status ${response.status}`);
    }

    const page = unwrapCollection((await response.json()) as PaginatedResponse<T>);
    items.push(...page.items);
    nextUrl = page.next;
  }

  return items;
}

async function loadCandidates(): Promise<CandidateListItem[]> {
  const [candidates, jobs] = await Promise.all([
    fetchAllPages<BackendCandidate>("/candidates/candidates/"),
    fetchAllPages<BackendJobSummary>("/jobs/jobs/"),
  ]);

  const jobsById = new Map(jobs.map((job) => [job.id, job]));

  return candidates.map((candidate) => {
    const job = jobsById.get(candidate.job);
    return {
      id: candidate.id,
      name: formatCandidateName(candidate),
      email: candidate.user.email,
      role: job?.title || "Unknown Role",
      department: job?.department || "General",
      aiScore: candidate.ai_score,
      status: candidate.status,
      appliedAt: candidate.applied_at,
      jobId: candidate.job,
    };
  });
}

export default function useCandidates(): UseCandidatesResult {
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      try {
        const nextCandidates = await loadCandidates();
        if (!cancelled) {
          setCandidates(nextCandidates);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load candidates right now.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const roles = useMemo(
    () => Array.from(new Set(candidates.map((candidate) => candidate.role))).sort(),
    [candidates],
  );
  const statuses = useMemo(
    () => Array.from(new Set(candidates.map((candidate) => candidate.status))).sort(),
    [candidates],
  );

  return {
    candidates,
    roles,
    statuses,
    isLoading,
    isRefreshing,
    error,
    refresh: () => {
      startTransition(() => {
        setRefreshKey((current) => current + 1);
      });
    },
  };
}
