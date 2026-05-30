import { notFound, redirect } from 'next/navigation';
import { fetchJson, SessionExpiredError } from '@/utils/serverFetch';
import type { BackendJob } from '@/types/job';

export async function getJob(id: string, headers: HeadersInit): Promise<BackendJob> {
  try {
    return await fetchJson<BackendJob>(`/jobs/jobs/${id}/`, headers);
  } catch (error) {
    if (error instanceof SessionExpiredError) redirect('/api/auth/clear-session');
    notFound();
  }
}
