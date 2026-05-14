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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(38,185,200,0.12),_transparent_22%),linear-gradient(180deg,#fbfaf8_0%,#f3ece7_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/recruiter/dashboard/jobs"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#0c6c75] transition hover:underline"
        >
          ← Back to Jobs
        </Link>

        <div className="mt-6 rounded-[2rem] border border-black/10 bg-white/85 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">

          {/* Title + tags */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#171717]">{job.title}</h1>
              <p className="mt-1 text-base text-[#635b55]">{departmentLabel}</p>
              <p className="mt-0.5 text-base text-[#635b55]">{job.location}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-[#ddd7d3] bg-[#f4efeb] px-3 py-1 text-xs font-semibold text-[#7d746d]">
                {employmentTypeLabel}
              </span>
              <span className="rounded-full border border-[#ddd7d3] bg-[#f4efeb] px-3 py-1 text-xs font-semibold text-[#7d746d]">
                {shiftTypeLabel}
              </span>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  job.is_active
                    ? 'border-[#b8ead2] bg-[#ecfff4] text-[#0f7b43]'
                    : 'border-[#ddd7d3] bg-[#f4efeb] text-[#7d746d]'
                }`}
              >
                {job.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-[#ece4de] bg-[#fbf7f4] px-5 py-4 sm:grid-cols-4">
            {[
              { label: 'Candidates', value: job.candidate_count },
              { label: 'Shortlisted', value: job.shortlisted_count },
              { label: 'Posted', value: postedAt },
              { label: 'Days Since Posted', value: daysSince(job.created_at) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-[#9a9088]">{label}</p>
                <p className="mt-1 text-lg font-bold text-[#171717]">{value}</p>
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
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#4a4440]">
                {job.description}
              </p>
            </CollapsibleSection>

            {/* Responsibilities */}
            {job.responsibilities && (
              <CollapsibleSection title="Responsibilities">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#4a4440]">
                  {job.responsibilities}
                </p>
              </CollapsibleSection>
            )}

            {/* Requirements */}
            <CollapsibleSection title="Requirements">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#4a4440]">
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
                      className="rounded-full border border-[#cfecef] bg-[#e8f8fa] px-3 py-1 text-xs font-semibold text-[#0c6c75]"
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
                  <dt className="text-xs text-[#9a9088]">Department</dt>
                  <dd className="mt-0.5 font-semibold text-[#3a3330]">{departmentLabel}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#9a9088]">Employment Type</dt>
                  <dd className="mt-0.5 font-semibold text-[#3a3330]">{employmentTypeLabel}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#9a9088]">Shift Type</dt>
                  <dd className="mt-0.5 font-semibold text-[#3a3330]">{shiftTypeLabel}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#9a9088]">Location</dt>
                  <dd className="mt-0.5 font-semibold text-[#3a3330]">{job.location}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#9a9088]">Last Updated</dt>
                  <dd className="mt-0.5 font-semibold text-[#3a3330]">{updatedAt}</dd>
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
                      className="flex items-center justify-between rounded-xl border border-[#ece4de] bg-[#fbf7f4] px-4 py-3 transition hover:border-[#26b9c8] hover:bg-[#f0fdff]"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#3a3330]">{candidateName(c)}</p>
                        <p className="text-xs text-[#9a9088]">
                          Applied {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(c.applied_at))}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <AIScoreBadge score={c.ai_score} />
                        <span className="rounded-full border border-[#ddd5cf] bg-white px-3 py-1 text-xs font-semibold text-[#635b55]">
                          {humanizeStatus(c.status)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-4">
                  <Link
                    href={`/recruiter/dashboard/candidates?job=${job.id}`}
                    className="text-sm font-semibold text-[#0c6c75] hover:underline"
                  >
                    View all {job.candidate_count} application{job.candidate_count !== 1 ? 's' : ''} →
                  </Link>
                </div>
              </CollapsibleSection>
            )}

            {recentCandidates.length === 0 && (
              <div className="border-t border-[#ece4de] pt-6">
                <Link
                  href={`/recruiter/dashboard/candidates?job=${job.id}`}
                  className="rounded-full border border-[#26b9c8] bg-white px-5 py-3 text-sm font-semibold text-[#0c6c75] transition hover:bg-[#f0fdff]"
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
