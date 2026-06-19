'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface Props {
  data: { job_title: string; applications: number }[];
}

export default function ApplicationsTable({ data }: Props) {
  const [showAll, setShowAll] = useState(false);
  const displayData = showAll ? data : data.slice(0, 5);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-[var(--color-warm-border)] bg-white p-6">
        <p className="text-sm text-[var(--color-text-subtle)]">No job application data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--color-warm-border)] bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-[var(--color-secondary)]">Applications Posted</h3>
      <p className="mb-4 text-sm text-[var(--color-text-muted)]">Jobs sorted by application volume</p>

      <div className="overflow-x-auto rounded-xl border border-[var(--color-warm-border)]">
        <table className="min-w-full divide-y divide-[var(--color-warm-surface)]">
          <thead className="bg-[var(--color-warm-bg)]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Job Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Applications
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-warm-surface)] bg-white">
            {displayData.map((job, i) => (
              <tr key={i} className="hover:bg-[var(--color-warm-bg-page)] transition">
                <td className="px-4 py-3 text-sm text-[var(--color-text-dark)]">{job.job_title}</td>
                <td className="px-4 py-3 text-sm font-semibold text-[var(--color-primary)]">
                  {job.applications}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length > 5 && (
        <div className="mt-4 text-right">
          <Button variant="ghost" size="sm" onClick={() => setShowAll(!showAll)}>
            {showAll ? 'Show less' : `Show more (${data.length - 5} more)`}
          </Button>
        </div>
      )}
    </div>
  );
}