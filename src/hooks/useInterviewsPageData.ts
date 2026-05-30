import { fetchAllPages } from '@/utils/serverFetch';
import type {
  CandidateRecord,
  JobRecord,
  InterviewRecord,
  AIReportRecord,
  InterviewRow,
  PageStats,
  ShortlistedRow,
} from '@/types/interview';

function formatCandidateName(candidate: CandidateRecord) {
  const fullName = `${candidate.user.first_name} ${candidate.user.last_name}`.trim();
  return fullName || candidate.user.email || 'Unnamed Candidate';
}

function formatStatusLabel(status: string) {
  return status
    .split('_')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

function dedup<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export async function getInterviewsPageData(
  headers: HeadersInit,
): Promise<{ stats: PageStats; interviews: InterviewRow[]; shortlisted: ShortlistedRow[] }> {
  const [rawCandidates, rawJobs, rawInterviews, rawReports] = await Promise.all([
    fetchAllPages<CandidateRecord>('/candidates/candidates/', headers),
    fetchAllPages<JobRecord>('/jobs/jobs/', headers),
    fetchAllPages<InterviewRecord>('/interviews/interviews/', headers),
    fetchAllPages<AIReportRecord>('/ai-reports/reports/', headers),
  ]);
  const candidates = dedup(rawCandidates);
  const jobs = dedup(rawJobs);
  const interviews = dedup(rawInterviews);
  const aiReports = dedup(rawReports);

  const jobTitleById = new Map(jobs.map((j) => [j.id, j.title]));
  const candidateById = new Map(candidates.map((c) => [c.id, c]));

  const scoreByInterviewId = new Map<string, number>();
  const recommendationByInterviewId = new Map<string, 'hire' | 'hold' | 'reject'>();
  for (const report of aiReports) {
    if (report.report_type === 'interview_analysis' && report.interview) {
      scoreByInterviewId.set(report.interview, report.fit_score);
      if (report.recommendation) {
        recommendationByInterviewId.set(report.interview, report.recommendation);
      }
    }
  }

  const analysisReports = aiReports.filter((r) => r.report_type === 'interview_analysis');
  const avgScore =
    analysisReports.length > 0
      ? Math.round(
          (analysisReports.reduce((sum, r) => sum + r.fit_score, 0) / analysisReports.length) * 10,
        ) / 10
      : null;

  const rows: InterviewRow[] = interviews
    .filter((i) => candidateById.get(i.candidate)?.status !== 'rejected_cv')
    .map((interview) => {
      const candidate = candidateById.get(interview.candidate);
      return {
        interviewId: interview.id,
        candidateId: interview.candidate,
        candidateName: candidate ? formatCandidateName(candidate) : 'Unknown',
        candidateEmail: candidate?.user.email ?? '',
        role: jobTitleById.get(interview.job) ?? 'Open Role',
        status: formatStatusLabel(interview.status),
        rawStatus: interview.status,
        recommendation: recommendationByInterviewId.get(interview.id) ?? null,
        score: scoreByInterviewId.get(interview.id) ?? null,
        scheduledTime: interview.scheduled_time ?? null,
      };
    });

  rows.sort((a, b) => {
    if (!a.scheduledTime) return 1;
    if (!b.scheduledTime) return -1;
    return Date.parse(b.scheduledTime) - Date.parse(a.scheduledTime);
  });

  const eligibleInterviews = interviews.filter(
    (i) => candidateById.get(i.candidate)?.status !== 'rejected_cv',
  );

  const activeInterviewCandidateIds = new Set(
    interviews
      .filter((i) => ['scheduled', 'confirmed', 'in_progress'].includes(i.status))
      .map((i) => i.candidate),
  );

  const shortlisted: ShortlistedRow[] = candidates
    .filter((c) => c.status === 'shortlisted' && !activeInterviewCandidateIds.has(c.id))
    .map((c) => ({
      id: c.id,
      name: formatCandidateName(c),
      email: c.user.email,
      role: jobTitleById.get(c.job) ?? 'Open Role',
      jobId: c.job,
    }));

  return {
    stats: {
      total: eligibleInterviews.length,
      completed: eligibleInterviews.filter((i) => i.status === 'completed').length,
      pending: eligibleInterviews.filter((i) =>
        ['scheduled', 'confirmed', 'in_progress'].includes(i.status),
      ).length,
      avgScore,
    },
    interviews: rows,
    shortlisted,
  };
}