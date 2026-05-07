"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { slugifyInterviewLabel } from "@/lib/interviewRoutes";

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
      return { bg: "bg-[#e9fbfd]", text: "text-[#0c6c75]", border: "border-[#a8e8ef]" };
    case "confirmed":
      return { bg: "bg-[#e3f2fd]", text: "text-[#1565c0]", border: "border-[#90caf9]" };
    case "in_progress":
      return { bg: "bg-[#fffbe2]", text: "text-[#8b6a00]", border: "border-[#f0e0a4]" };
    case "hire":
      return { bg: "bg-[#ecfff4]", text: "text-[#0f7b43]", border: "border-[#b8ead2]" };
    case "hold":
      return { bg: "bg-[#fffbe2]", text: "text-[#8b6a00]", border: "border-[#f0e0a4]" };
    case "reject":
    case "cancelled":
    case "no_show":
      return { bg: "bg-[#fff0ec]", text: "text-[#b13d2f]", border: "border-[#efc7bf]" };
    default:
      return { bg: "bg-[#f4efeb]", text: "text-[#7d746d]", border: "border-[#ddd7d3]" };
  }
}

export default function InterviewTable({ interviews }: Props) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(interviews.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = interviews.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const paginationWindow = useMemo(() => {
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    const pages: number[] = [];
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  }, [currentPage, totalPages]);

  const showingFrom = interviews.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(currentPage * PAGE_SIZE, interviews.length);

  return (
    <section className="rounded-[2rem] border border-black/10 bg-white/85 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#171717]">Interview List</h2>
          <p className="mt-1 text-sm text-[#7e756f]">
            {interviews.length} interview{interviews.length !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.6rem] border border-[#ece4de]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#f0e8e2]">
            <thead className="bg-[#fbf7f4]">
              <tr>
                {["Name", "Job Role", "Status", "Score", "Date", "Actions"].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[#7e756f]"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4ece7] bg-white">
              {paged.length > 0 ? (
                paged.map((interview) => {
                  const { label: statusLabel, key: statusKey } = resolveDisplayStatus(
                    interview.rawStatus,
                    interview.recommendation,
                  );
                  const { bg, text, border } = getStatusStyle(statusKey);

                  return (
                    <tr key={interview.interviewId} className="hover:bg-[#fcfaf8]">
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary,#2a3a4a)] text-xs font-bold text-white">
                            {getInitials(interview.candidateName)}
                          </div>
                          <div>
                            <p className="text-base font-semibold text-[#1f1d1b]">
                              {interview.candidateName}
                            </p>
                            <p className="mt-1 text-sm text-[#77706a]">{interview.candidateEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <p className="text-base font-medium text-[#2a2522]">{interview.role}</p>
                      </td>
                      <td className="px-4 py-5">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${bg} ${text} ${border}`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-5 text-sm text-[#5d5651]">
                        {interview.score !== null ? (
                          <span className="font-semibold text-[#1f1d1b]">{interview.score}</span>
                        ) : (
                          <span className="text-[#a29891]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-5 text-sm text-[#5d5651]">
                        {interview.scheduledTime ? (
                          formatDate(interview.scheduledTime)
                        ) : (
                          <span className="text-[#a29891]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex flex-wrap gap-2">
                          {["scheduled", "confirmed", "in_progress"].includes(statusKey) && (
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
                              className="inline-flex items-center rounded-[0.9rem] border border-[#d7c9c1] px-3 py-2 text-sm font-semibold text-[#4d4742] transition hover:border-[#26b9c8] hover:text-[#0c6c75]"
                            >
                              Start Interview
                            </Link>
                          )}
                          <Link
                            href={`/recruiter/dashboard/interviews/${interview.interviewId}`}
                            className="inline-flex items-center rounded-[0.9rem] border border-[#d7c9c1] px-3 py-2 text-sm font-semibold text-[#4d4742] transition hover:border-[#26b9c8] hover:text-[#0c6c75]"
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
                  <td colSpan={6} className="px-4 py-16 text-center text-sm text-[#766f69]">
                    No interviews found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#6f6863]">
          Showing {showingFrom} to {showingTo} of {interviews.length} interview
          {interviews.length !== 1 ? "s" : ""}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-full border border-[#d8cec8] px-4 py-2 text-sm font-semibold text-[#4f4944] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>

          {paginationWindow.map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => setPage(pageNum)}
              className={`h-10 w-10 rounded-full text-sm font-semibold ${
                pageNum === currentPage
                  ? "bg-[#26b9c8] text-white"
                  : "border border-[#d8cec8] text-[#4f4944]"
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-full border border-[#d8cec8] px-4 py-2 text-sm font-semibold text-[#4f4944] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
