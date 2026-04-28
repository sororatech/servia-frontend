import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { slugifyInterviewLabel } from "@/lib/interviewRoutes";

type CandidateRecord = {
  id: string;
  job: string;
  status: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
};

type JobRecord = {
  id: string;
  title: string;
};

type ActiveInterviewRecord = {
  candidateId: string;
  interviewId: string | null;
  status: string;
};

type InterviewRecord = {
  id: string;
  candidate: string;
  status: string;
  created_at?: string;
  updated_at?: string;
};

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

type InterviewPageData = {
  activeInterviews: Array<{
    candidateId: string;
    candidateName: string;
    candidateEmail: string;
    role: string;
    status: string;
    interviewId: string;
  }>;
  needsScheduling: Array<{
    candidateId: string;
    candidateName: string;
    candidateEmail: string;
    role: string;
    status: string;
    jobId: string;
  }>;
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

function isActiveInterviewStatus(status: string) {
  return ![
    "completed",
    "cancelled",
    "canceled",
    "ended",
    "analysis_failed",
  ].includes(status);
}

function getInterviewTimestamp(interview: InterviewRecord) {
  return Date.parse(interview.updated_at ?? interview.created_at ?? "");
}

async function fetchAllPages<T>(path: string, headers: HeadersInit): Promise<T[]> {
  const firstPage = await fetchJson<T[] | PaginatedResponse<T>>(path, headers);

  if (Array.isArray(firstPage)) {
    return firstPage;
  }

  const items = [...firstPage.results];
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

    const page = (await response.json()) as PaginatedResponse<T>;
    items.push(...page.results);
    nextUrl = page.next;
  }

  return items;
}

function formatCandidateName(candidate: CandidateRecord) {
  const fullName = `${candidate.user.first_name} ${candidate.user.last_name}`.trim();
  return fullName || candidate.user.email || "Unnamed Candidate";
}

