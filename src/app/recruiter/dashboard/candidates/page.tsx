import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CandidateTable from "@/components/recruiter/CandidateTable";
import type {
  BackendCandidate,
  BackendJobSummary,
  CandidateListItem,
} from "@/types/candidate";
import type { ApiResponse } from "@/types/api";

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

function getApiUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

async function getRecruiterRequestHeaders() {
  const cookieStore = await cookies();
  const userType = cookieStore.get("user_role")?.value;
  const authToken = cookieStore.get("auth_token")?.value;

  if (userType !== "recruiter" || !authToken) {
    return null;
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Token ${authToken}`,
  };
}

async function fetchJson<T>(path: string, headers: HeadersInit): Promise<T> {
  const response = await fetch(getApiUrl(path), {
    headers,
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("Recruiter session expired. Please sign in again.");
  }

  if (!response.ok) {
    throw new Error(`Request failed for ${path} with status ${response.status}`);
  }

  return (await response.json()) as T;
}

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

async function fetchAllPages<T>(path: string, headers: HeadersInit): Promise<T[]> {
  const firstPage = unwrapCollection(
    await fetchJson<ApiResponse<T[]> | PaginatedResponse<T> | T[]>(path, headers),
  );
  const items = [...firstPage.items];
  let nextUrl = firstPage.next;

  while (nextUrl) {
    const response = await fetch(nextUrl, {
      headers,
      cache: "no-store",
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error("Recruiter session expired. Please sign in again.");
    }

    if (!response.ok) {
      throw new Error(`Request failed for ${nextUrl} with status ${response.status}`);
    }

    const page = unwrapCollection((await response.json()) as PaginatedResponse<T>);
    items.push(...page.items);
    nextUrl = page.next;
  }

  return items;
}

function formatCandidateName(candidate: BackendCandidate) {
  const fullName =
    `${candidate.user.first_name} ${candidate.user.last_name}`.trim();
  return fullName || candidate.user.email || "Unnamed Candidate";
}

async function loadInitialCandidates(headers: HeadersInit): Promise<CandidateListItem[]> {
  const [candidates, jobs] = await Promise.all([
    fetchAllPages<BackendCandidate>("/candidates/candidates/", headers),
    fetchAllPages<BackendJobSummary>("/jobs/jobs/", headers),
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
    };
  });
}

export default async function RecruiterCandidatesPage() {
  const headers = await getRecruiterRequestHeaders();

  if (!headers) {
    redirect("/login");
  }

  let initialCandidates: CandidateListItem[] = [];
  let loadError: string | null = null;

  try {
    initialCandidates = await loadInitialCandidates(headers);
  } catch (error) {
    initialCandidates = [];
    loadError =
      error instanceof Error ? error.message : "Unable to load candidates right now.";
  }

  return <CandidateTable initialCandidates={initialCandidates} error={loadError} />;
}
