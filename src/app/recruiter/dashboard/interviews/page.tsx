import Link from "next/link";

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

function getRequestHeaders() {
  const authToken = process.env.NEXT_PUBLIC_AUTH_TOKEN;

  return {
    "Content-Type": "application/json",
    ...(authToken ? { Authorization: `Token ${authToken}` } : {}),
  };
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(getApiUrl(path), {
    headers: getRequestHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${path} with status ${response.status}`);
  }

  return (await response.json()) as T;
}

function asArray<T>(payload: T[] | PaginatedResponse<T>) {
  return Array.isArray(payload) ? payload : payload.results;
}

async function fetchAllPages<T>(path: string): Promise<T[]> {
  const firstPage = await fetchJson<T[] | PaginatedResponse<T>>(path);

  if (Array.isArray(firstPage)) {
    return firstPage;
  }

  const items = [...firstPage.results];
  let nextUrl = firstPage.next;

  while (nextUrl) {
    const response = await fetch(nextUrl, {
      headers: getRequestHeaders(),
      cache: "no-store",
    });

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

async function getInterviewCards() {
  const [candidates, jobs] = await Promise.all([
    fetchAllPages<CandidateRecord>("/candidates/candidates/"),
    fetchAllPages<JobRecord>("/jobs/jobs/"),
  ]);

  const jobTitleById = new Map(jobs.map((job) => [job.id, job.title]));

  const activeInterviews = await Promise.all(
    candidates.map(async (candidate) => {
      try {
        const response = await fetchJson<{
          candidate_id: string;
          interview_id: string;
          status: string;
        }>(
          `/interviews/interviews/resolve-active/?candidate_id=${candidate.id}`,
        );

        return {
          candidateId: response.candidate_id,
          interviewId: response.interview_id,
          status: response.status,
        } satisfies ActiveInterviewRecord;
      } catch {
        return {
          candidateId: candidate.id,
          interviewId: null,
          status: candidate.status,
        } satisfies ActiveInterviewRecord;
      }
    }),
  );

  const activeInterviewByCandidateId = new Map(
    activeInterviews.map((record) => [record.candidateId, record]),
  );

  return candidates.map((candidate) => {
    const activeInterview = activeInterviewByCandidateId.get(candidate.id);

    return {
      candidateId: candidate.id,
      candidateName: formatCandidateName(candidate),
      candidateEmail: candidate.user.email || "",
      role: jobTitleById.get(candidate.job) ?? "Open Role",
      status: formatStatusLabel(activeInterview?.status ?? candidate.status),
      interviewId: activeInterview?.interviewId ?? null,
    };
  });
}

export default async function RecruiterInterviewsPage() {
  const interviewCards = await getInterviewCards();

  return (
    <main className="min-h-screen bg-[#f8f5f2] px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold text-[#171717]">
          Recruiter Interviews
        </h1>
        <p className="mt-2 text-[#5e5752]">
          Open a live interview room from the list below.
        </p>

        <div className="mt-8 grid gap-4">
          {interviewCards.length > 0 ? (
            interviewCards.map((interview) =>
              interview.interviewId ? (
                <Link
                  key={interview.candidateId}
                  href={{
                    pathname: `/recruiter/dashboard/interviews/live/${interview.interviewId}`,
                    query: {
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
              ) : (
                <div
                  key={interview.candidateId}
                  className="rounded-[1.5rem] border border-dashed border-[#d8cbc3] bg-white/80 px-5 py-5"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-[#171717]">
                        {interview.candidateName}
                      </h2>
                      <p className="text-[#5e5752]">{interview.role}</p>
                    </div>
                    <span className="rounded-full bg-[#f5efeb] px-4 py-2 text-sm font-semibold text-[#7a6f69]">
                      No Active Interview
                    </span>
                  </div>
                </div>
              ),
            )
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-[#d8cbc3] bg-white/80 px-5 py-8 text-center text-[#5e5752]">
              No candidates were returned by the backend.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
