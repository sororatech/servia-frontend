import { redirect } from 'next/navigation';
import JobsGrid from '@/components/recruiter/JobsGrid';
import { getRecruiterHeaders } from '@/utils/serverFetch';
import { loadJobs } from '@/hooks/useJobsPageData';

export default async function JobManagementPage() {
  const headers = await getRecruiterHeaders();
  if (!headers) redirect('/login');

  const { jobs, error } = await loadJobs(headers);

  return <JobsGrid initialJobs={jobs} error={error} />;
}
