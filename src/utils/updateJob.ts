'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getApiUrl } from '@/utils/serverFetch';
import type { CreateJobPayload, CreateJobResult } from '@/types/job';

export async function updateJob(jobId: string, payload: CreateJobPayload): Promise<CreateJobResult> {
  const jar = await cookies();
  const token = jar.get('auth_token')?.value;
  if (!token) redirect('/login');

  const response = await fetch(getApiUrl(`/jobs/jobs/${jobId}/`), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (response.status === 401 || response.status === 403) redirect('/api/auth/clear-session');

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    let data: unknown = {};
    try { data = JSON.parse(text); } catch {}
    console.error('[updateJob] backend error', response.status, text.slice(0, 500));
    const message = extractFirstError(data) ?? `Failed to update job (${response.status})`;
    return { ok: false, error: message };
  }

  const job = (await response.json()) as { id: string };
  return { ok: true, jobId: job.id };
}

function extractFirstError(data: unknown): string | null {
  if (typeof data === 'string') return data;
  if (data && typeof data === 'object') {
    for (const v of Object.values(data)) {
      if (Array.isArray(v) && typeof v[0] === 'string') return v[0];
      if (typeof v === 'string') return v;
    }
  }
  return null;
}
