import { fetchAllPages } from '@/utils/serverFetch';
import type { BackendCandidate, CandidateListItem } from '@/types/candidate';
import type { BackendJobSummary } from '@/types/job';

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
  const [rawCandidates, rawJobs] = await Promise.all([
    fetchAllPages<BackendCandidate>('/candidates/candidates/', headers),
    fetchAllPages<BackendJobSummary>('/jobs/jobs/', headers),
  ]);
  const candidates = dedup(rawCandidates);
  const jobs = dedup(rawJobs);

  const jobsById = new Map(jobs.map((job) => [job.id, job]));

  return candidates.map((candidate) => {
    const job = jobsById.get(candidate.job);
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
    };
  });
}
