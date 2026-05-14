'use client';

import { useTransition } from 'react';
import { CANDIDATE_STATUSES } from '@/types/candidate';
import { updateCandidateStatus } from '@/utils/updateCandidateStatus';

function humanize(status: string) {
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
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    startTransition(() => {
      updateCandidateStatus(candidateId, next).catch(() => {});
    });
  }

  return (
    <div className="relative inline-flex items-center">
      <select
        defaultValue={currentStatus}
        onChange={handleChange}
        disabled={isPending}
        className="appearance-none cursor-pointer rounded-full border-2 border-[var(--color-primary)] bg-[#e8f9fb] px-4 py-1.5 pr-8 text-sm font-semibold text-[var(--color-primary)] focus:outline-none disabled:opacity-60"
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
  );
}
