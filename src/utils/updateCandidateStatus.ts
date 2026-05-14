'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getApiUrl } from '@/utils/serverFetch';

export async function updateCandidateStatus(candidateId: string, status: string) {
  const jar = await cookies();
  const token = jar.get('auth_token')?.value;
  if (!token) redirect('/login');

  const response = await fetch(getApiUrl(`/candidates/candidates/${candidateId}/`), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update status: ${response.status}`);
  }

  revalidatePath(`/recruiter/dashboard/candidates/${candidateId}`);
}
