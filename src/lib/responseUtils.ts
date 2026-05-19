import type { ApiResponse } from '@/types/api';

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export function unwrapCollection<T>(
  payload: ApiResponse<T[]> | PaginatedResponse<T> | T[],
): { items: T[]; next: string | null } {
  if (Array.isArray(payload)) return { items: payload, next: null };
  if ('data' in payload && Array.isArray(payload.data)) return { items: payload.data, next: null };
  if ('results' in payload) return { items: payload.results, next: payload.next };
  return { items: [], next: null };
}
