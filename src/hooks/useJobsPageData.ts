import { redirect } from 'next/navigation';
import { fetchJson, SessionExpiredError } from '@/utils/serverFetch';
import { humanize } from '@/utils/formatters';
import type { BackendJob, JobListItem } from '@/types/job';

type JobsPage = {
  results?: BackendJob[];
  count?: number;
};

export type JobsPageData = {
  jobs: JobListItem[];
  error: string | null;
};

export async function loadJobs(headers: HeadersInit): Promise<JobsPageData> {
  try {
    const page = await fetchJson<JobsPage | BackendJob[]>('/jobs/jobs/?page_size=200&ordering=-created_at', headers);
    const raw: BackendJob[] = Array.isArray(page) ? page : (page.results ?? []);

    const seen = new Set<string>();
    const jobs = raw
      .filter((job) => {
        if (seen.has(job.id)) return false;
        seen.add(job.id);
        return true;
      })
      .map((job) => ({
        id: job.id,
        title: job.title,
        department: humanize(job.department),
        location: job.location,
        employmentType: humanize(job.employment_type),
        isActive: job.is_active,
        candidateCount: job.candidate_count,
        shortlistedCount: job.shortlisted_count,
        openingsCount: job.openings_count ?? 1,
        openingsRemaining: job.openings_remaining ?? (job.openings_count ?? 1),
        postedAt: job.created_at,
      }));

    return { jobs, error: null };
  } catch (error) {
    if (error instanceof SessionExpiredError) redirect('/api/auth/clear-session');
    return {
      jobs: [],
      error: error instanceof Error ? error.message : 'Unable to load jobs right now.',
    };
  }
}
