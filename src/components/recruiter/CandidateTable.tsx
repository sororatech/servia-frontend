"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useMemo, useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import AIScoreBadge from "@/components/recruiter/AIScoreBadge";
import EditMeetLinkModal from "@/components/recruiter/EditMeetLinkModal";
import ScheduleInterviewModal from "@/components/recruiter/ScheduleInterviewModal";
import BulkUpdateModal from "@/components/recruiter/BulkUpdateModal";
import { useScheduleInterview } from "@/hooks/useScheduleInterview";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/Button";
import { slugifyInterviewLabel } from "@/lib/interviewRoutes";
import type { CandidateListItem, CandidateStatusTone } from "@/types/candidate";

const PAGE_SIZE = 4;

type SortColumn = "name" | "role" | "aiScore" | "status" | "appliedAt";
type SortDirection = "asc" | "desc";

function humanizeString(str: string): string {
  if (!str) return str;
  return str
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

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
  if (status === "shortlisted") return "success";
  if (status === "rejected_cv" || status === "rejected_interview") return "danger";
  if (
    status === "screened" ||
    status === "video_submitted" ||
    status === "interview_scheduled" ||
    status === "interviewed"
  ) return "warning";
  return "neutral";
}

function statusClasses(tone: CandidateStatusTone) {
  switch (tone) {
    case "success":
      return "border-[var(--color-status-active-border)] bg-[var(--color-status-active-bg)] text-[var(--color-status-active-text)]";
    case "warning":
      return "border-[var(--color-status-warning-border)] bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-text)]";
    case "danger":
      return "border-[var(--color-status-error-border)] bg-[var(--color-status-error-bg)] text-[var(--color-status-error-text)]";
    default:
      return "border-[var(--color-warm-border-light)] bg-[var(--color-warm-surface)] text-[var(--color-text-subtle)]";
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
    if (left.aiScore === null && right.aiScore === null) return 0;
    if (left.aiScore === null) return 1;
    if (right.aiScore === null) return -1;
    return (left.aiScore - right.aiScore) * multiplier;
  }
  if (column === "appliedAt") {
    return (new Date(left.appliedAt).getTime() - new Date(right.appliedAt).getTime()) * multiplier;
  }
  return left[column].localeCompare(right[column]) * multiplier;
}

type CandidateTableProps = {
  initialCandidates: CandidateListItem[];
  error?: string | null;
};

