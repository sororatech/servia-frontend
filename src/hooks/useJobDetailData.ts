import { getJob } from '@/utils/fetchJob';
import { humanize, formatDate } from '@/utils/formatters';
import type { BackendJob } from '@/types/job';

export type JobDetail = {
  job: BackendJob;
  departmentLabel: string;
  employmentTypeLabel: string;
  shiftTypeLabel: string;
  postedAt: string;
  updatedAt: string;
};

export async function loadJobDetail(id: string, headers: HeadersInit): Promise<JobDetail> {
  const job = await getJob(id, headers);
  return {
    job,
    departmentLabel: humanize(job.department),
    employmentTypeLabel: humanize(job.employment_type),
    shiftTypeLabel: humanize(job.shift_type),
    postedAt: formatDate(job.created_at),
    updatedAt: formatDate(job.updated_at),
  };
}
