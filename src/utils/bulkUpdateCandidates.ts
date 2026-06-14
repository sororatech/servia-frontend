import { getApiBaseUrl } from '@/lib/config';

export interface BulkUpdateResult {
  updated_count: number;
  errors: Array<{ candidate_id: string; error: string }>;
  message: string;
}

export async function bulkUpdateCandidates(candidateIds: string[], newStatus: string): Promise<BulkUpdateResult> {
  const token = localStorage.getItem('auth_token');
  if (!token) throw new Error('Not authenticated');

  const url = `${getApiBaseUrl()}/candidates/bulk-update-status/`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({
      candidate_ids: candidateIds,
      status: newStatus,
    }),
  });

  if (!response.ok) {
    let errorMsg = 'Bulk update failed.';
    try {
      const data = await response.json();
      if (data.error) errorMsg = data.error;
    } catch {}
    throw new Error(errorMsg);
  }

  const data = await response.json();
  return data as BulkUpdateResult;
}