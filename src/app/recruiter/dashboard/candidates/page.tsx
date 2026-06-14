// app/recruiter/dashboard/candidates/page.tsx
import { redirect } from 'next/navigation';
import { getRecruiterHeaders } from '@/lib/serverAuth';
import { loadInitialCandidates } from '@/hooks/useCandidatesPageData';
import CandidateTable from '@/components/recruiter/CandidateTable';

export default async function RecruiterCandidatesPage() {
  const headers = await getRecruiterHeaders();
  if (!headers) redirect('/login');

  let initialCandidates: Awaited<ReturnType<typeof loadInitialCandidates>> = [];
  let loadError: string | null = null;

  try {
    initialCandidates = await loadInitialCandidates(headers);
  } catch (err) {
    loadError = err instanceof Error ? err.message : 'Unable to load candidates right now.';
  }

  return <CandidateTable initialCandidates={initialCandidates} error={loadError} />;
}