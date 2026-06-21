'use client';

import Link from 'next/link';

type InterviewsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function InterviewsError({ error, reset }: InterviewsErrorProps) {
  const isBackendDown =
    error.name === 'BackendUnavailableError' ||
    error.message.includes('Unable to connect') ||
    error.message.includes('did not respond');

  return (
    <main className="min-h-screen bg-page-gradient px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-[var(--color-status-error-border)] bg-white/90 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <h1 className="text-3xl font-semibold text-[var(--color-foreground)]">
          {isBackendDown ? 'Backend unavailable' : 'Could not load interviews'}
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--color-text-body)]">
          {isBackendDown
            ? 'The interviews page could not reach the Django API. The server may be stopped or stuck.'
            : error.message || 'Something went wrong while loading interview data.'}
        </p>

        {isBackendDown ? (
          <div className="mt-6 rounded-[1.25rem] border border-[var(--color-warm-border)] bg-[var(--color-warm-surface)] p-4 text-sm leading-6 text-[var(--color-text-body)]">
            <p className="font-semibold">Restart the backend:</p>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-[var(--color-neutral-border)] px-3 py-2 text-[13px]">
{`cd ~/personal/servia-backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000`}
            </pre>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Try again
          </button>
          <Link
            href="/recruiter/dashboard/overview"
            className="rounded-full border border-[var(--color-warm-border-deep)] px-5 py-2.5 text-sm font-semibold text-[var(--color-text-body)] transition hover:border-[var(--color-primary)]"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
