'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getApiUrl } from '@/utils/serverFetch';

export async function deleteJob(jobId: string): Promise<{ ok: boolean; error?: string }> {
  const jar = await cookies();
  const token = jar.get('auth_token')?.value;
  if (!token) redirect('/login');

  const res = await fetch(getApiUrl(`/jobs/jobs/${jobId}/`), {
    method: 'DELETE',
    headers: { Authorization: `Token ${token}` },
    cache: 'no-store',
  });

  if (res.status === 401 || res.status === 403) redirect('/api/auth/clear-session');
  if (res.status === 204 || res.ok) return { ok: true };
  return { ok: false, error: `Failed to delete job (${res.status})` };
}
