import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getRecruiterHeaders } from '@/lib/serverAuth';
import { fetchJson } from '@/utils/serverFetch';
import AIScoreBadge from '@/components/recruiter/AIScoreBadge';
import CandidateStatusSelect from '@/components/recruiter/CandidateStatusSelect';
import FileCard from '@/components/recruiter/FileCard';
import type { BackendCandidateDetail } from '@/types/candidate';
import type { BackendJobSummary } from '@/types/job';

type Props = {
  params: Promise<{ id: string }>;
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso));
}

export default async function CandidateDetailPage({ params }: Props) {
  const { id } = await params;
  const headers = await getRecruiterHeaders();
  if (!headers) notFound();

  let candidate: BackendCandidateDetail;
  let job: BackendJobSummary | null = null;

  try {
    candidate = await fetchJson<BackendCandidateDetail>(`/candidates/candidates/${id}/`, headers);
  } catch {
    notFound();
  }

  try {
    job = await fetchJson<BackendJobSummary>(`/jobs/jobs/${candidate.job}/`, headers);
  } catch {
    // optional
  }

  const fullName = `${candidate.user.first_name} ${candidate.user.last_name}`.trim() || candidate.user.email;

  return (
    <main className="min-h-screen bg-page-gradient px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        
        {/* Header: Back Button + "Candidate Detail" (Cyan & h2) */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/recruiter/dashboard/candidates"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-warm-border-faint)] bg-white text-[var(--color-primary)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-teal-hover)] dark:bg-[var(--color-warm-surface)] dark:border-[var(--color-warm-border)] dark:text-[var(--color-primary)]"
              aria-label="Back to Candidates"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h2 className="text-2xl font-bold text-[var(--color-primary)] sm:text-3xl">
              Candidate Detail
            </h2>
          </div>
          <p className="ml-12 text-sm text-[var(--color-text-muted)]">
            View and manage candidate information
          </p>
        </div>

        {/* Main Card - Clean, borderless, adapts to dark mode */}
        <div className="rounded-2xl bg-white dark:bg-[var(--color-warm-bg-deep)] p-6 shadow-sm border-0">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-[var(--color-foreground)]">{fullName}</h3>
              <p className="text-sm text-[var(--color-text-muted)]">{candidate.user.email}</p>
              {job && (
                <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
                  {job.title}
                  {job.department ? ` · ${job.department}` : ''}
                </p>
              )}
              <p className="mt-0.5 text-xs text-[var(--color-text-faint)]">
                Applied {formatDate(candidate.applied_at)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <AIScoreBadge score={candidate.ai_score} />
              <CandidateStatusSelect candidateId={candidate.id} currentStatus={candidate.status} />
            </div>
          </div>

          {/* Divider using warm border variable */}
          <div className="my-6 border-t border-[var(--color-warm-border)] dark:border-[var(--color-warm-border)]" />

          {/* File cards using signed download URLs from the API */}
          <div className="flex flex-wrap justify-center gap-6">
            <FileCard
              label="Resume"
              downloadUrl={candidate.cv_download_url}
              fileName={candidate.cv_filename}
              fileType="cv"
            />
            <FileCard
              label="Video Introduction"
              downloadUrl={candidate.video_download_url}
              fileName={candidate.video_intro_url ? 'Video Introduction' : null}
              fileType="video"
            />
          </div>
        </div>
      </div>
    </main>
  );
}