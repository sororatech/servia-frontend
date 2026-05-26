import { cookies } from 'next/headers';
import type { ApiResponse } from '@/types/api';
import { getApiBaseUrl } from '@/lib/config';
import { unwrapCollection } from '@/lib/responseUtils';
import type { PaginatedResponse } from '@/lib/responseUtils';
export type { PaginatedResponse };

export function getApiUrl(path: string) {
  const base = getApiBaseUrl();
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function debugCookies() {
  const cookieStore = await cookies();
  return cookieStore.getAll();
}

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
    } as HeadersInit;
  }
  
  if (sessionId) {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    } as HeadersInit;
  }
  
  if (token) {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Token ${token}`,
    } as HeadersInit;
  }

  return null;
}

export async function fetchJson<T>(
  path: string, 
  arg2?: HeadersInit | (RequestInit & { softFail?: boolean }),
  options?: { softFail?: boolean; method?: string; body?: any }
): Promise<T> {
  const url = getApiUrl(path);
  
  let headers: HeadersInit = {};
  let fetchOptions: RequestInit & { softFail?: boolean } = {};
  
  if (arg2 && typeof arg2 === 'object') {
    if (Array.isArray(arg2) || 'constructor' in arg2) {
      headers = arg2 as HeadersInit;
      fetchOptions = options || {};
    } else {
      fetchOptions = arg2 as RequestInit & { softFail?: boolean };
      headers = fetchOptions.headers || {};
    }
  }
  
  const { softFail = false, method = 'GET', body, ...rest } = fetchOptions;
  
  const response = await fetch(url, { 
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers,
    }, 
    cache: 'no-store',
    credentials: 'include',
    body: body 
      ? typeof body === 'string' 
        ? body 
        : JSON.stringify(body)
      : undefined,
    ...rest,
  });

  if (response.status === 401) {
    if (softFail) return {} as T;
    throw new Error('Authentication required. Please log in via Django admin.');
  }

  if (response.status === 403) {
    const text = await response.text().catch(() => '');
    let detail = 'You do not have permission';
    try {
      const json = JSON.parse(text);
      detail = json.detail || json.message || detail;
    } catch {}
    
    if (softFail) {
      return {} as T;
    }
    throw new Error(`Access Denied: ${detail}`);
  }

  if (response.status === 404) {
    if (softFail) return {} as T;
    throw new Error('Endpoint not found');
  }

  if (!response.ok) {
    if (softFail) return {} as T;
    throw new Error(`Request failed: ${response.status}`);
  }

  if (response.status === 204) return {} as T;

  return await response.json() as T;
}

export async function fetchAllPages<T>(
  path: string, 
  headers: HeadersInit,
  options?: { softFail?: boolean; maxPages?: number }
): Promise<T[]> {
  const { softFail = false, maxPages = 50 } = options || {};
  
  try {
    const first = unwrapCollection(
      await fetchJson<ApiResponse<T[]> | PaginatedResponse<T> | T[]>(
        path, headers, { softFail }
      ),
    );
    
    if (!first?.items) return [];
    
    const items = [...first.items];
    let nextUrl = first.next;
    let page = 1;

    while (nextUrl && page < maxPages) {
      try {
        const res = await fetch(nextUrl, { 
          headers, cache: 'no-store', credentials: 'include' 
        });
        
        if (!res.ok) {
          if (softFail && [401, 403, 404].includes(res.status)) break;
          throw new Error(`Pagination failed: ${res.status}`);
        }
        
        const pageData = unwrapCollection(await res.json() as PaginatedResponse<T>);
        if (pageData?.items) {
          items.push(...pageData.items);
          nextUrl = pageData.next;
        } else break;
      } catch (err: any) {
        if (softFail) break;
        throw err;
      }
      page++;
    }
    
    return items;
  } catch (error: any) {
    if (softFail) return [];
    throw error;
  }
}

export async function fetchJsonSafe<T>(path: string, headers: HeadersInit): Promise<T | null> {
  try { return await fetchJson<T>(path, headers, { softFail: true }); } 
  catch { return null; }
}

export async function fetchAllPagesSafe<T>(path: string, headers: HeadersInit): Promise<T[]> {
  try { return await fetchAllPages<T>(path, headers, { softFail: true }); } 
  catch { return []; }
}