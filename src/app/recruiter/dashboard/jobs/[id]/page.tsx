import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getRecruiterHeaders, fetchJson } from '@/utils/serverFetch';
import { loadJobDetail } from '@/hooks/useJobDetailData';
import CollapsibleSection from '@/components/recruiter/CollapsibleSection';
import JobDetailActions from '@/components/recruiter/JobDetailActions';
import AIScoreBadge from '@/components/recruiter/AIScoreBadge';
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
    <main className="bg-page-gradient min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/recruiter/dashboard/jobs"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-teal-dark)] transition hover:underline"
        >
          ← Back to Jobs
        </Link>

        <div className="mt-6 rounded-[2rem] border border-black/10 bg-white/85 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">

          {/* Title + tags */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-foreground)]">{job.title}</h1>
              <p className="mt-1 text-base text-[var(--color-text-muted)]">{departmentLabel}</p>
              <p className="mt-0.5 text-base text-[var(--color-text-muted)]">{job.location}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-[var(--color-warm-border-light)] bg-[var(--color-warm-surface)] px-3 py-1 text-xs font-semibold text-[var(--color-text-subtle)]">
                {employmentTypeLabel}
              </span>
              <span className="rounded-full border border-[var(--color-warm-border-light)] bg-[var(--color-warm-surface)] px-3 py-1 text-xs font-semibold text-[var(--color-text-subtle)]">
                {shiftTypeLabel}
              </span>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  job.is_active
                    ? 'border-[var(--color-status-active-border)] bg-[var(--color-status-active-bg)] text-[var(--color-status-active-text)]'
                    : 'border-[var(--color-warm-border-light)] bg-[var(--color-warm-surface)] text-[var(--color-text-subtle)]'
                }`}
              >
                {job.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-[var(--color-warm-border)] bg-[var(--color-warm-bg)] px-5 py-4 sm:grid-cols-4">
            {[
              { label: 'Candidates', value: job.candidate_count },
              { label: 'Shortlisted', value: job.shortlisted_count },
              { label: 'Posted', value: postedAt },
              { label: 'Days Since Posted', value: daysSince(job.created_at) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-[var(--color-text-faint)]">{label}</p>
                <p className="mt-1 text-lg font-bold text-[var(--color-foreground)]">{value}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-6">
            <JobDetailActions jobId={job.id} />
          </div>

          <div className="mt-8 flex flex-col gap-6">
            {/* Description */}
            <CollapsibleSection title="Description">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-body)]">
                {job.description}
              </p>
            </CollapsibleSection>

            {/* Responsibilities */}
            {job.responsibilities && (
              <CollapsibleSection title="Responsibilities">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-body)]">
                  {job.responsibilities}
                </p>
              </CollapsibleSection>
            )}

            {/* Requirements */}
            <CollapsibleSection title="Requirements">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-body)]">
                {job.requirements}
              </p>
            </CollapsibleSection>

            {/* Core Skills */}
            {job.core_skills.length > 0 && (
              <CollapsibleSection title="Required Skills">
                <div className="flex flex-wrap gap-2">
                  {job.core_skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-[var(--color-teal-border)] bg-[var(--color-teal-light)] px-3 py-1 text-xs font-semibold text-[var(--color-teal-dark)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Role Details */}
            <CollapsibleSection title="Role Details" defaultOpen={false}>
              <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-xs text-[var(--color-text-faint)]">Department</dt>
                  <dd className="mt-0.5 font-semibold text-[var(--color-text-dark)]">{departmentLabel}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--color-text-faint)]">Employment Type</dt>
                  <dd className="mt-0.5 font-semibold text-[var(--color-text-dark)]">{employmentTypeLabel}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--color-text-faint)]">Shift Type</dt>
                  <dd className="mt-0.5 font-semibold text-[var(--color-text-dark)]">{shiftTypeLabel}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--color-text-faint)]">Location</dt>
                  <dd className="mt-0.5 font-semibold text-[var(--color-text-dark)]">{job.location}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--color-text-faint)]">Last Updated</dt>
                  <dd className="mt-0.5 font-semibold text-[var(--color-text-dark)]">{updatedAt}</dd>
                </div>
              </dl>
            </CollapsibleSection>

            {/* Recent Applications */}
            {recentCandidates.length > 0 && (
              <CollapsibleSection title="Recent Applications">
                <div className="flex flex-col gap-3">
                  {recentCandidates.map((c) => (
                    <Link
                      key={c.id}
                      href={`/recruiter/dashboard/candidates/${c.id}`}
                      className="flex items-center justify-between rounded-xl border border-[var(--color-warm-border)] bg-[var(--color-warm-bg)] px-4 py-3 transition hover:border-[var(--color-primary)] hover:bg-[var(--color-teal-hover)]"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-text-dark)]">{candidateName(c)}</p>
                        <p className="text-xs text-[var(--color-text-faint)]">
                          Applied {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(c.applied_at))}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <AIScoreBadge score={c.ai_score} />
                        <span className="rounded-full border border-[var(--color-warm-border-faint)] bg-white px-3 py-1 text-xs font-semibold text-[var(--color-text-muted)]">
                          {humanizeStatus(c.status)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-4">
                  <Link
                    href={`/recruiter/dashboard/candidates?job=${job.id}`}
                    className="text-sm font-semibold text-[var(--color-teal-dark)] hover:underline"
                  >
                    View all {job.candidate_count} application{job.candidate_count !== 1 ? 's' : ''} →
                  </Link>
                </div>
              </CollapsibleSection>
            )}

            {recentCandidates.length === 0 && (
              <div className="border-t border-[var(--color-warm-border)] pt-6">
                <Link
                  href={`/recruiter/dashboard/candidates?job=${job.id}`}
                  className="rounded-full border border-[var(--color-primary)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-teal-dark)] transition hover:bg-[var(--color-teal-hover)]"
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
