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
    let errorMsg = `Failed to update status (HTTP ${response.status})`;
    try {
      const errorData = await response.json();
      // Backend error format: { "status": ["Cannot transition..."] }
      if (errorData.status && Array.isArray(errorData.status) && errorData.status.length > 0) {
        errorMsg = errorData.status[0];
      } else if (errorData.error) {
        errorMsg = errorData.error;
      }
    } catch {
      // fallback to generic message
    }
    throw new Error(errorMsg);
  }

  revalidatePath(`/recruiter/dashboard/candidates/${candidateId}`);
}

export async function getRecruiterHeaders(): Promise<HeadersInit | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  
  if (!token) return null;
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function serverFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getRecruiterHeaders();
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}