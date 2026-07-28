'use client';

import { useState } from 'react';
import { CANDIDATE_STATUSES } from '@/types/candidate';
import { Button } from '@/components/ui/Button';
import { bulkUpdateCandidates, BulkUpdateResult } from '@/utils/bulkUpdateCandidates';

function humanizeStatus(status: string): string {
  return status
    .split('_')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

function humanizeErrorMessage(raw: string): string {
  if (raw.includes('Allowed: []') || raw.includes('Allowed: [ ]')) {
    return 'No further status changes are allowed for this candidate.';
  }
  return raw.replace(
    /'([^']+)'/g,
    (match, p1) => `'${humanizeStatus(p1)}'`
  );
}

interface BulkUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateIds: string[];
  onSuccess: () => void;
}

export default function BulkUpdateModal({ isOpen, onClose, candidateIds, onSuccess }: BulkUpdateModalProps) {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partialErrors, setPartialErrors] = useState<Array<{ candidate_id: string; error: string }>>([]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) {
      setError('Please select a status.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setPartialErrors([]);
    try {
      const result: BulkUpdateResult = await bulkUpdateCandidates(candidateIds, selectedStatus);
      if (result.updated_count > 0) {
        onSuccess(); // refresh
      }
      if (result.errors && result.errors.length > 0) {
        // Humanize each error message
        const humanizedErrors = result.errors.map((err) => ({
          ...err,
          error: humanizeErrorMessage(err.error),
        }));
        setPartialErrors(humanizedErrors);
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(humanizeErrorMessage(err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-[var(--color-warm-border)] bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-[var(--color-secondary)]">Bulk Update Status</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Update status for {candidateIds.length} candidate{candidateIds.length !== 1 ? 's' : ''}.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--color-foreground)]">New Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="mt-1 w-full rounded-full border border-[var(--color-warm-border)] bg-[var(--color-input-bg-light)] px-4 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
              required
            >
              <option value="">Select status</option>
              {CANDIDATE_STATUSES.map((s) => (
                <option key={s} value={s}>{humanizeStatus(s)}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {partialErrors.length > 0 && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <p className="text-sm font-semibold text-yellow-800">Some candidates could not be updated:</p>
              <ul className="mt-1 max-h-40 overflow-y-auto text-xs text-yellow-700">
                {partialErrors.map((err, idx) => (
                  <li key={idx} className="mt-1">• {err.error}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}