'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteJob } from '@/utils/deleteJob';
import { useProfile } from '@/hooks/useProfile';

export default function JobDetailActions({ jobId }: { jobId: string }) {
  const router = useRouter();
  const { profile } = useProfile();
  const isAdmin = profile?.isAdmin || false;
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

  // 👇 Hide all actions for admins
  if (isAdmin) {
    return null;
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/recruiter/dashboard/jobs/${jobId}/edit`}
          className="rounded-full border border-[var(--color-primary)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-teal-dark)] transition hover:bg-[var(--color-teal-hover)]"
        >
          ✏ Edit Job
        </Link>
        <Link
          href={`/recruiter/dashboard/jobs/create?from=${jobId}`}
          className="rounded-full border border-[var(--color-warm-border-faint)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-teal-dark)]"
        >
          Duplicate Job
        </Link>
        <button
          onClick={() => setConfirm(true)}
          className="rounded-full border border-[var(--color-status-error-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-status-error-text)] transition hover:bg-[var(--color-status-error-bg)]"
        >
          Delete Job
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm font-medium text-[var(--color-status-error-text)]">{error}</p>
      )}

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
            <h3 className="text-lg font-bold text-[var(--color-foreground)]">Delete this job?</h3>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              This action cannot be undone. Existing applications linked to this job may also be affected.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirm(false)}
                disabled={isPending}
                className="flex-1 rounded-full border border-[var(--color-warm-border-faint)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 rounded-full bg-[var(--color-status-error-text)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-status-error-text)] disabled:opacity-60"
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