interface StatusStepsProps {
  status: string; 
}

const STEPS = ['APPLIED', 'SHORTLISTED', 'IN REVIEW', 'INTERVIEW', 'OFFER'];

const getActiveIndex = (status: string): number => {
  const lower = status.toLowerCase();
  if (lower === 'applied') return 0;
  if (lower === 'screened') return 1;
  if (lower === 'shortlisted') return 2;
  if (['video_submitted', 'interview_scheduled', 'interviewed'].includes(lower)) return 3;
  if (['offered', 'hired'].includes(lower)) return 4;
  if (['rejected_cv', 'rejected_interview'].includes(lower)) return -1;
  return -1; 
};

export const StatusSteps = ({ status }: StatusStepsProps) => {
  const activeIndex = getActiveIndex(status);
  const isRejected = ['rejected_cv', 'rejected_interview'].includes(status.toLowerCase());

  return (
    <div className="flex flex-wrap items-center gap-1 text-xs font-medium">
      {STEPS.map((step, idx) => (
        <div key={step} className="flex items-center gap-1">
          <span
            className={
              !isRejected && idx <= activeIndex
                ? 'text-[#26B9C8]'
                : 'text-gray-400'
            }
          >
            {step}
          </span>
          {idx < STEPS.length - 1 && (
            <span className="text-gray-300 mx-0.5">|</span>
          )}
        </div>
      ))}
      {isRejected && (
        <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-[10px] rounded-full">
          Rejected
        </span>
      )}
    </div>
  );
};