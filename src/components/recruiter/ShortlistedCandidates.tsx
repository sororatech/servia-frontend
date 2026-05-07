"use client";

import ScheduleInterviewModal from "./ScheduleInterviewModal";
import { useScheduleInterview } from "@/hooks/useScheduleInterview";

export type ShortlistedCandidate = {
  id: string;
  name: string;
  email: string;
  role: string;
  jobId: string;
};

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function ShortlistedCandidates({
  candidates,
}: {
  candidates: ShortlistedCandidate[];
}) {
  const { scheduleTarget, openFor, close, isOpen } = useScheduleInterview();

  if (candidates.length === 0) return null;

  return (
    <>
      <section className="rounded-[2rem] border border-black/10 bg-white/85 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[#171717]">Needs Scheduling</h2>
          <p className="mt-1 text-sm text-[#7e756f]">
            {candidates.length} shortlisted candidate{candidates.length !== 1 ? "s" : ""} ready for an interview slot.
          </p>
        </div>

        <div className="overflow-hidden rounded-[1.6rem] border border-[#ece4de]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#f0e8e2]">
              <thead className="bg-[#fbf7f4]">
                <tr>
                  {["Candidate", "Job Role", "Action"].map((col) => (
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
                {candidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-[#fcfaf8]">
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary,#2a3a4a)] text-xs font-bold text-white">
                          {getInitials(candidate.name)}
                        </div>
                        <div>
                          <p className="text-base font-semibold text-[#1f1d1b]">{candidate.name}</p>
                          <p className="mt-1 text-sm text-[#77706a]">{candidate.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <p className="text-base font-medium text-[#2a2522]">{candidate.role}</p>
                    </td>
                    <td className="px-4 py-5">
                      <button
                        type="button"
                        onClick={() => openFor(candidate.id, candidate.jobId)}
                        className="inline-flex items-center rounded-[0.9rem] border border-[#26b9c8] px-4 py-2 text-sm font-semibold text-[#0c6c75] transition hover:bg-[#f0fdff]"
                      >
                        Schedule Interview
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <ScheduleInterviewModal
        isOpen={isOpen}
        onClose={close}
        defaultCandidateId={scheduleTarget?.candidateId}
        defaultJobId={scheduleTarget?.jobId}
      />
    </>
  );
}
