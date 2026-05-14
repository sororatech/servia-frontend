'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteJob } from '@/utils/deleteJob';

export default function JobDetailActions({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteJob(jobId);
      if (result.ok) {
        router.push('/recruiter/dashboard/jobs');
      } else {
        setError(result.error ?? 'Failed to delete job.');
        setConfirm(false);
      }
    });
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/recruiter/dashboard/jobs/${jobId}/edit`}
          className="rounded-full border border-[#26b9c8] bg-white px-5 py-3 text-sm font-semibold text-[#0c6c75] transition hover:bg-[#f0fdff]"
        >
          ✏ Edit Job
        </Link>
        <Link
          href={`/recruiter/dashboard/jobs/create?from=${jobId}`}
          className="rounded-full border border-[#ddd5cf] bg-white px-5 py-3 text-sm font-semibold text-[#635b55] transition hover:border-[#26b9c8] hover:text-[#0c6c75]"
        >
          Duplicate Job
        </Link>
        <button
          onClick={() => setConfirm(true)}
          className="rounded-full border border-[#efc7bf] bg-white px-5 py-3 text-sm font-semibold text-[#b13d2f] transition hover:bg-[#fff0ec]"
        >
          Delete Job
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm font-medium text-[#b13d2f]">{error}</p>
      )}

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
            <h3 className="text-lg font-bold text-[#171717]">Delete this job?</h3>
            <p className="mt-2 text-sm text-[#635b55]">
              This action cannot be undone. Existing applications linked to this job may also be affected.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirm(false)}
                disabled={isPending}
                className="flex-1 rounded-full border border-[#ddd5cf] bg-white px-4 py-2.5 text-sm font-semibold text-[#635b55] transition hover:border-[#26b9c8]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 rounded-full bg-[#b13d2f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#9a3326] disabled:opacity-60"
              >
                {isPending ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
