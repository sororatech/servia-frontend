import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getRecruiterHeaders } from '@/utils/serverFetch';
import { loadJobDetail } from '@/hooks/useJobDetailData';

export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const headers = await getRecruiterHeaders();
  if (!headers) redirect('/login');

  const { job, departmentLabel, employmentTypeLabel, shiftTypeLabel, postedAt, updatedAt } =
    await loadJobDetail(id, headers);

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
              { label: 'Updated', value: updatedAt },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-[#9a9088]">{label}</p>
                <p className="mt-1 text-lg font-bold text-[#171717]">{value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <section className="mt-8">
            <h2 className="text-lg font-semibold text-[#171717]">Description</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#4a4440]">
              {job.description}
            </p>
          </section>

          {/* Requirements */}
          <section className="mt-8">
            <h2 className="text-lg font-semibold text-[#171717]">Requirements</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#4a4440]">
              {job.requirements}
            </p>
          </section>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/recruiter/dashboard/candidates?job=${job.id}`}
              className="rounded-full border border-[#26b9c8] bg-white px-5 py-3 text-sm font-semibold text-[#0c6c75] transition hover:bg-[#f0fdff]"
            >
              View Candidates
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
