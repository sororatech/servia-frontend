"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";
import { deleteJob } from "@/utils/deleteJob";
import { useProfile } from "@/hooks/useProfile";
import type { JobListItem } from "@/types/job";

const PAGE_SIZE = 20;

function formatDate(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

type Props = { initialJobs: JobListItem[]; error?: string | null };

export default function JobsGrid({ initialJobs, error = null }: Props) {
  const { profile } = useProfile();
  const isAdmin = profile?.isAdmin || false;
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "most_applications" | "title_az">("newest");
  const [page, setPage] = useState(1);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const deferredSearch = useDeferredValue(search);

  const departments = useMemo(
    () => Array.from(new Set(initialJobs.map((j) => j.department).filter(Boolean))).sort(),
    [initialJobs],
  );
  const employmentTypes = useMemo(
    () => Array.from(new Set(initialJobs.map((j) => j.employmentType).filter(Boolean))).sort(),
    [initialJobs],
  );

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    let result = initialJobs.filter((job) => {
      if (deletedIds.has(job.id)) return false;
      const matchesSearch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.department.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? job.isActive : !job.isActive);
      const matchesDept = !departmentFilter || job.department === departmentFilter;
      const matchesEmp = !employmentTypeFilter || job.employmentType === employmentTypeFilter;
      return matchesSearch && matchesStatus && matchesDept && matchesEmp;
    });

    switch (sortBy) {
      case "oldest":
        result = [...result].sort((a, b) => a.postedAt.localeCompare(b.postedAt));
        break;
      case "most_applications":
        result = [...result].sort((a, b) => b.candidateCount - a.candidateCount);
        break;
      case "title_az":
        result = [...result].sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        result = [...result].sort((a, b) => b.postedAt.localeCompare(a.postedAt));
    }

    return result;
  }, [initialJobs, deferredSearch, statusFilter, departmentFilter, employmentTypeFilter, sortBy, deletedIds]);

  const hasFilters =
    !!search || statusFilter !== "all" || !!departmentFilter || !!employmentTypeFilter;
  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = filtered.length > paginated.length;

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPage(1); }, [deferredSearch, statusFilter, departmentFilter, employmentTypeFilter, sortBy]);

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setDepartmentFilter("");
    setEmploymentTypeFilter("");
    setPage(1);
  }

  function handleDelete(jobId: string) {
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteJob(jobId);
      if (result.ok) {
        setDeletedIds((prev) => new Set([...prev, jobId]));
        setConfirmDeleteId(null);
      } else {
        setDeleteError(result.error ?? "Failed to delete job.");
        setConfirmDeleteId(null);
      }
    });
  }

  const selectClass =
    "rounded-[1.1rem] border border-[var(--color-warm-border-faint)] bg-[var(--color-input-bg-light)] px-4 py-3 text-sm text-[var(--color-text-darkest)] outline-none transition focus:border-[var(--color-primary)]";

  return (
    <main className="min-h-screen bg-page-gradient px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1400px]">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[var(--color-foreground)] sm:text-5xl">
              {isAdmin ? "All Job Postings" : "My Job Postings"}
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-[var(--color-text-muted)]">
              {isAdmin ? "View all job postings across all recruiters." : "Manage active job postings and track applications."}
            </p>
          </div>
          {!isAdmin && (
            <Link
              href="/recruiter/dashboard/jobs/create"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-teal-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-teal-dark)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-teal-hover)]"
            >
              + Create Job
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_160px_180px_200px_160px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, department, or location"
            className={selectClass}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className={selectClass}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className={selectClass}>
            <option value="">All departments</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={employmentTypeFilter} onChange={(e) => setEmploymentTypeFilter(e.target.value)} className={selectClass}>
            <option value="">All types</option>
            {employmentTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className={selectClass}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="most_applications">Most Applications</option>
            <option value="title_az">Title A–Z</option>
          </select>
        </div>

        {hasFilters && (
          <div className="mb-4">
            <button
              onClick={clearFilters}
              className="text-sm font-semibold text-[var(--color-teal-dark)] underline-offset-2 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* API error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-[var(--color-status-error-border)] bg-[var(--color-status-error-bg)] px-5 py-4 text-sm font-medium text-[var(--color-status-error-text)]">
            {error}
          </div>
        )}

        {/* Delete error */}
        {deleteError && (
          <div className="mb-6 rounded-2xl border border-[var(--color-status-error-border)] bg-[var(--color-status-error-bg)] px-5 py-4 text-sm font-medium text-[var(--color-status-error-text)] flex items-center justify-between">
            {deleteError}
            <button onClick={() => setDeleteError(null)} className="ml-4 text-[var(--color-status-error-text)]/60 hover:text-[var(--color-status-error-text)]">✕</button>
          </div>
        )}

        {/* Empty states */}
        {!error && filtered.length === 0 ? (
          hasFilters ? (
            <div className="rounded-[2rem] border border-black/10 bg-white/85 px-6 py-20 text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
              <p className="text-base font-semibold text-[var(--color-text-dark)]">No jobs match your filters</p>
              <p className="mt-1 text-sm text-[var(--color-text-faint)]">Try adjusting or clearing your filters</p>
              <button
                onClick={clearFilters}
                className="mt-5 rounded-full border border-[var(--color-teal-border)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--color-teal-dark)] hover:bg-[var(--color-teal-hover)]"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="rounded-[2rem] border border-black/10 bg-white/85 px-6 py-24 text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-teal-light)]">
                <svg className="h-10 w-10 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-[var(--color-text-dark)]">No job postings yet</p>
              <p className="mt-1 text-sm text-[var(--color-text-faint)]">Create your first job posting to start receiving applications</p>
              {!isAdmin && (
                <Link
                  href="/recruiter/dashboard/jobs/create"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]"
                >
                  + Create your first job
                </Link>
              )}
            </div>
          )
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {paginated.map((job) => (
                <article
                  key={job.id}
                  className="flex flex-col rounded-[2rem] border border-black/10 bg-white/85 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm"
                >
                  <h2 className="text-xl font-bold text-[var(--color-foreground)]">{job.title}</h2>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">{job.department}</p>
                  <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">{job.location}</p>
                  {isAdmin && job.postedByName && (
                    <p className="mt-1 text-xs text-[var(--color-text-faint)]">
                      Posted by: <span className="font-semibold">{job.postedByName}</span>
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-[var(--color-warm-border-light)] bg-[var(--color-warm-surface)] px-3 py-1 text-xs font-semibold text-[var(--color-text-subtle)]">
                      {job.employmentType}
                    </span>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        job.isActive
                          ? "border-[var(--color-status-active-border)] bg-[var(--color-status-active-bg)] text-[var(--color-status-active-text)]"
                          : "border-[var(--color-warm-border-light)] bg-[var(--color-warm-surface)] text-[var(--color-text-subtle)]"
                      }`}
                    >
                      {job.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {job.isActive ? (
                    <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl border border-[var(--color-warm-border)] bg-[var(--color-warm-bg)] px-4 py-3">
                      <div>
                        <p className="text-xs text-[var(--color-text-faint)]">Applied</p>
                        <p className="mt-1 text-2xl font-bold text-[var(--color-foreground)]">{job.candidateCount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--color-text-faint)]">Shortlisted</p>
                        <p className="mt-1 text-2xl font-bold text-[var(--color-foreground)]">{job.shortlistedCount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--color-text-faint)]">Openings</p>
                        <p className="mt-1 text-2xl font-bold text-[var(--color-foreground)]">
                          {job.openingsRemaining}
                          <span className="text-sm font-normal text-[var(--color-text-faint)]">/{job.openingsCount}</span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 grid grid-cols-2 gap-4 rounded-2xl border border-[var(--color-warm-border)] bg-[var(--color-warm-bg)] px-4 py-3">
                      <div>
                        <p className="text-xs text-[var(--color-text-faint)]">Total Applied</p>
                        <p className="mt-1 text-2xl font-bold text-[var(--color-foreground)]">{job.candidateCount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--color-text-faint)]">Hired</p>
                        <p className="mt-1 text-2xl font-bold text-[var(--color-status-active-text)]">
                          {job.openingsCount - job.openingsRemaining}
                          <span className="text-sm font-normal text-[var(--color-text-faint)]">/{job.openingsCount}</span>
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-5 flex items-center justify-between">
                    <p className="text-xs text-[var(--color-text-faint)]">Posted {formatDate(job.postedAt)}</p>
                    <div className="flex items-center gap-3">
                      {/* 👇 Hide Edit and Delete for admins, keep View */}
                      {!isAdmin && (
                        <Link
                          href={`/recruiter/dashboard/jobs/${job.id}/edit`}
                          className="text-sm font-semibold text-[var(--color-text-muted)] transition hover:text-[var(--color-teal-dark)]"
                        >
                          Edit
                        </Link>
                      )}
                      <Link
                        href={`/recruiter/dashboard/jobs/${job.id}`}
                        className="text-sm font-semibold text-[var(--color-teal-dark)] transition hover:underline"
                      >
                        View
                      </Link>
                      {!isAdmin && (
                        <button
                          onClick={() => setConfirmDeleteId(job.id)}
                          className="text-sm font-semibold text-[var(--color-status-error-text)]/60 transition hover:text-[var(--color-status-error-text)]"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-full border border-[var(--color-warm-border-faint)] bg-white px-8 py-3 text-sm font-semibold text-[var(--color-text-dark)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-teal-dark)]"
                >
                  Load More ({filtered.length - paginated.length} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
            <h3 className="text-lg font-bold text-[var(--color-foreground)]">Delete this job?</h3>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              This action cannot be undone. Existing applications linked to this job may also be affected.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                disabled={isPending}
                className="flex-1 rounded-full border border-[var(--color-warm-border-faint)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={isPending}
                className="flex-1 rounded-full bg-[var(--color-status-error-text)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-status-error-text)] disabled:opacity-60"
              >
                {isPending ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}