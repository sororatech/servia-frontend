'use client';

import { APPLICATION_STAGES, STATUS_TO_STAGE_INDEX, REJECTED_STATUSES } from '@/lib/applications';

interface ApplicationProgressProps {
  status: string;
}

export const ApplicationProgress = ({ status }: ApplicationProgressProps) => {
  const currentIndex = STATUS_TO_STAGE_INDEX[status.toLowerCase()] ?? 0;
  const isRejected = REJECTED_STATUSES.includes(status.toLowerCase() as any);
  
  const fillWidth = currentIndex >= 0 
    ? `${((currentIndex + 1) / APPLICATION_STAGES.length) * 100}%` 
    : '0%';

  return (
    <div className="w-full mt-2">
      <div className="flex justify-between mb-2 text-[10px] font-bold tracking-wider uppercase">
        {APPLICATION_STAGES.map((stage, idx) => {
          const isLast = idx === APPLICATION_STAGES.length - 1;
          const isActive = !isRejected && idx <= currentIndex;
          const isRejectedStage = isRejected && isLast;

          return (
            <span
              key={stage}
              className={`transition-colors ${
                isActive ? 'text-[var(--color-primary)]' :
                isRejectedStage ? 'text-[var(--color-progress-rejected)]' :
                'text-gray-400'
              }`}
            >
              {isRejectedStage ? 'NOT SELECTED' : stage}
            </span>
          );
        })}
      </div>

      <div className="relative h-1.5 bg-[var(--color-progress-track)] rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
            isRejected ? 'bg-[var(--color-progress-rejected)]' : 'bg-[var(--color-primary)]'
          }`}
          style={{ width: fillWidth }}
        />
      </div>
    </div>
  );
};