import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Video, Download } from 'lucide-react';
import { getRecruiterHeaders, fetchJson } from '@/utils/serverFetch';
import AIScoreBadge from '@/components/recruiter/AIScoreBadge';
import CandidateStatusSelect from '@/components/recruiter/CandidateStatusSelect';
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
    candidate = await fetchJson<BackendCandidateDetail>(
      `/candidates/candidates/${id}/`,
      headers,
    );
  } catch {
    notFound();
  }

  try {
    job = await fetchJson<BackendJobSummary>(`/jobs/jobs/${candidate.job}/`, headers);
  } catch {
    // job info is optional
  }

  const fullName =
    `${candidate.user.first_name} ${candidate.user.last_name}`.trim() ||
    candidate.user.email;

  return (
    <main className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/recruiter/dashboard/candidates"
          className="mb-1 inline-flex items-center gap-2 text-[var(--color-secondary)] hover:opacity-70"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-2xl font-heading font-bold">Candidates Detail</span>
        </Link>
        <p className="ml-7 text-sm text-[var(--color-foreground)]/60">
          View and Edit candidates details
        </p>
      </div>

      {/* Outer card */}
      <div className="rounded-2xl bg-[var(--color-warm-bg-deep)] p-6">
        {/* Inner card */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          {/* Top row: candidate info + badges */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-secondary)]">
                {fullName}
              </h2>
              <p className="text-sm text-[var(--color-foreground)]/60">
                {candidate.user.email}
              </p>
              {job && (
                <p className="mt-0.5 text-sm text-[var(--color-foreground)]/60">
                  {job.title}
                  {job.department ? ` · ${job.department}` : ''}
                </p>
              )}
              <p className="mt-0.5 text-xs text-[var(--color-foreground)]/40">
                Applied {formatDate(candidate.applied_at)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <AIScoreBadge score={candidate.ai_score} />
              <CandidateStatusSelect
                candidateId={candidate.id}
                currentStatus={candidate.status}
              />
            </div>
          </div>

          <div className="my-6 border-t border-[var(--color-foreground)]/8" />

          {/* File buttons */}
          <div className="flex flex-wrap justify-center gap-6">
            <FileButton
              label="Resume"
              icon={<FileText className="h-10 w-10 text-[var(--color-foreground)]/50" />}
              url={candidate.cv_file}
              filename={candidate.cv_filename ?? `${fullName}_cv`}
            />
            <FileButton
              label="Video Introduction"
              icon={<Video className="h-10 w-10 text-[var(--color-foreground)]/50" />}
              url={candidate.video_intro_url}
              filename={`${fullName}_video`}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function FileButton({
  label,
  icon,
  url,
  filename,
}: {
  label: string;
  icon: React.ReactNode;
  url: string | null | undefined;
  filename: string;
}) {
  const base =
    'relative flex h-28 w-full sm:h-36 sm:w-44 flex-col items-center justify-center rounded-xl transition-opacity';

  if (!url) {
    return (
      <div
        className={`${base} cursor-not-allowed bg-[var(--color-neutral-disabled)] opacity-50`}
        title="Not uploaded"
      >
        {icon}
        <span className="mt-2 text-xs text-[var(--color-foreground)]/50">{label}</span>
        <span className="absolute bottom-3 right-3 text-[var(--color-foreground)]/30">
          <Download className="h-4 w-4" />
        </span>
      </div>
    );
  }

  return (
    <a
      href={url}
      download={filename}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} bg-[var(--color-neutral-disabled)] hover:opacity-80`}
      title={`Download ${label}`}
    >
      {icon}
      <span className="mt-2 text-xs text-[var(--color-foreground)]/60">{label}</span>
      <span className="absolute bottom-3 right-3 text-[var(--color-foreground)]/50">
        <Download className="h-4 w-4" />
      </span>
    </a>
  );
}
