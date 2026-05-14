"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import type { JobListItem } from "@/types/candidate";

function formatDate(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

type JobsGridProps = {
  initialJobs: JobListItem[];
  error?: string | null;
};

export default function JobsGrid({ initialJobs, error = null }: JobsGridProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return initialJobs.filter((job) => {
      const matchesSearch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.department.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? job.isActive : !job.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [initialJobs, deferredSearch, statusFilter]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(38,185,200,0.12),_transparent_22%),linear-gradient(180deg,#fbfaf8_0%,#f3ece7_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
       
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#171717] sm:text-5xl">
              Open Requisitions
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-[#635b55]">
              Manage active job postings and tracking.
            </p>
          </div>

          <Link
            href="/recruiter/dashboard/jobs/create"
            className="inline-flex items-center gap-2 rounded-full border border-[#cfecef] bg-white px-5 py-3 text-sm font-semibold text-[#0c6c75] transition hover:border-[#26b9c8] hover:bg-[#f0fdff]"
          >
            + Create Job
          </Link>
        </div>

        
        <div className="mb-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-[#5c5550]">Search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, department, or location"
              className="rounded-[1.1rem] border border-[#ddd5cf] bg-[#fcfbfa] px-4 py-3 text-sm text-[#201d1b] outline-none transition focus:border-[#26b9c8]"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-[#5c5550]">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
              className="rounded-[1.1rem] border border-[#ddd5cf] bg-[#fcfbfa] px-4 py-3 text-sm text-[#201d1b] outline-none transition focus:border-[#26b9c8]"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

       
        {error && (
          <div className="mb-6 rounded-2xl border border-[#efc7bf] bg-[#fff0ec] px-5 py-4 text-sm font-medium text-[#b13d2f]">
            {error}
          </div>
        )}

       
        {!error && filtered.length === 0 ? (
          <div className="rounded-[2rem] border border-black/10 bg-white/85 px-6 py-20 text-center text-sm text-[#766f69] shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            No jobs match the current filters.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((job) => (
              <article
                key={job.id}
                className="flex flex-col rounded-[2rem] border border-black/10 bg-white/85 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm"
              >
               
                <h2 className="text-xl font-bold text-[#171717]">{job.title}</h2>
                <p className="mt-1 text-sm text-[#635b55]">{job.department}</p>
                <p className="mt-0.5 text-sm text-[#635b55]">{job.location}</p>

             
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#ddd7d3] bg-[#f4efeb] px-3 py-1 text-xs font-semibold text-[#7d746d]">
                    {job.employmentType}
                  </span>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      job.isActive
                        ? "border-[#b8ead2] bg-[#ecfff4] text-[#0f7b43]"
                        : "border-[#ddd7d3] bg-[#f4efeb] text-[#7d746d]"
                    }`}
                  >
                    {job.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

              
                <div className="mt-5 grid grid-cols-2 gap-4 rounded-2xl border border-[#ece4de] bg-[#fbf7f4] px-4 py-3">
                  <div>
                    <p className="text-xs text-[#9a9088]">Candidates</p>
                    <p className="mt-1 text-2xl font-bold text-[#171717]">{job.candidateCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#9a9088]">Shortlisted</p>
                    <p className="mt-1 text-2xl font-bold text-[#171717]">{job.shortlistedCount}</p>
                  </div>
                </div>

               
                <div className="mt-5 flex items-center justify-between">
                  <p className="text-xs text-[#9a9088]">Posted {formatDate(job.postedAt)}</p>
                  <Link
                    href={`/recruiter/dashboard/jobs/${job.id}`}
                    className="text-sm font-semibold text-[#0c6c75] transition hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
