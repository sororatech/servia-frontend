"use client";

import type { TranscriptEntry } from "@/types/api";

type LiveTranscriptProps = {
  currentQuestion: string;
  entries: TranscriptEntry[];
  notes: string;
  recordingTime?: string;
  isLive?: boolean;
};

const speakerStyles: Record<TranscriptEntry["speaker"], string> = {
  AI: "border-[var(--color-teal-border)] bg-[var(--color-teal-light)] text-[var(--color-teal-dark)]",
  Candidate: "border-[var(--color-warm-border-deep)] bg-white text-[var(--color-text-darkest)]",
  Recruiter: "border-[var(--color-status-warning-border)] bg-[var(--color-status-error-bg)] text-[var(--color-status-warning-text)]",
};

export default function LiveTranscript({
  currentQuestion,
  entries,
  notes,
  recordingTime = "00:00",
  isLive = false,
}: LiveTranscriptProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-black/8 bg-[var(--color-warm-surface)] shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
      <div className="h-[320px] bg-[linear-gradient(180deg,#d9f0f4_0%,#eff7f6_100%)] p-5 sm:p-6">
        <div className="flex h-full flex-col rounded-[1.5rem] border border-white/60 bg-white/35 p-4 backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="inline-flex items-center overflow-hidden rounded-full border border-[var(--color-status-error-border)] bg-white shadow-sm">
              <span className="bg-[var(--color-status-error-text)] px-4 py-1.5 text-sm font-semibold tracking-[0.2em] text-white uppercase">
                {isLive ? "Rec" : "Paused"}
              </span>
              <span className="px-4 py-1.5 text-sm font-semibold text-[var(--color-text-body)]">
                {recordingTime}
              </span>
            </div>
            <span className="text-sm font-medium text-[var(--color-teal-dim)]">
              {isLive ? "Live interview stream active" : "Waiting for live interview stream"}
            </span>
          </div>

          <div className="grid flex-1 gap-3 overflow-y-auto pr-1">
            {entries.length > 0 ? (
              entries.map((entry) => (
                <article
                  key={entry.id}
                  className={`max-w-[88%] rounded-[1.25rem] border px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.06)] ${
                    entry.speaker === "Candidate" ? "justify-self-start" : "justify-self-end"
                  } ${speakerStyles[entry.speaker]}`}
                >
                  <div className="mb-1 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em]">
                    <span>{entry.speaker}</span>
                    <span className="text-current/60">{entry.time}</span>
                  </div>
                  <p className="text-sm leading-6 sm:text-[15px]">{entry.text}</p>
                </article>
              ))
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-[1.25rem] border border-dashed border-[var(--color-teal-border)] bg-white/45 px-6 py-10 text-center text-sm leading-6 text-[var(--color-teal-dim)]">
                Transcript will appear here once the live interview starts sending data.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6 border-t border-black/8 bg-[var(--color-warm-border-deep)]/85 px-5 py-5 sm:px-6 sm:py-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-subtle)]">
            Current Question
          </p>
          <h2 className="mt-2 max-w-3xl text-2xl font-semibold leading-tight text-[var(--color-foreground)] sm:text-[2rem]">
            {currentQuestion || "Waiting for the first interview question..."}
          </h2>
          <div className="mt-4 h-px w-full bg-black/70" />
        </div>

        <div className="rounded-[1.4rem] border border-white/70 bg-white/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-subtle)]">
            Interview Notes
          </p>
          <p className="text-base leading-7 text-[var(--color-text-body)]">
            {notes || "Notes from the live interview will appear here."}
          </p>
        </div>
      </div>
    </section>
  );
}
