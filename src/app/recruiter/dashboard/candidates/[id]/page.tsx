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
    <main className="p-4 md:p-8">
      <div className="mb-6">
        <Link href="/recruiter/dashboard/candidates" className="mb-1 inline-flex items-center gap-2 text-[var(--color-secondary)] hover:opacity-70">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-2xl font-heading font-bold">Candidates Detail</span>
        </Link>
        <p className="ml-7 text-sm text-[var(--color-foreground)]/60">View and Edit candidates details</p>
      </div>

      <div className="rounded-2xl bg-[var(--color-warm-bg-deep)] p-6">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-secondary)]">{fullName}</h2>
              <p className="text-sm text-[var(--color-foreground)]/60">{candidate.user.email}</p>
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
              <CandidateStatusSelect candidateId={candidate.id} currentStatus={candidate.status} />
            </div>
          </div>

          <div className="my-6 border-t border-[var(--color-foreground)]/8" />

          {/* File cards using signed download URLs from the API */}
          <div className="flex flex-wrap justify-center gap-6">
            <FileCard
              label="Resume"
              downloadUrl={candidate.cv_download_url}   // use signed download URL
              fileName={candidate.cv_filename}
              fileType="cv"
            />
            <FileCard
              label="Video Introduction"
              downloadUrl={candidate.video_download_url} // video signed URL
              fileName={candidate.video_intro_url ? 'Video Introduction' : null}
              fileType="video"
            />
          </div>
        </div>
      </div>
    </main>
  );
}