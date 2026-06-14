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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchJson<T>(
  path: string,
  headers?: HeadersInit,
  options?: {
    softFail?: boolean;
    method?: string;
    body?: any;
    retries?: number;          // max retry attempts
    retryDelay?: number;       // initial delay in ms
  }
): Promise<T> {
  const url = getApiUrl(path);
  const method = options?.method || 'GET';
  const body = options?.body;
  const softFail = options?.softFail || false;
  const maxRetries = options?.retries ?? 3;
  const initialDelay = options?.retryDelay ?? 1000; // 1 second

  let lastError: Error | null = null;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...headers,
        },
        cache: 'no-store',
        credentials: 'include',
        body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : delay;
        if (attempt < maxRetries) {
          console.warn(`Rate limited (429). Retrying in ${waitTime / 1000}s... (attempt ${attempt + 1}/${maxRetries})`);
          await sleep(waitTime);
          delay *= 2; // exponential backoff
          continue;
        }
        if (softFail) return {} as T;
        throw new Error(`Rate limit exceeded (429) after ${maxRetries} retries`);
      }

      // Handle 401/403 – session expired
      if (response.status === 401 || response.status === 403) {
        if (softFail) return {} as T;
        throw new SessionExpiredError();
      }

      // Handle 404
      if (response.status === 404) {
        if (softFail) return {} as T;
        throw new Error('Endpoint not found');
      }

      // Other unsuccessful responses
      if (!response.ok) {
        if (softFail) return {} as T;
        throw new Error(`Request failed: ${response.status}`);
      }

      // Success: 204 No Content
      if (response.status === 204) return {} as T;

      // Parse JSON and return
      return (await response.json()) as T;
    } catch (err: any) {
      lastError = err;
      if (err instanceof SessionExpiredError) throw err;
      if (attempt < maxRetries && (err.message?.includes('429') || err.message?.includes('Rate limit'))) {
        console.warn(`Request failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms...`);
        await sleep(delay);
        delay *= 2;
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('Request failed after retries');
}

// fetchAllPages uses fetchJson internally, so it automatically gains retry logic
export async function fetchAllPages<T>(
  path: string,
  headers: HeadersInit,
  options?: { softFail?: boolean; maxPages?: number; retries?: number }
): Promise<T[]> {
  const { softFail = false, maxPages = 50, retries } = options || {};

  try {
    const first = unwrapCollection(
      await fetchJson<ApiResponse<T[]> | PaginatedResponse<T> | T[]>(path, headers, { softFail, retries })
    );

    if (!first?.items) return [];

    const items = [...first.items];
    let nextUrl = first.next;
    let page = 1;

    while (nextUrl && page < maxPages) {
      try {
        const res = await fetch(nextUrl, {
          headers,
          cache: 'no-store',
          credentials: 'include',
        });

        if (res.status === 401 || res.status === 403) {
          if (softFail) break;
          throw new SessionExpiredError();
        }

        if (res.status === 429 && softFail) break; // avoid endless loops during rate limiting
        if (!res.ok) {
          if (softFail && [401, 403, 404, 429].includes(res.status)) break;
          throw new Error(`Pagination failed: ${res.status}`);
        }

        const pageData = unwrapCollection((await res.json()) as PaginatedResponse<T>);
        if (pageData?.items) {
          items.push(...pageData.items);
          nextUrl = pageData.next;
        } else break;
      } catch (err: any) {
        if (err instanceof SessionExpiredError) throw err;
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
  try {
    return await fetchJson<T>(path, headers, { softFail: true, retries: 2 });
  } catch {
    return null;
  }
}

export async function fetchAllPagesSafe<T>(path: string, headers: HeadersInit): Promise<T[]> {
  try {
    return await fetchAllPages<T>(path, headers, { softFail: true, retries: 2 });
  } catch {
    return [];
  }
}