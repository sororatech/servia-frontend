import { redirect } from 'next/navigation';
import CandidateTable from '@/components/recruiter/CandidateTable';
import { getRecruiterHeaders } from '@/utils/serverFetch';
import { loadInitialCandidates } from '@/hooks/useCandidatesPageData';
import type { CandidateListItem } from '@/types/candidate';

export default async function RecruiterCandidatesPage() {
  const headers = await getRecruiterHeaders();

  if (!headers) {
    redirect('/login');
  }

  let initialCandidates: CandidateListItem[] = [];
  let loadError: string | null = null;

  try {
    initialCandidates = await loadInitialCandidates(headers);
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Unable to load candidates right now.';
  }

  return <CandidateTable initialCandidates={initialCandidates} error={loadError} />;
}
