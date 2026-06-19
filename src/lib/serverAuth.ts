import { fetchJson } from '@/utils/serverFetch';
import { cookies } from 'next/headers';

export async function getRecruiterHeaders(): Promise<HeadersInit | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('sessionid')?.value;
  const token =
    cookieStore.get('auth_token')?.value ||
    cookieStore.get('token')?.value ||
    cookieStore.get('access_token')?.value;

  const manualToken = process.env.DEV_API_TOKEN;

  if (manualToken) {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Token ${manualToken}`,
    };
  }

  if (sessionId) {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  if (token) {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Token ${token}`,
    };
  }

  return null;
}

export async function debugCookies() {
  const cookieStore = await cookies();
  return cookieStore.getAll();
}

// Optional: export a wrapper that also fetches (if needed)
export async function fetchWithServerAuth<T>(path: string, options?: RequestInit) {
  const headers = await getRecruiterHeaders();
  if (!headers) throw new Error('No auth headers');
  return fetchJson<T>(path, headers, options);
}