export default function CandidateTable({ initialCandidates, error = null }: CandidateTableProps) {
  const router = useRouter();
  const { profile } = useProfile();
  const isAdmin = profile?.isAdmin || false;
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<SortColumn>("aiScore");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const { scheduleTarget, openFor, close, isOpen } = useScheduleInterview();
  const [editingInterview, setEditingInterview] = useState<CandidateListItem | null>(null);
  const deferredSearch = useDeferredValue(search);
  const candidates = initialCandidates;

  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedCandidates(new Set());
  }, [page, statusFilter, roleFilter, search]);

  const roles = useMemo(
    () => Array.from(new Set(candidates.map((c) => c.role))).sort(),
    [candidates],
  );
  const statuses = useMemo(
    () => Array.from(new Set(candidates.map((c) => c.status))).sort(),
    [candidates],
  );

  const filteredCandidates = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();
    const next = candidates.filter((candidate) => {
      const matchesSearch =
        !normalizedSearch ||
        candidate.name.toLowerCase().includes(normalizedSearch) ||
        candidate.email.toLowerCase().includes(normalizedSearch) ||
        candidate.role.toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;
      const matchesRole = roleFilter === "all" || candidate.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
    next.sort((a, b) => compareCandidates(a, b, sortColumn, sortDirection));
    return next;
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
      setSortDirection((cur) => (cur === "asc" ? "desc" : "asc"));
      return;
    }
    setSortColumn(column);
    setSortDirection(column === "name" || column === "role" || column === "status" ? "asc" : "desc");
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) setSelectedCandidates(new Set(pagedCandidates.map((c) => c.id)));
    else setSelectedCandidates(new Set());
  };

  const toggleSelectCandidate = (id: string, checked: boolean) => {
    const newSet = new Set(selectedCandidates);
    if (checked) newSet.add(id);
    else newSet.delete(id);
    setSelectedCandidates(newSet);
  };

  const allSelected = pagedCandidates.length > 0 && selectedCandidates.size === pagedCandidates.length;
  const someSelected = selectedCandidates.size > 0;

  return (
    <main className="min-h-screen bg-page-gradient px-4 py-8 sm:px-6 lg:px-10">
      <ScheduleInterviewModal
        isOpen={isOpen}
        onClose={close}
        defaultCandidateId={scheduleTarget?.candidateId}
        defaultJobId={scheduleTarget?.jobId}
      />
      {/* 👇 BulkUpdateModal hidden for admins */}
      {!isAdmin && (
        <BulkUpdateModal
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          candidateIds={Array.from(selectedCandidates)}
          onSuccess={() => {
            router.refresh();
            setSelectedCandidates(new Set());
          }}
        />
      )}
      {/* 👇 EditMeetLinkModal also hidden for admins */}
      {!isAdmin && editingInterview && (editingInterview as any).activeInterview && (
        <EditMeetLinkModal
          isOpen
          onClose={() => setEditingInterview(null)}
          interviewId={(editingInterview as any).activeInterview.id}
          candidateName={editingInterview.name}
          initialMeetLink={(editingInterview as any).activeInterview.meetLink}
        />
      )}
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[var(--color-foreground)] sm:text-5xl">
              Candidates
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-[var(--color-text-muted)]">
              Review and manage your candidate pipeline, sorted by AI score.
            </p>
          </div>
          <div className="flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.refresh()}
              aria-label="Refresh candidates list"
              className="shrink-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <section className="rounded-[2rem] border border-black/10 bg-white/85 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-6">
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-[var(--color-text-muted)]">Search Name</span>
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search candidates by name, email, or role"
                className="rounded-[1.1rem] border border-[var(--color-warm-border-faint)] bg-[var(--color-input-bg-light)] px-4 py-3 text-sm text-[var(--color-text-darkest)] outline-none transition focus:border-[var(--color-primary)]"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-[var(--color-text-muted)]">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-[1.1rem] border border-[var(--color-warm-border-faint)] bg-[var(--color-input-bg-light)] px-4 py-3 text-sm text-[var(--color-text-darkest)] outline-none transition focus:border-[var(--color-primary)]"
              >
                <option value="all">All statuses</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>{humanizeStatus(s)}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-[var(--color-text-muted)]">Role</span>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-[1.1rem] border border-[var(--color-warm-border-faint)] bg-[var(--color-input-bg-light)] px-4 py-3 text-sm text-[var(--color-text-darkest)] outline-none transition focus:border-[var(--color-primary)]"
              >
                <option value="all">All roles</option>
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </label>
          </div>

          {/* 👇 Hide bulk update for admins */}
          {someSelected && !isAdmin && (
            <div className="mb-4 flex items-center justify-between rounded-xl bg-[var(--color-primary)]/10 p-3">
              <span className="text-sm font-medium text-[var(--color-primary)]">
                {selectedCandidates.size} candidate{selectedCandidates.size !== 1 ? "s" : ""} selected
              </span>
              <Button variant="primary" size="sm" onClick={() => setShowBulkModal(true)}>
                Bulk Update Status
              </Button>
            </div>
          )}

          <div className="overflow-hidden rounded-[1.6rem] border border-[var(--color-warm-border)]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--color-warm-surface)]">
                <thead className="bg-[var(--color-warm-bg)]">
                  <tr>
                    {/* 👇 Hide checkbox column for admins */}
                    {!isAdmin && (
                      <th className="px-4 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={(e) => toggleSelectAll(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                        />
                      </th>
                    )}
                    {[
                      { key: "name", label: "Name" },
                      { key: "role", label: "Role" },
                      { key: "aiScore", label: "AI Score" },
                      { key: "status", label: "Status" },
                      { key: "appliedAt", label: "Date" },
                    ].map((col) => (
                      <th
                        key={col.key}
                        className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]"
                      >
                        <button
                          type="button"
                          onClick={() => toggleSort(col.key as SortColumn)}
                          className="inline-flex items-center gap-2"
                        >
                          <span>{col.label}</span>
                          <span className="text-[10px] text-[var(--color-text-lighter)]">
                            {sortColumn === col.key
                              ? sortDirection === "asc"
                                ? "▲"
                                : "▼"
                              : "↕"}
                          </span>
                        </button>
                      </th>
                    ))}
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-warm-surface)] bg-white">
                  {error ? (
                    <tr>
                      <td colSpan={isAdmin ? 6 : 7} className="px-4 py-16 text-center text-sm font-medium text-[var(--color-status-error-text)]">
                        {error}
                      </td>
                    </tr>
                  ) : pagedCandidates.length > 0 ? (
                    pagedCandidates.map((candidate) => {
                      const activeInterview = (candidate as any).activeInterview;
                      return (
                        <tr key={candidate.id} className="hover:bg-[var(--color-warm-bg-page)]">
                          {/* 👇 Hide checkbox for admins */}
                          {!isAdmin && (
                            <td className="px-4 py-5">
                              <input
                                type="checkbox"
                                checked={selectedCandidates.has(candidate.id)}
                                onChange={(e) => toggleSelectCandidate(candidate.id, e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                              />
                            </td>
                          )}
                          <td className="px-4 py-5">
                            <div>
                              <p className="text-base font-semibold text-[var(--color-text-darkest)]">{candidate.name}</p>
                              <p className="mt-1 text-sm text-[var(--color-text-subtle)]">{candidate.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-5">
                            <div>
                              <p className="text-base font-medium text-[var(--color-text-darkest)]">{candidate.role}</p>
                              <p className="mt-1 text-sm text-[var(--color-text-faint)]">
                                {humanizeString(candidate.department)}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-5">
                            <AIScoreBadge score={candidate.aiScore} />
                          </td>
                          <td className="px-4 py-5">
                            <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${statusClasses(getStatusTone(candidate.status))}`}>
                              {humanizeStatus(candidate.status)}
                            </span>
                          </td>
                          <td className="px-4 py-5 text-sm text-[var(--color-text-muted)]">{formatDate(candidate.appliedAt)}</td>
                          <td className="px-4 py-5">
                            <div className="flex min-w-[14rem] flex-wrap gap-2">
                              <Link
                                href={`/recruiter/dashboard/candidates/${candidate.id}`}
                                className="inline-flex items-center rounded-[0.9rem] border border-[var(--color-warm-border-deep)] px-3 py-2 text-sm font-semibold text-[var(--color-text-body)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-teal-dark)]"
                              >
                                View Candidate
                              </Link>
                              {/* 👇 All action buttons hidden for admins */}
                              {!isAdmin && activeInterview && (
                                <>
                                  <Link
                                    href={{
                                      pathname: `/recruiter/dashboard/interviews/live/${slugifyInterviewLabel(candidate.name)}`,
                                      query: {
                                        interviewId: activeInterview.id,
                                        candidateName: candidate.name,
                                        candidateEmail: candidate.email,
                                        candidateRole: candidate.role,
                                      },
                                    }}
                                    className="inline-flex items-center rounded-[0.9rem] border border-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-[var(--color-teal-dark)] transition hover:bg-[var(--color-teal-hover)]"
                                  >
                                    Start Interview
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => setEditingInterview(candidate)}
                                    className="inline-flex items-center rounded-[0.9rem] border border-[var(--color-warm-border-deep)] px-3 py-2 text-sm font-semibold text-[var(--color-text-body)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-teal-dark)]"
                                  >
                                    Edit Meet Link
                                  </button>
                                </>
                              )}
                              {!isAdmin && candidate.status === "shortlisted" && !activeInterview && (
                                <button
                                  type="button"
                                  onClick={() => openFor(candidate.id, candidate.jobId)}
                                  className="inline-flex items-center rounded-[0.9rem] border border-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-[var(--color-teal-dark)] transition hover:bg-[var(--color-teal-hover)]"
                                >
                                  Schedule Interview
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={isAdmin ? 6 : 7} className="px-4 py-16 text-center text-sm text-[var(--color-text-subtle)]">
                        No candidates match the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--color-text-subtle)]">
              Showing {pagedCandidates.length === 0 || error ? 0 : (currentPage - 1) * PAGE_SIZE + 1} to{" "}
              {Math.min(currentPage * PAGE_SIZE, filteredCandidates.length)} of {filteredCandidates.length} candidates
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((cur) => Math.max(1, cur - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-[var(--color-text-subtle)]">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((cur) => Math.min(totalPages, cur + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}