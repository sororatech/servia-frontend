import { LoadingSkeleton } from '@/components/ui';

export default function CandidatesLoading() {
  return (
    <div className="min-h-screen bg-page-gradient px-4 py-8 sm:px-6 lg:px-10">
      <LoadingSkeleton variant="list" />
    </div>
  );
}