function formatStatusLabel(status: string) {
  return status
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

async function getInterviewCards(headers: HeadersInit) {
  const [candidates, jobs, interviews] = await Promise.all([
    fetchAllPages<CandidateRecord>("/candidates/candidates/", headers),
    fetchAllPages<JobRecord>("/jobs/jobs/", headers),
    fetchAllPages<InterviewRecord>("/interviews/interviews/", headers),
  ]);

  const jobTitleById = new Map(jobs.map((job) => [job.id, job.title]));
  const activeInterviewByCandidateId = new Map<string, ActiveInterviewRecord>();
  const sortedInterviews = [...interviews].sort(
    (left, right) => getInterviewTimestamp(right) - getInterviewTimestamp(left),
  );

  for (const interview of sortedInterviews) {
    if (!isActiveInterviewStatus(interview.status)) {
      continue;
    }

    if (activeInterviewByCandidateId.has(interview.candidate)) {
      continue;
    }

    activeInterviewByCandidateId.set(interview.candidate, {
      candidateId: interview.candidate,
      interviewId: interview.id,
      status: interview.status,
    });
  }

  const mappedCandidates = candidates.map((candidate) => {
    const activeInterview = activeInterviewByCandidateId.get(candidate.id);

    return {
      candidateId: candidate.id,
      candidateName: formatCandidateName(candidate),
      candidateEmail: candidate.user.email || "",
      role: jobTitleById.get(candidate.job) ?? "Open Role",
      jobId: candidate.job,
      candidateStatus: candidate.status,
      activeInterviewStatus: activeInterview?.status ?? null,
      interviewId: activeInterview?.interviewId ?? null,
    };
  });

  return {
    activeInterviews: mappedCandidates
      .filter(
        (candidate): candidate is typeof candidate & { interviewId: string; activeInterviewStatus: string } =>
          candidate.interviewId !== null && candidate.activeInterviewStatus !== null,
      )
      .map((candidate) => ({
        candidateId: candidate.candidateId,
        candidateName: candidate.candidateName,
        candidateEmail: candidate.candidateEmail,
        role: candidate.role,
        status: formatStatusLabel(candidate.activeInterviewStatus),
        interviewId: candidate.interviewId,
      })),
    needsScheduling: mappedCandidates
      .filter(
        (candidate) =>
          candidate.candidateStatus === "shortlisted" && candidate.interviewId === null,
      )
      .map((candidate) => ({
        candidateId: candidate.candidateId,
        candidateName: candidate.candidateName,
        candidateEmail: candidate.candidateEmail,
        role: candidate.role,
        status: formatStatusLabel(candidate.candidateStatus),
        jobId: candidate.jobId,
      })),
  } satisfies InterviewPageData;
}

export default async function RecruiterInterviewsPage() {
  const headers = await getRecruiterRequestHeaders();

  if (!headers) {
    redirect("/login");
  }

  const { activeInterviews, needsScheduling } = await getInterviewCards(headers);

  return (
    <main className="min-h-screen bg-[#f8f5f2] px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-semibold text-[#171717]">
          Recruiter Interviews
        </h1>
        <p className="mt-2 text-[#5e5752]">
          Open a live interview room from the list below.
        </p>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#171717]">Needs Scheduling</h2>
              <p className="text-sm text-[#5e5752]">
                Shortlisted candidates who are ready for an interview slot.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {needsScheduling.length > 0 ? (
              needsScheduling.map((candidate) => (
                <Link
                  key={candidate.candidateId}
                  href={{
                    pathname: `/recruiter/dashboard/interviews/schedule/${candidate.candidateId}`,
                    query: {
                      candidateName: candidate.candidateName,
                      candidateEmail: candidate.candidateEmail,
                      candidateRole: candidate.role,
                      jobId: candidate.jobId,
                    },
                  }}
                  className="rounded-[1.5rem] border border-[#eaded8] bg-white px-5 py-5 shadow-sm transition hover:border-[#26b9c8] hover:shadow-md"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-[#171717]">
                        {candidate.candidateName}
                      </h3>
                      <p className="text-[#5e5752]">{candidate.role}</p>
                      <p className="mt-1 text-sm text-[#7a726c]">{candidate.candidateEmail}</p>
                    </div>
                    <span className="rounded-full bg-[#ecfff4] px-4 py-2 text-sm font-semibold text-[#0f7b43]">
                      {candidate.status}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-[#d8cbc3] bg-white/80 px-5 py-8 text-center text-[#5e5752]">
                No shortlisted candidates are waiting to be scheduled right now.
              </div>
            )}
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#171717]">Active Interviews</h2>
              <p className="text-sm text-[#5e5752]">
                Candidates with interviews that are scheduled, confirmed, or in progress.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {activeInterviews.length > 0 ? (
              activeInterviews.map((interview) => (
              <Link
                key={interview.candidateId}
                href={{
                  pathname: `/recruiter/dashboard/interviews/live/${slugifyInterviewLabel(interview.candidateName)}`,
                  query: {
                    interviewId: interview.interviewId,
                    candidateName: interview.candidateName,
                    candidateEmail: interview.candidateEmail,
                    candidateRole: interview.role,
                  },
                }}
                className="rounded-[1.5rem] border border-[#eaded8] bg-white px-5 py-5 shadow-sm transition hover:border-[#26b9c8] hover:shadow-md"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-[#171717]">
                      {interview.candidateName}
                    </h2>
                    <p className="text-[#5e5752]">{interview.role}</p>
                  </div>
                  <span className="rounded-full bg-[#e9fbfd] px-4 py-2 text-sm font-semibold text-[#0c6c75]">
                    {interview.status}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-[#d8cbc3] bg-white/80 px-5 py-8 text-center text-[#5e5752]">
              No candidates with active interviews were returned by the backend.
            </div>
          )}
          </div>
        </section>
      </div>
    </main>
  );
}
