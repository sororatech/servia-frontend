import { redirect } from 'next/navigation';
import { getRecruiterHeaders } from '@/utils/serverFetch';
import CreateJobForm from '@/components/recruiter/CreateJobForm';
import { fetchJobFormChoices } from '@/utils/jobFormChoices';

export default async function CreateJobPage() {
  const headers = await getRecruiterHeaders();
  if (!headers) redirect('/login');

  const choices = await fetchJobFormChoices(headers);

  return <CreateJobForm choices={choices} />;
}
