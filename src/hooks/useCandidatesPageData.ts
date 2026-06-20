import { fetchAllPages } from '@/utils/serverFetch';
import type { BackendCandidate, CandidateListItem } from '@/types/candidate';
import type { BackendJobSummary } from '@/types/job';
import type { InterviewRecord } from '@/types/interview';

const ACTIVE_INTERVIEW_STATUSES = new Set(['scheduled', 'confirmed', 'in_progress']);

function formatCandidateName(candidate: BackendCandidate) {
  const fullName = `${candidate.user.first_name} ${candidate.user.last_name}`.trim();
  return fullName || candidate.user.email || 'Unnamed Candidate';
}

function dedup<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export async function loadInitialCandidates(headers: HeadersInit): Promise<CandidateListItem[]> {
  const [rawCandidates, rawJobs, rawInterviews] = await Promise.all([
    fetchAllPages<BackendCandidate>('/candidates/candidates/', headers),
    fetchAllPages<BackendJobSummary>('/jobs/jobs/', headers),
    fetchAllPages<InterviewRecord>('/interviews/interviews/', headers),
  ]);
  const candidates = dedup(rawCandidates);
  const jobs = dedup(rawJobs);
  const interviews = dedup(rawInterviews);

  const jobsById = new Map(jobs.map((job) => [job.id, job]));

  const activeInterviewByCandidateId = new Map<string, InterviewRecord>();
  for (const interview of interviews) {
    if (!ACTIVE_INTERVIEW_STATUSES.has(interview.status)) {
      continue;
    }

    const existing = activeInterviewByCandidateId.get(interview.candidate);
    if (!existing) {
      activeInterviewByCandidateId.set(interview.candidate, interview);
      continue;
    }

    const existingTime = Date.parse(existing.scheduled_time ?? existing.created_at ?? '');
    const nextTime = Date.parse(interview.scheduled_time ?? interview.created_at ?? '');
    if (nextTime >= existingTime) {
      activeInterviewByCandidateId.set(interview.candidate, interview);
    }
  }

  return candidates.map((candidate) => {
    const job = jobsById.get(candidate.job);
    const activeInterview = activeInterviewByCandidateId.get(candidate.id);

    return {
      id: candidate.id,
      name: formatCandidateName(candidate),
      email: candidate.user.email,
      role: job?.title || 'Unknown Role',
      department: job?.department || 'General',
      aiScore: candidate.ai_score,
      status: candidate.status,
      appliedAt: candidate.applied_at,
      jobId: candidate.job,
      activeInterview: activeInterview
        ? {
            id: activeInterview.id,
            status: activeInterview.status,
            meetLink: activeInterview.meet_link ?? '',
          }
        : null,
    };
  });
}
