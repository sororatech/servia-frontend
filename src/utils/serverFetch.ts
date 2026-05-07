import { cookies } from 'next/headers';
import type { ApiResponse } from '@/types/api';

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export function getApiUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';
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
    throw new Error('Recruiter session expired. Please sign in again.');
  }
  if (!response.ok) {
    throw new Error(`Request failed for ${path} with status ${response.status}`);
  }

  return (await response.json()) as T;
}

function unwrapCollection<T>(
  payload: ApiResponse<T[]> | PaginatedResponse<T> | T[],
): { items: T[]; next: string | null } {
  if (Array.isArray(payload)) return { items: payload, next: null };
  if ('data' in payload && Array.isArray(payload.data)) return { items: payload.data, next: null };
  if ('results' in payload) return { items: payload.results, next: payload.next };
  return { items: [], next: null };
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
      throw new Error('Recruiter session expired. Please sign in again.');
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
