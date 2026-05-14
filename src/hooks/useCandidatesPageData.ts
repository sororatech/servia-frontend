import { fetchAllPages } from '@/utils/serverFetch';
import type { BackendCandidate, BackendJobSummary, CandidateListItem } from '@/types/candidate';

function formatCandidateName(candidate: BackendCandidate) {
  const fullName = `${candidate.user.first_name} ${candidate.user.last_name}`.trim();
  return fullName || candidate.user.email || 'Unnamed Candidate';
}

export async function loadInitialCandidates(headers: HeadersInit): Promise<CandidateListItem[]> {
  const [candidates, jobs] = await Promise.all([
    fetchAllPages<BackendCandidate>('/candidates/candidates/', headers),
    fetchAllPages<BackendJobSummary>('/jobs/jobs/', headers),
  ]);

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
