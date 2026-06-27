"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import EditMeetLinkModal from "@/components/recruiter/EditMeetLinkModal";
import { slugifyInterviewLabel } from "@/lib/interviewRoutes";
import { useProfile } from "@/hooks/useProfile";

const PAGE_SIZE = 10;

export type InterviewRow = {
  interviewId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  role: string;
  status: string;
  rawStatus: string;
  recommendation: "hire" | "hold" | "reject" | null;
  score: number | null;
  scheduledTime: string | null;
  meetLink: string;
  recruiterName?: string;
};

type Props = {
  interviews: InterviewRow[];
};

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatStatusLabel(status: string) {
  return status
    .split("_")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

function resolveDisplayStatus(
  rawStatus: string,
  recommendation: "hire" | "hold" | "reject" | null,
): { label: string; key: string } {
  if (rawStatus === "completed" && recommendation) {
    const labels = { hire: "Hired", hold: "On Hold", reject: "Rejected" };
    return { label: labels[recommendation], key: recommendation };
  }
  return { label: formatStatusLabel(rawStatus), key: rawStatus };
}

function getStatusStyle(key: string): { bg: string; text: string; border: string } {
  switch (key) {
    case "scheduled":
      return { bg: "bg-[var(--color-teal-light)]", text: "text-[var(--color-teal-dark)]", border: "border-[var(--color-teal-border)]" };
    case "confirmed":
      return { bg: "bg-[var(--color-status-info-bg)]", text: "text-[var(--color-status-info-text)]", border: "border-[var(--color-status-info-border)]" };
    case "in_progress":
      return { bg: "bg-[var(--color-status-warning-bg)]", text: "text-[var(--color-status-warning-text)]", border: "border-[var(--color-status-warning-border)]" };
    case "hire":
      return { bg: "bg-[var(--color-status-active-bg)]", text: "text-[var(--color-status-active-text)]", border: "border-[var(--color-status-active-border)]" };
    case "hold":
      return { bg: "bg-[var(--color-status-warning-bg)]", text: "text-[var(--color-status-warning-text)]", border: "border-[var(--color-status-warning-border)]" };
    case "reject":
    case "cancelled":
    case "no_show":
      return { bg: "bg-[var(--color-status-error-bg)]", text: "text-[var(--color-status-error-text)]", border: "border-[var(--color-status-error-border)]" };
    default:
      return { bg: "bg-[var(--color-warm-surface)]", text: "text-[var(--color-text-subtle)]", border: "border-[var(--color-warm-border-light)]" };
  }
}

export default function InterviewTable({ interviews }: Props) {
  const router = useRouter();
  const { profile } = useProfile();
  const isAdmin = profile?.isAdmin || false;
  const [page, setPage] = useState(1);
  const [editingInterview, setEditingInterview] = useState<InterviewRow | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  async function handleCancelInterview(interview: InterviewRow) {
    const confirmed = window.confirm(
      `Cancel the scheduled interview for ${interview.candidateName}? This cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }

    setCancelError(null);
    setCancellingId(interview.interviewId);

    try {
      const res = await fetch(`/api/recruiter/interviews/${interview.interviewId}/cancel`, {
        method: "POST",
      });
      const payload = (await res.json()) as { detail?: string; error?: string };

      if (!res.ok) {
        throw new Error(payload.detail ?? payload.error ?? "Unable to cancel interview.");
      }

      router.refresh();
    } catch (error) {
      setCancelError(
        error instanceof Error ? error.message : "Unable to cancel interview.",
      );
    } finally {
      setCancellingId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(interviews.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = interviews.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const showingFrom = interviews.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(currentPage * PAGE_SIZE, interviews.length);

  const columns = isAdmin 
    ? ["Name", "Job Role", "Scheduled By", "Status", "Score", "Date", "Actions"]
    : ["Name", "Job Role", "Status", "Score", "Date", "Actions"];

  return (
    <section className="rounded-[2rem] border border-black/10 bg-white/85 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-foreground)]">Interview List</h2>
          <p className="mt-1 text-sm text-[var(--color-text-faint)]">
            {interviews.length} interview{interviews.length !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>

      {cancelError ? (
        <p className="mb-4 text-sm text-[var(--color-status-error-text)]">{cancelError}</p>
      ) : null}

      <div className="overflow-hidden rounded-[1.6rem] border border-[var(--color-warm-border)]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--color-warm-surface)]">
            <thead className="bg-[var(--color-warm-bg)]">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-warm-surface)] bg-white">
              {paged.length > 0 ? (
                paged.map((interview) => {
                  const { label: statusLabel, key: statusKey } = resolveDisplayStatus(
                    interview.rawStatus,
                    interview.recommendation,
                  );
                  const { bg, text, border } = getStatusStyle(statusKey);

                  return (
                    <tr key={interview.interviewId} className="hover:bg-[var(--color-warm-bg-page)]">
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary,var(--color-secondary))] text-xs font-bold text-white">
                            {getInitials(interview.candidateName)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--color-text-darkest)]">
                              {interview.candidateName}
                            </p>
                            <p className="mt-0.5 text-xs text-[var(--color-text-subtle)]">{interview.candidateEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-[var(--color-text-darkest)]">{interview.role}</p>
                      </td>
                      
                      {isAdmin && (
                        <td className="px-4 py-5">
                          <p className="text-sm font-medium text-[var(--color-text-darkest)]">
                            {interview.recruiterName || 'Unknown'}
                          </p>
                        </td>
                      )}
                      
                      <td className="px-4 py-5">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${bg} ${text} ${border}`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-5 text-sm text-[var(--color-text-muted)]">
                        {interview.score !== null ? (
                          <span className="font-semibold text-[var(--color-text-darkest)]">{interview.score}</span>
                        ) : (
                          <span className="text-[var(--color-text-lighter)]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-5 text-sm text-[var(--color-text-muted)]">
                        {interview.scheduledTime ? (
                          formatDate(interview.scheduledTime)
                        ) : (
                          <span className="text-[var(--color-text-lighter)]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex flex-wrap gap-2">
                          {/* 👇 All action buttons hidden for admins */}
                          {!isAdmin && ["scheduled", "confirmed", "in_progress"].includes(statusKey) && (
                            <>
                              <Link
                                href={{
                                  pathname: `/recruiter/dashboard/interviews/live/${slugifyInterviewLabel(interview.candidateName)}`,
                                  query: {
                                    interviewId: interview.interviewId,
                                    candidateName: interview.candidateName,
                                    candidateEmail: interview.candidateEmail,
                                    candidateRole: interview.role,
                                  },
                                }}
                                className="inline-flex items-center rounded-[0.9rem] border border-[var(--color-warm-border-deep)] px-3 py-2 text-sm font-semibold text-[var(--color-text-body)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-teal-dark)]"
                              >
                                Start Interview
                              </Link>
                              <button
                                type="button"
                                onClick={() => setEditingInterview(interview)}
                                className="inline-flex items-center rounded-[0.9rem] border border-[var(--color-warm-border-deep)] px-3 py-2 text-sm font-semibold text-[var(--color-text-body)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-teal-dark)]"
                              >
                                Edit Meet Link
                              </button>
                            </>
                          )}
                          {!isAdmin && ["scheduled", "confirmed"].includes(statusKey) && (
                            <button
                              type="button"
                              onClick={() => void handleCancelInterview(interview)}
                              disabled={cancellingId === interview.interviewId}
                              className="inline-flex items-center rounded-[0.9rem] border border-[var(--color-status-error-border)] px-3 py-2 text-sm font-semibold text-[var(--color-status-error-text)] transition hover:bg-[var(--color-status-error-bg)] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {cancellingId === interview.interviewId ? "Cancelling..." : "Cancel"}
                            </button>
                          )}
                          <Link
                            href={`/recruiter/dashboard/interviews/${interview.interviewId}`}
                            className="inline-flex items-center rounded-[0.9rem] border border-[var(--color-warm-border-deep)] px-3 py-2 text-sm font-semibold text-[var(--color-text-body)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-teal-dark)]"
                          >
                            View Result
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-16 text-center text-sm text-[var(--color-text-subtle)]">
                    No interviews found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--color-text-subtle)]">
          Showing {showingFrom} to {showingTo} of {interviews.length} interview
          {interviews.length !== 1 ? "s" : ""}
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-full border border-[var(--color-warm-border-deep)] px-5 py-2 text-sm font-semibold text-[var(--color-text-body)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-[var(--color-text-subtle)]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-full border border-[var(--color-warm-border-deep)] px-5 py-2 text-sm font-semibold text-[var(--color-text-body)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* 👇 EditMeetLinkModal hidden for admins */}
      {!isAdmin && editingInterview && (
        <EditMeetLinkModal
          isOpen
          onClose={() => setEditingInterview(null)}
          interviewId={editingInterview.interviewId}
          candidateName={editingInterview.candidateName}
          initialMeetLink={editingInterview.meetLink}
        />
      )}
    </section>
  );
}