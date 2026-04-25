"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";
import AIScoreBadge from "@/components/recruiter/AIScoreBadge";
import type { CandidateListItem, CandidateStatusTone } from "@/types/candidate";

const PAGE_SIZE = 4;

type SortColumn = "name" | "role" | "aiScore" | "status" | "appliedAt";
type SortDirection = "asc" | "desc";

function formatDate(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function humanizeStatus(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getStatusTone(status: string): CandidateStatusTone {
  if (status === "shortlisted") {
    return "success";
  }
  if (status === "rejected_cv" || status === "rejected_interview") {
    return "danger";
  }
  if (
    status === "screened" ||
    status === "video_submitted" ||
    status === "interview_scheduled" ||
    status === "interviewed"
  ) {
    return "warning";
  }
  return "neutral";
}

function statusClasses(tone: CandidateStatusTone) {
  switch (tone) {
    case "success":
      return "border-[#b8ead2] bg-[#ecfff4] text-[#0f7b43]";
    case "warning":
      return "border-[#f0e0a4] bg-[#fffbe2] text-[#8b6a00]";
    case "danger":
      return "border-[#efc7bf] bg-[#fff0ec] text-[#b13d2f]";
    default:
      return "border-[#ddd7d3] bg-[#f4efeb] text-[#7d746d]";
  }
}

function compareCandidates(
  left: CandidateListItem,
  right: CandidateListItem,
  column: SortColumn,
  direction: SortDirection,
) {
  const multiplier = direction === "asc" ? 1 : -1;

  if (column === "aiScore") {
    if (left.aiScore === null && right.aiScore === null) {
      return 0;
    }
    if (left.aiScore === null) {
      return 1;
    }
    if (right.aiScore === null) {
      return -1;
    }
    return (left.aiScore - right.aiScore) * multiplier;
  }

  if (column === "appliedAt") {
    return (
      (new Date(left.appliedAt).getTime() - new Date(right.appliedAt).getTime()) *
      multiplier
    );
  }

  return left[column].localeCompare(right[column]) * multiplier;
}

type CandidateTableProps = {
  initialCandidates: CandidateListItem[];
  error?: string | null;
};

export default function CandidateTable({ initialCandidates, error = null }: CandidateTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<SortColumn>("aiScore");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const deferredSearch = useDeferredValue(search);
  const candidates = initialCandidates;
  const roles = useMemo(
    () => Array.from(new Set(candidates.map((candidate) => candidate.role))).sort(),
    [candidates],
  );
  const statuses = useMemo(
    () => Array.from(new Set(candidates.map((candidate) => candidate.status))).sort(),
    [candidates],
  );

  const filteredCandidates = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    const nextCandidates = candidates.filter((candidate) => {
      const matchesSearch =
        !normalizedSearch ||
        candidate.name.toLowerCase().includes(normalizedSearch) ||
        candidate.email.toLowerCase().includes(normalizedSearch) ||
        candidate.role.toLowerCase().includes(normalizedSearch);
      const matchesStatus =
        statusFilter === "all" || candidate.status === statusFilter;
      const matchesRole = roleFilter === "all" || candidate.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });

    nextCandidates.sort((left, right) =>
      compareCandidates(left, right, sortColumn, sortDirection),
    );

    return nextCandidates;
  }, [candidates, deferredSearch, roleFilter, sortColumn, sortDirection, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedCandidates = filteredCandidates.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const toggleSort = (column: SortColumn) => {
    setPage(1);
    if (sortColumn === column) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortColumn(column);
    setSortDirection(
      column === "name" || column === "role" || column === "status" ? "asc" : "desc",
    );
  };

  const paginationWindow = useMemo(() => {
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    const pages = [];
    for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
      pages.push(pageNumber);
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(38,185,200,0.12),_transparent_22%),linear-gradient(180deg,#fbfaf8_0%,#f3ece7_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#171717] sm:text-5xl">
              Candidates
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-[#635b55]">
              Review and manage your candidate pipeline, sorted by AI score so the strongest
              applications surface first.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.refresh()}
            className="rounded-full border border-[#cfecef] bg-white px-5 py-3 text-sm font-semibold text-[#0c6c75] transition hover:border-[#26b9c8] hover:bg-[#f0fdff]"
          >
            Refresh Candidates
          </button>
        </div>

        <section className="rounded-[2rem] border border-black/10 bg-white/85 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-6">
          <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_220px_220px]">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-[#5c5550]">Search Name</span>
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search candidates by name, email, or role"
                className="rounded-[1.1rem] border border-[#ddd5cf] bg-[#fcfbfa] px-4 py-3 text-sm text-[#201d1b] outline-none transition focus:border-[#26b9c8]"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-[#5c5550]">Status</span>
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(1);
                }}
                className="rounded-[1.1rem] border border-[#ddd5cf] bg-[#fcfbfa] px-4 py-3 text-sm text-[#201d1b] outline-none transition focus:border-[#26b9c8]"
              >
                <option value="all">All statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {humanizeStatus(status)}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-[#5c5550]">Role</span>
              <select
                value={roleFilter}
                onChange={(event) => {
                  setRoleFilter(event.target.value);
                  setPage(1);
                }}
                className="rounded-[1.1rem] border border-[#ddd5cf] bg-[#fcfbfa] px-4 py-3 text-sm text-[#201d1b] outline-none transition focus:border-[#26b9c8]"
              >
                <option value="all">All roles</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="overflow-hidden rounded-[1.6rem] border border-[#ece4de]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#f0e8e2]">
                <thead className="bg-[#fbf7f4]">
                  <tr>
                    {[
                      { key: "name", label: "Name" },
                      { key: "role", label: "Role" },
                      { key: "aiScore", label: "AI Score" },
                      { key: "status", label: "Status" },
                      { key: "appliedAt", label: "Date" },
                    ].map((column) => (
                      <th
                        key={column.key}
                        className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[#7e756f]"
                      >
                        <button
                          type="button"
                          onClick={() => toggleSort(column.key as SortColumn)}
                          className="inline-flex items-center gap-2"
                        >
                          <span>{column.label}</span>
                          <span className="text-[10px] text-[#a29891]">
                            {sortColumn === column.key
                              ? sortDirection === "asc"
                                ? "▲"
                                : "▼"
                              : "↕"}
                          </span>
                        </button>
                      </th>
                    ))}
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[#7e756f]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#f4ece7] bg-white">
                  {error ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-16 text-center text-sm font-medium text-[#b13d2f]"
                      >
                        {error}
                      </td>
                    </tr>
                  ) : pagedCandidates.length > 0 ? (
                    pagedCandidates.map((candidate) => (
                      <tr key={candidate.id} className="hover:bg-[#fcfaf8]">
                        <td className="px-4 py-5">
                          <div>
                            <p className="text-base font-semibold text-[#1f1d1b]">
                              {candidate.name}
                            </p>
                            <p className="mt-1 text-sm text-[#77706a]">{candidate.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-5">
                          <div>
                            <p className="text-base font-medium text-[#2a2522]">
                              {candidate.role}
                            </p>
                            <p className="mt-1 text-sm text-[#9a9088]">
                              {candidate.department}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-5">
                          <AIScoreBadge score={candidate.aiScore} />
                        </td>
                        <td className="px-4 py-5">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${statusClasses(
                              getStatusTone(candidate.status),
                            )}`}
                          >
                            {humanizeStatus(candidate.status)}
                          </span>
                        </td>
                        <td className="px-4 py-5 text-sm text-[#5d5651]">
                          {formatDate(candidate.appliedAt)}
                        </td>
                        <td className="px-4 py-5">
                          <Link
                            href={`/recruiter/dashboard/candidates/${candidate.id}`}
                            className="inline-flex items-center rounded-[0.9rem] border border-[#d7c9c1] px-3 py-2 text-sm font-semibold text-[#4d4742] transition hover:border-[#26b9c8] hover:text-[#0c6c75]"
                          >
                            View Candidate
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center text-sm text-[#766f69]">
                        No candidates match the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#6f6863]">
              Showing {pagedCandidates.length === 0 || error ? 0 : (currentPage - 1) * PAGE_SIZE + 1} to{" "}
              {Math.min(currentPage * PAGE_SIZE, filteredCandidates.length)} of{" "}
              {filteredCandidates.length} candidates
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={currentPage === 1}
                className="rounded-full border border-[#d8cec8] px-4 py-2 text-sm font-semibold text-[#4f4944] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>
              {paginationWindow.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={`h-10 w-10 rounded-full text-sm font-semibold ${
                    pageNumber === currentPage
                      ? "bg-[#26b9c8] text-white"
                      : "border border-[#d8cec8] text-[#4f4944]"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={currentPage === totalPages}
                className="rounded-full border border-[#d8cec8] px-4 py-2 text-sm font-semibold text-[#4f4944] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
