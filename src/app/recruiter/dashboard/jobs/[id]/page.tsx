import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getRecruiterHeaders } from '@/lib/serverAuth';          
import { fetchJson } from '@/utils/serverFetch';
import { loadJobDetail } from '@/hooks/useJobDetailData';
import CollapsibleSection from '@/components/recruiter/CollapsibleSection';
import JobDetailActions from '@/components/recruiter/JobDetailActions';
import AIScoreBadge from '@/components/recruiter/AIScoreBadge';
import { Button } from '@/components/ui/Button';                 
import type { BackendCandidate } from '@/types/candidate';

function daysSince(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

function candidateName(c: BackendCandidate): string {
  return `${c.user.first_name} ${c.user.last_name}`.trim() || c.user.email;
}

function humanizeStatus(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const headers = await getRecruiterHeaders();
  if (!headers) redirect('/login');

  const { job, departmentLabel, employmentTypeLabel, shiftTypeLabel, postedAt, updatedAt } =
    await loadJobDetail(id, headers);

  let recentCandidates: BackendCandidate[] = [];
  try {
    const res = await fetchJson<{ results?: BackendCandidate[] } | BackendCandidate[]>(
      `/candidates/candidates/?job=${id}&ordering=-applied_at`,
      headers,
    );
    const list = Array.isArray(res) ? res : (res.results ?? []);
    recentCandidates = list.slice(0, 5);
  } catch {
    // optional section
  }

  return (
    <main className="min-h-screen bg-page-gradient px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        
        {/* Header: Back Button + "View Job" + Job Title underneath */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/recruiter/dashboard/jobs"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-warm-border-faint)] bg-white text-[var(--color-teal-dark)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-teal-hover)] dark:bg-[var(--color-warm-surface)] dark:border-[var(--color-warm-border)] dark:text-[var(--color-foreground)]"
              aria-label="Back to Jobs"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-[var(--color-foreground)] sm:text-3xl">
              View Job
            </h1>
          </div>
          {/* ml-12 (48px) perfectly aligns this with the start of the "View Job" text */}
          <h2 className="text-xl sm:text-2xl font-semibold text-[var(--color-primary)] ml-12">
            {job.title}
          </h2>
        </div>

        {/* Main Card */}
        <div className="rounded-[2rem] border border-black/10 bg-white/85 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:bg-[var(--color-warm-surface)] dark:border-[var(--color-warm-border)]">
          
          {/* Tags & Status (Simplified since title is now in header) */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-base font-semibold text-[var(--color-text-dark)] dark:text-[var(--color-foreground)]">
                {departmentLabel}
              </p>
              <p className="mt-1 text-base text-[var(--color-text-muted)] flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-[var(--color-warm-border-light)] bg-[var(--color-warm-surface)] px-3 py-1 text-xs font-semibold text-[var(--color-text-subtle)] dark:bg-[var(--color-warm-bg-deep)] dark:border-[var(--color-warm-border)]">
                {employmentTypeLabel}
              </span>
              <span className="rounded-full border border-[var(--color-warm-border-light)] bg-[var(--color-warm-surface)] px-3 py-1 text-xs font-semibold text-[var(--color-text-subtle)] dark:bg-[var(--color-warm-bg-deep)] dark:border-[var(--color-warm-border)]">
                {shiftTypeLabel}
              </span>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  job.is_active
                    ? 'border-[var(--color-status-active-border)] bg-[var(--color-status-active-bg)] text-[var(--color-status-active-text)]'
                    : 'border-[var(--color-warm-border-light)] bg-[var(--color-warm-surface)] text-[var(--color-text-subtle)] dark:bg-[var(--color-warm-bg-deep)] dark:border-[var(--color-warm-border)]'
                }`}
              >
                {job.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 gap-6 rounded-2xl border border-[var(--color-warm-border)] bg-[var(--color-warm-bg)] px-5 py-4 sm:grid-cols-4 dark:bg-[var(--color-warm-bg-deep)] dark:border-[var(--color-warm-border)]">
            {[
              { label: 'Candidates', value: job.candidate_count },
              { label: 'Shortlisted', value: job.shortlisted_count },
              { label: 'Posted', value: postedAt },
              { label: 'Days Since Posted', value: daysSince(job.created_at) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs font-semibold text-[var(--color-primary)]">{label}</p>
                <p className="mt-1 text-lg font-bold text-[var(--color-foreground)]">{value}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-8">
            <JobDetailActions jobId={job.id} />
          </div>

          {/* Divider */}
          <hr className="mt-10 mb-8 border-[var(--color-warm-border)] dark:border-[var(--color-warm-border)]" />

          <div className="flex flex-col gap-10">
            {/* Description */}
            <CollapsibleSection title="Description" defaultOpen={true}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-body)] dark:text-[var(--color-text-dark)]">
                {job.description}
              </p>
            </CollapsibleSection>

            {/* Responsibilities */}
            {job.responsibilities && (
              <CollapsibleSection title="Responsibilities" defaultOpen={true}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-body)] dark:text-[var(--color-text-dark)]">
                  {job.responsibilities}
                </p>
              </CollapsibleSection>
            )}

            {/* Requirements */}
            <CollapsibleSection title="Requirements" defaultOpen={true}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-body)] dark:text-[var(--color-text-dark)]">
                {job.requirements}
              </p>
            </CollapsibleSection>

            {/* Core Skills */}
            {job.core_skills.length > 0 && (
              <CollapsibleSection title="Required Skills" defaultOpen={true}>
                <div className="flex flex-wrap gap-2">
                  {job.core_skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-[var(--color-teal-border)] bg-[var(--color-teal-light)] px-3 py-1 text-xs font-semibold text-[var(--color-teal-dark)] dark:bg-[var(--color-teal-light)] dark:border-[var(--color-teal-border)] dark:text-[var(--color-teal-dark)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Role Details */}
            <CollapsibleSection title="Role Details" defaultOpen={false}>
              <dl className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-xs font-semibold text-[var(--color-text-faint)]">Department</dt>
                  <dd className="mt-1 font-semibold text-[var(--color-text-dark)] dark:text-[var(--color-foreground)]">{departmentLabel}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-[var(--color-text-faint)]">Employment Type</dt>
                  <dd className="mt-1 font-semibold text-[var(--color-text-dark)] dark:text-[var(--color-foreground)]">{employmentTypeLabel}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-[var(--color-text-faint)]">Shift Type</dt>
                  <dd className="mt-1 font-semibold text-[var(--color-text-dark)] dark:text-[var(--color-foreground)]">{shiftTypeLabel}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-[var(--color-text-faint)]">Location</dt>
                  <dd className="mt-1 font-semibold text-[var(--color-text-dark)] dark:text-[var(--color-foreground)]">{job.location}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-[var(--color-text-faint)]">Last Updated</dt>
                  <dd className="mt-1 font-semibold text-[var(--color-text-dark)] dark:text-[var(--color-foreground)]">{updatedAt}</dd>
                </div>
              </dl>
            </CollapsibleSection>

            {/* Recent Applications */}
            {recentCandidates.length > 0 && (
              <CollapsibleSection title="Recent Applications" defaultOpen={true}>
                <div className="flex flex-col gap-3">
                  {recentCandidates.map((c) => (
                    <Link
                      key={c.id}
                      href={`/recruiter/dashboard/candidates/${c.id}`}
                      className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-[var(--color-warm-border)] bg-[var(--color-warm-bg)] px-4 py-3 transition hover:border-[var(--color-primary)] hover:bg-[var(--color-teal-hover)] dark:bg-[var(--color-warm-bg-deep)] dark:border-[var(--color-warm-border)] dark:hover:bg-[var(--color-warm-surface)]"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-text-dark)] dark:text-[var(--color-foreground)]">{candidateName(c)}</p>
                        <p className="text-xs text-[var(--color-text-faint)]">
                          Applied {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(c.applied_at))}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-2 sm:mt-0">
                        <AIScoreBadge score={c.ai_score} />
                        <span className="rounded-full border border-[var(--color-warm-border-faint)] bg-white px-3 py-1 text-xs font-semibold text-[var(--color-text-muted)] dark:bg-[var(--color-warm-surface)] dark:border-[var(--color-warm-border)]">
                          {humanizeStatus(c.status)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-6">
                  <Link 
                    href={`/recruiter/dashboard/candidates?job=${job.id}`}
                    className="inline-flex items-center justify-center rounded-full border border-[var(--color-warm-border-faint)] bg-white px-6 py-3 text-sm font-semibold text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-teal-dark)] dark:bg-[var(--color-warm-surface)] dark:border-[var(--color-warm-border)] dark:text-[var(--color-foreground)]"
                  >
                    View all {job.candidate_count} application{job.candidate_count !== 1 ? 's' : ''} →
                  </Link>
                </div>
              </CollapsibleSection>
            )}

            {recentCandidates.length === 0 && (
              <div className="mt-10 pt-8 border-t border-[var(--color-warm-border)] dark:border-[var(--color-warm-border)]">
                <Link 
                  href={`/recruiter/dashboard/candidates?job=${job.id}`}
                  className="inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
                >
                  View Candidates
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}