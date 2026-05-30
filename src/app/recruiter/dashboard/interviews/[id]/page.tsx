import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getRecruiterHeaders, fetchJson, fetchAllPages } from '@/utils/serverFetch';
import type { InterviewRecord, CandidateRecord, JobRecord, AIReportDetail } from '@/types/interview';

type Props = { params: Promise<{ id: string }> };

function getInitials(name: string) {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts.at(-1)![0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function ScoreBar({ value }: { value: number }) {
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--color-neutral-light)]">
      <div
        className="h-full rounded-full bg-[var(--color-primary)] transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function RecommendationBadge({ value }: { value: 'hire' | 'hold' | 'reject' | null }) {
  if (!value) return null;
  const styles = {
    hire: 'bg-[var(--color-status-active-bg)] text-[var(--color-status-active-text)] border-[var(--color-status-active-border)]',
    hold: 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-text)] border-[var(--color-status-warning-border)]',
    reject: 'bg-[var(--color-status-error-bg)] text-[var(--color-status-error-text)] border-[var(--color-status-error-border)]',
  };
  const labels = { hire: 'Hire', hold: 'On Hold', reject: 'Reject' };
  return (
    <span className={`inline-flex rounded-full border px-3 py-0.5 text-xs font-semibold ${styles[value]}`}>
      {labels[value]}
    </span>
  );
}

export default async function InterviewResultPage({ params }: Props) {
  const { id } = await params;
  const headers = await getRecruiterHeaders();
  if (!headers) notFound();

  let interview: InterviewRecord;
  try {
    interview = await fetchJson<InterviewRecord>(`/interviews/interviews/${id}/`, headers);
  } catch {
    notFound();
  }

  const [candidate, job, allReports] = await Promise.all([
    fetchJson<CandidateRecord>(`/candidates/candidates/${interview.candidate}/`, headers).catch(() => null),
    fetchJson<JobRecord>(`/jobs/jobs/${interview.job}/`, headers).catch(() => null),
    fetchAllPages<AIReportDetail>('/ai-reports/reports/', headers).catch(() => [] as AIReportDetail[]),
  ]);

  const report = allReports.find(
    (r) => r.interview === id && r.report_type === 'interview_analysis',
  ) ?? null;

  const fullName =
    candidate
      ? `${candidate.user.first_name} ${candidate.user.last_name}`.trim() || candidate.user.email
      : 'Unknown Candidate';

  return (
    <main className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/recruiter/dashboard/interviews"
          className="inline-flex items-center gap-2 text-[var(--color-secondary)] hover:opacity-70"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-2xl font-heading font-bold">Interview Result</span>
        </Link>
      </div>

      {/* Top card */}
      <div className="mb-6 rounded-xl border border-[var(--color-warm-surface-dim)] bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[var(--color-secondary)]">{fullName}</h2>
            {job && (
              <p className="mt-1 text-sm text-[var(--color-foreground)]/60">
                Position: {job.title}
              </p>
            )}

            {report ? (
              <>
                <p className="mt-4 text-base font-medium text-[var(--color-foreground)]">
                  AI Interview Score:{' '}
                  <span className="font-bold text-[var(--color-primary)]">
                    {report.fit_score}/100
                  </span>
                </p>
                <div className="mt-2 max-w-sm">
                  <ScoreBar value={report.fit_score} />
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm text-[var(--color-foreground)]/50 italic">
                No AI report available yet for this interview.
              </p>
            )}
          </div>

          {/* Avatar */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--color-neutral-mid)] text-lg font-bold text-white">
            {getInitials(fullName)}
          </div>
        </div>
      </div>

      {report && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left card — AI Summary */}
          <div className="rounded-xl border border-[var(--color-warm-surface-dim)] bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-[var(--color-secondary)]">AI Summary</h3>

            <p className="mb-5 text-sm leading-relaxed text-[var(--color-foreground)]/70">
              {report.summary}
            </p>

            <div className="mb-5 flex flex-wrap items-center gap-2">
              <RecommendationBadge value={report.recommendation} />
              {report.confidence && (
                <span className="rounded-full border border-[var(--color-warm-border-deep)] bg-[var(--color-warm-surface)] px-3 py-0.5 text-xs font-medium text-[var(--color-foreground)]/60">
                  Confidence: {report.confidence.charAt(0).toUpperCase() + report.confidence.slice(1)}
                </span>
              )}
            </div>

            {report.extracted_skills.length > 0 && (
              <>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-foreground)]/40">
                  Skills Demonstrated
                </p>
                <div className="flex flex-wrap gap-2">
                  {report.extracted_skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-[var(--color-teal-light)] px-3 py-1 text-xs font-medium text-[var(--color-primary)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right card — AI Feedback */}
          <div className="rounded-xl border border-[var(--color-warm-surface-dim)] bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-[var(--color-secondary)]">AI Feedback</h3>

            <div className="mb-5">
              <p className="mb-2 text-sm font-semibold text-[var(--color-foreground)]/70">
                Strengths
              </p>
              {report.strengths.length > 0 ? (
                <ul className="space-y-1.5">
                  {report.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-foreground)]/70">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                      {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm italic text-[var(--color-foreground)]/40">None recorded.</p>
              )}
            </div>

            <div className="mb-5">
              <p className="mb-2 text-sm font-semibold text-[var(--color-foreground)]/70">
                Weaknesses
              </p>
              {report.weaknesses.length > 0 ? (
                <ul className="space-y-1.5">
                  {report.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-foreground)]/70">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-status-error-text)]" />
                      {w}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm italic text-[var(--color-foreground)]/40">None recorded.</p>
              )}
            </div>

            {report.feedback && (
              <div className="rounded-lg bg-[var(--color-warm-bg-deep)] p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-foreground)]/40">
                  Feedback for Candidate
                </p>
                <p className="text-sm leading-relaxed text-[var(--color-foreground)]/70">
                  {report.feedback}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
