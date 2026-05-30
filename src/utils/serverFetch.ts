import { cookies } from 'next/headers';
import type { ApiResponse } from '@/types/api';
import { getApiBaseUrl } from '@/lib/config';
import { unwrapCollection } from '@/lib/responseUtils';
import type { PaginatedResponse } from '@/lib/responseUtils';
export type { PaginatedResponse };

export class SessionExpiredError extends Error {
  constructor() {
    super('Your session has expired. Please sign in again.');
    this.name = 'SessionExpiredError';
  }
}

export function getApiUrl(path: string) {
  const base = getApiBaseUrl();
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function getRecruiterHeaders() {
  const jar = await cookies();
  const role = jar.get('user_role')?.value;
  const token = jar.get('auth_token')?.value;

  if (role !== 'recruiter' || !token) return null;

  return {
    'Content-Type': 'application/json',
    Authorization: `Token ${token}`,
  };
}

export async function fetchJson<T>(path: string, headers: HeadersInit): Promise<T> {
  const response = await fetch(getApiUrl(path), { headers, cache: 'no-store' });

  if (response.status === 401 || response.status === 403) {
    throw new SessionExpiredError();
  }
  if (!response.ok) {
    throw new Error(`Request failed for ${path} with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchAllPages<T>(path: string, headers: HeadersInit): Promise<T[]> {
  const first = unwrapCollection(
    await fetchJson<ApiResponse<T[]> | PaginatedResponse<T> | T[]>(path, headers),
  );
  const items = [...first.items];
  let nextUrl = first.next;

  while (nextUrl) {
    const res = await fetch(nextUrl, { headers, cache: 'no-store' });
    if (res.status === 401 || res.status === 403) {
      throw new SessionExpiredError();
    }
    if (!res.ok) {
      throw new Error(`Request failed for ${nextUrl} with status ${res.status}`);
    }
    const page = unwrapCollection((await res.json()) as PaginatedResponse<T>);
    items.push(...page.items);
    nextUrl = page.next;
  }

  return items;
}
