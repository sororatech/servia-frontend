import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getRecruiterHeaders } from '@/lib/serverAuth';
import { fetchJson, fetchAllPages } from '@/utils/serverFetch';
import { Button } from '@/components/ui/Button';
import type { InterviewRecord, CandidateRecord, JobRecord, AIReportDetail } from '@/types/interview';

type Props = { params: Promise<{ id: string }> };

function getInitials(name: string) {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts.at(-1)![0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function ScoreBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-neutral-light)]">
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
    <main className="min-h-screen bg-page-gradient px-4 py-8 sm:px-6 lg:px-25">
      <div className="mx-auto max-w-8xl">

        <div className="mb-6">
          <Link href="/recruiter/dashboard/interviews">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Interviews
            </Button>
          </Link>
        </div>

        <div className="mb-8 rounded-2xl border border-[var(--color-warm-border)] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[var(--color-secondary)]">{fullName}</h1>
              {job && (
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  Position: <span className="font-medium text-[var(--color-foreground)]">{job.title}</span>
                </p>
              )}
              <div className="mt-4">
                {report ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-medium text-[var(--color-foreground)]">
                        AI Interview Score:
                      </span>
                      <span className="text-2xl font-bold text-[var(--color-primary)]">
                        {report.fit_score}%
                      </span>
                    </div>
                    <div className="mt-2 max-w-md">
                      <ScoreBar value={report.fit_score} />
                    </div>
                  </>
                ) : (
                  <p className="text-sm italic text-[var(--color-text-subtle)]">
                    No AI report available yet for this interview.
                  </p>
                )}
              </div>
            </div>
            {/* Avatar */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-xl font-bold text-[var(--color-primary)]">
              {getInitials(fullName)}
            </div>
          </div>
        </div>

        {report && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: AI Summary */}
            <div className="rounded-2xl border border-[var(--color-warm-border)] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[var(--color-secondary)]">AI Summary</h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-body)]">
                {report.summary}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <RecommendationBadge value={report.recommendation} />
                {report.confidence && (
                  <span className="rounded-full border border-[var(--color-warm-border-deep)] bg-[var(--color-warm-surface)] px-3 py-1 text-xs font-medium text-[var(--color-text-muted)]">
                    Confidence: {report.confidence.charAt(0).toUpperCase() + report.confidence.slice(1)}
                  </span>
                )}
              </div>
              {report.extracted_skills.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-faint)]">
                    Skills Demonstrated
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {report.extracted_skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-[var(--color-teal-light)] px-3 py-1 text-xs font-medium text-[var(--color-primary)]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: AI Feedback */}
            <div className="rounded-2xl border border-[var(--color-warm-border)] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[var(--color-secondary)]">AI Feedback</h2>

              <div className="mt-4">
                <p className="text-sm font-semibold text-[var(--color-foreground)]">Strengths</p>
                {report.strengths.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {report.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-body)]">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                        {s}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-sm italic text-[var(--color-text-subtle)]">None recorded.</p>
                )}
              </div>

              <div className="mt-5">
                <p className="text-sm font-semibold text-[var(--color-foreground)]">Weaknesses</p>
                {report.weaknesses.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {report.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-body)]">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-status-error-text)]" />
                        {w}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-sm italic text-[var(--color-text-subtle)]">None recorded.</p>
                )}
              </div>

              {report.feedback && (
                <div className="mt-5 rounded-xl bg-[var(--color-warm-bg-deep)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-faint)]">
                    Feedback for Candidate
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-body)]">
                    {report.feedback}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}