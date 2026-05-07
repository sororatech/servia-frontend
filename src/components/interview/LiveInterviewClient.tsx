"use client";

import { useState } from "react";
import LiveTranscript from "@/components/interview/LiveTranscript";
import useInterview from "@/hooks/useInterview";

type LiveInterviewClientProps = {
  interviewId: string;
  initialCandidateName?: string;
  initialCandidateEmail?: string;
  initialCandidateRole?: string;
};

export default function LiveInterviewClient({
  interviewId,
  initialCandidateName = "",
  initialCandidateEmail = "",
  initialCandidateRole = "",
}: LiveInterviewClientProps) {
  const { interview, isLoading, error, streamStatus, refresh, endInterview } =
    useInterview(interviewId);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(true);
  const [controlMessage, setControlMessage] = useState<string | null>(null);
  const hasTranscript = interview.transcript.length > 0;
  const hasCandidateTranscript = interview.transcript.some(
    (entry) => entry.speaker === "Candidate",
  );
  const followUpEmptyStateMessage = hasTranscript && !hasCandidateTranscript
    ? "Waiting for candidate answer before generating follow-ups."
    : "Follow-up questions will appear here when the backend sends them.";

  const handleEndCall = () => {
    const sent = endInterview();
    setControlMessage(
      sent
        ? "End-call signal sent to the backend."
        : "Unable to end the call right now because the live stream is disconnected.",
    );
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setControlMessage("Live interview link copied to clipboard.");
    } catch {
      setControlMessage("Could not copy the live interview link.");
    }
  };

  const handleNotes = () => {
    const notesSection = document.getElementById("interview-notes");
    notesSection?.scrollIntoView({ behavior: "smooth", block: "center" });
    setControlMessage("Moved to interview notes.");
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(38,185,200,0.18),_transparent_28%),linear-gradient(180deg,#fcfcfb_0%,#f6f0ec_100%)] text-[#171717]">
      <div className="border-b border-black/8 bg-white/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">

          <div className="space-y-1 text-center">
            <h1 className="text-xl font-semibold tracking-[-0.03em] text-[#171717] sm:text-3xl">
              Live Interview with {interview.candidateName || initialCandidateName || "Candidate"}
            </h1>
            <div className="space-y-1 text-sm text-[#5e5752]">
              <p>
                {interview.candidateEmail || initialCandidateEmail || "Candidate email will appear once the session loads."}
              </p>
              <p>
                {interview.candidateRole || initialCandidateRole || "Candidate role will appear once the session loads."}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 lg:justify-end">
            <div
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                streamStatus === "connected"
                  ? "border border-[#bfeef3] bg-[#e9fbfd] text-[#0c6c75]"
                  : "border border-[#eaded8] bg-white text-[#6c6764]"
              }`}
            >
              {streamStatus === "connected" ? "Live stream connected" : "Waiting for stream"}
            </div>
            <button
              type="button"
              onClick={() => void refresh()}
              className="rounded-full border border-[#d7c3ba] bg-white px-4 py-2 text-sm font-semibold text-[#4b4743] transition hover:border-[#26b9c8] hover:text-[#0c6c75]"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        {error ? (
          <div className="mb-6 rounded-[1.5rem] border border-[#f1c8b9] bg-[#fff3ed] px-5 py-4 text-sm text-[#8a4b2a]">
            {error}
          </div>
        ) : null}
        {controlMessage ? (
          <div className="mb-6 rounded-[1.5rem] border border-[#bfeef3] bg-[#e9fbfd] px-5 py-4 text-sm text-[#0c6c75]">
            {controlMessage}
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_420px]">
          <section className="space-y-6">
            <LiveTranscript
              currentQuestion={interview.currentQuestion}
              entries={interview.transcript}
              notes={interview.notes}
              recordingTime={interview.recordingTime}
              isLive={interview.status === "live"}
            />

            <div className="flex flex-col gap-4 rounded-[2rem] bg-white/60 px-5 py-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <button
                type="button"
                onClick={handleEndCall}
                className="min-w-[180px] rounded-[1.1rem] bg-[#d9d9d9] px-8 py-4 text-xl font-medium text-[#1d1d1d] transition hover:bg-[#cfcfcf]"
              >
                End Call
              </button>

              <div className="flex items-center gap-4">
                {[
                  {
                    label: "Mute",
                    text: isMuted ? "U" : "M",
                    onClick: () => {
                      setIsMuted((current) => !current);
                      setControlMessage(`Microphone ${!isMuted ? "muted" : "unmuted"} locally.`);
                    },
                    active: isMuted,
                  },
                  {
                    label: "Video",
                    text: isVideoOff ? "V" : "C",
                    onClick: () => {
                      setIsVideoOff((current) => !current);
                      setControlMessage(`Video ${isVideoOff ? "enabled" : "disabled"} locally.`);
                    },
                    active: isVideoOff,
                  },
                  {
                    label: "Share",
                    text: "S",
                    onClick: () => void handleShare(),
                    active: false,
                  },
                  {
                    label: "Notes",
                    text: "N",
                    onClick: handleNotes,
                    active: false,
                  },
                ].map((control) => (
                  <button
                    key={control.label}
                    type="button"
                    aria-label={control.label}
                    aria-pressed={control.active}
                    onClick={control.onClick}
                    className={`h-16 w-16 rounded-full text-sm font-medium transition ${
                      control.active
                        ? "bg-[#26b9c8] text-white"
                        : "bg-[#d9d9d9] text-[#4b4743] hover:bg-[#cecece]"
                    }`}
                  >
                    {control.text}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <aside className="rounded-[2rem] border border-black/12 bg-[#fdf6f4]/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.1)]">
            <div className="mb-8">
              <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#171717]">
                AI Follow-Up Suggestions
              </h2>
              <p className="mt-2 text-lg text-[#5e5752]">
                AI recommended follow-up questions for the recruiter
              </p>
            </div>

            <div className="space-y-4">
              {interview.followUpSuggestions.length > 0 ? (
                interview.followUpSuggestions.map((question, index) => (
                  <button
                    key={question.id}
                    className={`w-full rounded-[1.25rem] border px-4 py-4 text-left text-lg leading-7 text-[#4b4743] transition hover:border-[#26b9c8] hover:bg-white ${
                      index === 0
                        ? "border-[#d4c1b6] bg-[#fffaf8] shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
                        : "border-[#eaded8] bg-white/70"
                    }`}
                  >
                    {question.text}
                  </button>
                ))
              ) : (
                <div className="rounded-[1.25rem] border border-dashed border-[#d9cbc3] bg-white/60 px-4 py-6 text-center text-base leading-7 text-[#6b625d]">
                  {followUpEmptyStateMessage}
                </div>
              )}
            </div>

            <div
              id="interview-notes"
              className="mt-10 rounded-[1.5rem] border border-dashed border-[#d9cbc3] bg-white/60 p-5"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8a817b]">
                Suggested next angle
              </p>
              <p className="mt-3 text-base leading-7 text-[#4b4743]">
                Additional recruiter guidance will show up here when live coaching data is available.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void refresh()}
              className="mt-10 w-full rounded-[1.2rem] border border-[#d7c3ba] bg-white px-6 py-4 text-2xl font-medium text-[#4b4743] transition hover:border-[#26b9c8] hover:text-[#0c6c75]"
            >
              {isLoading ? "Loading..." : "Refresh Suggestions"}
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}
