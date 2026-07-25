'use client';

import { APPLICATION_STAGES, STATUS_TO_STAGE_INDEX, REJECTED_STATUSES, formatStatusDisplay } from '@/lib/applications';

interface ApplicationProgressProps {
  status: string;
}

export const ApplicationProgress = ({ status }: ApplicationProgressProps) => {
  const lowerStatus = status?.toLowerCase() || '';
  const isRejected = REJECTED_STATUSES.includes(lowerStatus as any);
  const activeIndex = STATUS_TO_STAGE_INDEX[lowerStatus] ?? -1;

  if (isRejected) {
    return (
      <div className="w-full">
        <div className="flex justify-between mb-2 text-[10px] font-bold tracking-wider uppercase">
          {APPLICATION_STAGES.map((stage) => (
            <span key={stage} className="text-[var(--color-text-faint)]">{stage}</span>
          ))}
        </div>
        <div className="relative h-1.5 bg-[var(--color-warm-border)] rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full rounded-full bg-[var(--color-text-faint)]" style={{ width: '100%' }} />
        </div>
        <div className="mt-2 text-center">
          <span className="inline-flex px-2 py-0.5 bg-[var(--color-status-error-bg)] text-[var(--color-status-error-text)] text-xs rounded-full">
            {formatStatusDisplay(status)}
          </span>
        </div>
      </div>
    );
  }

  const fillWidth = activeIndex >= 0 ? `${((activeIndex + 1) / APPLICATION_STAGES.length) * 100}%` : '0%';

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2 text-[10px] font-bold tracking-wider uppercase">
        {APPLICATION_STAGES.map((stage, idx) => (
          <span
            key={stage}
            className={idx <= activeIndex ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-faint)]'}
          >
            {stage}
          </span>
        ))}
      </div>
      <div className="relative h-1.5 bg-[var(--color-warm-border)] rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-[var(--color-primary)] transition-all duration-500"
          style={{ width: fillWidth }}
        />
      </div>
    </div>
  );
};