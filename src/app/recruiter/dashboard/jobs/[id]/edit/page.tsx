import { redirect } from 'next/navigation';
import { getRecruiterHeaders } from '@/utils/serverFetch';
import { getJob } from '@/utils/fetchJob';
import { fetchJobFormChoices } from '@/utils/jobFormChoices';
import CreateJobForm from '@/components/recruiter/CreateJobForm';

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const headers = await getRecruiterHeaders();
  if (!headers) redirect('/login');

  const [job, choices] = await Promise.all([
    getJob(id, headers),
    fetchJobFormChoices(headers),
  ]);

  return <CreateJobForm choices={choices} initialJob={job} />;
}
