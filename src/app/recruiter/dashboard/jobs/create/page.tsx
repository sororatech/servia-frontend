import { redirect } from 'next/navigation';
import { getRecruiterHeaders } from '@/utils/serverFetch';
import { getJob } from '@/utils/fetchJob';
import CreateJobForm from '@/components/recruiter/CreateJobForm';
import { fetchJobFormChoices } from '@/utils/jobFormChoices';

type Props = {
  searchParams: Promise<{ from?: string }>;
};

export default async function CreateJobPage({ searchParams }: Props) {
  const { from } = await searchParams;
  const headers = await getRecruiterHeaders();
  if (!headers) redirect('/login');

  const [choices, sourceJob] = await Promise.all([
    fetchJobFormChoices(headers),
    from ? getJob(from, headers).catch(() => undefined) : Promise.resolve(undefined),
  ]);

  // Strip id/timestamps so it acts as a new job pre-filled with source data
  const initialJob = sourceJob
    ? { ...sourceJob, id: '', title: `Copy of ${sourceJob.title}`, is_active: false, candidate_count: 0, shortlisted_count: 0, created_at: '', updated_at: '' }
    : undefined;

  return <CreateJobForm choices={choices} initialJob={initialJob} />;
}
