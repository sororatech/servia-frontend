'use client';

import { useState, useTransition } from 'react';
import { CANDIDATE_STATUSES } from '@/types/candidate';
import { updateCandidateStatus } from '@/utils/updateCandidateStatus';

function humanize(status: string): string {
  return status
    .split('_')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

type Props = {
  candidateId: string;
  currentStatus: string;
};

export default function CandidateStatusSelect({ candidateId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    const previous = status;
    setStatus(next);
    setError(null);

    startTransition(() => {
      updateCandidateStatus(candidateId, next)
        .then(() => {
          // success – no error
        })
        .catch((err: Error) => {
          setStatus(previous);
          setError(err.message);
        });
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="relative inline-flex items-center">
        <select
          value={status}
          onChange={handleChange}
          disabled={isPending}
          className="appearance-none cursor-pointer rounded-full border-2 border-[var(--color-primary)] bg-[var(--color-teal-light)] px-4 py-1.5 pr-8 text-sm font-semibold text-[var(--color-primary)] focus:outline-none disabled:opacity-60"
        >
          {CANDIDATE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {humanize(s)}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 text-[var(--color-primary)] text-xs">
          ▾
        </span>
      </div>
      {error && (
        <p className="max-w-[220px] text-right text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}