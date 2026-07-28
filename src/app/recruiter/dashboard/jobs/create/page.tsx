import { redirect } from 'next/navigation';
import { getRecruiterHeaders } from '@/lib/serverAuth';   
import CreateJobForm from '@/components/recruiter/CreateJobForm';
import { fetchJobFormChoices } from '@/utils/jobFormChoices';
import { getJob } from '@/utils/fetchJob';

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

  const initialJob = sourceJob
    ? { ...sourceJob, id: '', title: `Copy of ${sourceJob.title}`, is_active: false, candidate_count: 0, shortlisted_count: 0, created_at: '', updated_at: '' }
    : undefined;

  return <CreateJobForm choices={choices} initialJob={initialJob} />;
}