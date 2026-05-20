// src/utils/serverFetch.ts — FINAL DEBUG VERSION
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

// ✅ DEBUG: Export a function to see what cookies Next.js can actually read
export async function debugCookies() {
  const cookieStore = await cookies();
  const all = cookieStore.getAll();
  console.log('🍪 Next.js can read these cookies:', all.map(c => ({
    name: c.name,
    value: c.value?.slice(0, 10) + '...',
    httpOnly: 'httpOnly' in c ? c.httpOnly : 'N/A'
  })));
  return all;
}

export async function getRecruiterHeaders() {
  const cookieStore = await cookies();
  
  // 🔍 Log cookie NAMES only (safer)
  const cookieNames = cookieStore.getAll().map(c => c.name);
  console.log('🍪 Cookie names available to Next.js:', cookieNames);
  
  // ✅ Try Django session auth FIRST
  const sessionId = cookieStore.get('sessionid')?.value;
  
  // ✅ Then try token auth
  const token = 
    cookieStore.get('auth_token')?.value ||
    cookieStore.get('token')?.value ||
    cookieStore.get('access_token')?.value;
  
  // ✅ Optional: manual override for dev (set in .env.local)
  const manualToken = process.env.DEV_API_TOKEN;
  
  console.log('🔐 Auth detection:', {
    hasSessionId: !!sessionId,
    hasToken: !!token,
    hasManualToken: !!manualToken,
  });

  // 🎯 PRIORITY 1: Manual dev token (bypasses all cookie issues)
  if (manualToken) {
    console.log('✅ Using DEV_API_TOKEN from .env.local');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Token ${manualToken}`,
    };
  }
  
  // 🎯 PRIORITY 2: Django session (if cookie is accessible)
  if (sessionId) {
    console.log('✅ Using Django sessionid cookie');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // No Authorization header - cookies sent via credentials: 'include'
    };
  }
  
  // 🎯 PRIORITY 3: Token auth
  if (token) {
    console.log('✅ Using token auth');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Token ${token}`,
    };
  }

  console.error('❌ NO AUTH FOUND - returning null');
  return null;
}

export async function fetchJson<T>(
  path: string, 
  headers: HeadersInit,
  options?: { softFail?: boolean; method?: string; body?: string }
): Promise<T> {
  const url = getApiUrl(path);
  const { softFail = false, method = 'GET', body } = options || {};
  
  console.log(`📡 ${method} ${url}`);
  
  const response = await fetch(url, { 
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers,
    }, 
    cache: 'no-store',
    credentials: 'include', // ✅ Sends cookies to Django
  });

  console.log(`📡 Response: ${response.status}`);
  
  // ✅ 401: Not authenticated
  if (response.status === 401) {
    if (softFail) return {} as T;
    throw new Error('Authentication required. Please log in via Django admin.');
  }

  // ✅ 403: Permission denied
  if (response.status === 403) {
    const text = await response.text().catch(() => '');
    let detail = 'You do not have permission';
    try {
      const json = JSON.parse(text);
      detail = json.detail || json.message || detail;
    } catch {}
    
    console.error('🚫 403:', detail);
    
    if (softFail) {
      console.warn('⚠️ Soft-fail: returning empty');
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