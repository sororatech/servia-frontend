'use client';

import { Candidate } from '@/types/settings';

export default function CandidatesTable({ candidates = [] }: { candidates?: Candidate[] }) {
  return (
    <div className="rounded-2xl border border-[var(--color-warm-border)] bg-white dark:bg-[var(--color-warm-surface)] p-6 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-warm-border)]">
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-muted)]">Candidate</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-muted)]">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-muted)]">Applied Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-warm-border)]">
            {candidates.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-[var(--color-text-muted)]">No candidates found</td>
              </tr>
            ) : (
              candidates.map((c) => (
                <tr key={c.id} className="hover:bg-[var(--color-warm-bg-page)] dark:hover:bg-[var(--color-warm-bg-deep)] transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[var(--color-status-warning-text)] to-[var(--color-status-warning-border)] text-white flex items-center justify-center text-sm font-semibold">
                        {c.user?.first_name?.[0] || ''}{c.user?.last_name?.[0] || ''}
                      </div>
                      <p className="font-medium text-[var(--color-foreground)]">
                        {c.user?.first_name || ''} {c.user?.last_name || ''}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--color-text-muted)]">{c.user?.email || ''}</td>
                  <td className="px-4 py-4 text-sm text-[var(--color-text-muted)]">
                    {c.applied_date 
                      ? new Date(c.applied_date).toLocaleDateString() 
                      : (c.date_joined ? new Date(c.date_joined).toLocaleDateString() : 'N/A')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}