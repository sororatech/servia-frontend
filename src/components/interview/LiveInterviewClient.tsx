"use client";

import { useState } from "react";
import { Mic, MicOff, Video, VideoOff, Share2, StickyNote, RefreshCw, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/ui";
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-page-gradient px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <LoadingSkeleton className="h-10 w-96" />
            <LoadingSkeleton className="mt-2 h-5 w-72" />
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <LoadingSkeleton className="h-96 rounded-2xl" />
              <LoadingSkeleton className="h-24 rounded-2xl" />
            </div>
            <div className="space-y-6">
              <LoadingSkeleton className="h-80 rounded-2xl" />
              <LoadingSkeleton className="h-40 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const candidateName = interview.candidateName || initialCandidateName || "Candidate";
  const candidateEmail = interview.candidateEmail || initialCandidateEmail;
  const candidateRole = interview.candidateRole || initialCandidateRole;

  return (
    <main className="min-h-screen bg-page-gradient px-4 py-8 sm:px-6 lg:px-25">
      <div className="mx-auto max-w-8xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-secondary)]">
              Live Interview with {candidateName}
            </h1>
            {(candidateEmail || candidateRole) && (
              <div className="mt-1 space-y-0.5 text-sm text-[var(--color-text-muted)]">
                {candidateEmail && <p>{candidateEmail}</p>}
                {candidateRole && <p>{candidateRole}</p>}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                streamStatus === "connected"
                  ? "border border-[var(--color-teal-border)] bg-[var(--color-teal-light)] text-[var(--color-teal-dark)]"
                  : "border border-[var(--color-warm-border)] bg-white text-[var(--color-text-subtle)]"
              }`}
            >
              {streamStatus === "connected" ? "● Live stream connected" : "○ Waiting for stream"}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              disabled={isLoading}
              aria-label="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Error / control messages */}
        {error && (
          <div className="mb-6 rounded-2xl border border-[var(--color-status-error-border)] bg-[var(--color-status-error-bg)] px-5 py-4 text-sm text-[var(--color-status-error-text)]">
            {error}
          </div>
        )}
        {controlMessage && (
          <div className="mb-6 rounded-2xl border border-[var(--color-teal-border)] bg-[var(--color-teal-light)] px-5 py-4 text-sm text-[var(--color-teal-dark)]">
            {controlMessage}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-[var(--color-warm-border)] bg-white p-6 shadow-sm">
              <LiveTranscript
                currentQuestion={interview.currentQuestion}
                entries={interview.transcript}
                notes={interview.notes}
                recordingTime={interview.recordingTime}
                isLive={interview.status === "live"}
              />
            </div>

            {/* Control buttons row */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--color-warm-border)] bg-white p-5 shadow-sm">
              <Button
                variant="danger"
                onClick={handleEndCall}
                leftIcon={<PhoneOff className="h-5 w-5" />}
                className="min-w-36"
              >
                End Call
              </Button>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant={isMuted ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => {
                    setIsMuted(!isMuted);
                    setControlMessage(`Microphone ${!isMuted ? "muted" : "unmuted"} locally.`);
                  }}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>

                <Button
                  variant={isVideoOff ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => {
                    setIsVideoOff(!isVideoOff);
                    setControlMessage(`Video ${isVideoOff ? "enabled" : "disabled"} locally.`);
                  }}
                  aria-label={isVideoOff ? "Turn on video" : "Turn off video"}
                >
                  {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                </Button>

                <Button variant="secondary" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>

                <Button variant="secondary" size="sm" onClick={handleNotes}>
                  <StickyNote className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-[var(--color-warm-border)] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[var(--color-secondary)]">
                AI Follow-Up Suggestions
              </h2>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                AI-recommended questions for the recruiter
              </p>

              <div className="mt-4 space-y-3">
                {interview.followUpSuggestions.length > 0 ? (
                  interview.followUpSuggestions.map((question) => (
                    <button
                      key={question.id}
                      className="w-full rounded-xl border border-[var(--color-warm-border)] bg-[var(--color-warm-bg)] p-4 text-left text-sm text-[var(--color-text-body)] transition hover:border-[var(--color-primary)] hover:bg-white"
                    >
                      {question.text}
                    </button>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-[var(--color-warm-border-deep)] bg-[var(--color-warm-bg)] p-6 text-center text-sm text-[var(--color-text-subtle)]">
                    {followUpEmptyStateMessage}
                  </div>
                )}
              </div>
            </div>

            <div
              id="interview-notes"
              className="rounded-2xl border border-[var(--color-warm-border)] bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-bold text-[var(--color-secondary)]">
                Interview Notes
              </h2>
              <div className="mt-4 text-sm text-[var(--color-text-muted)]">
                {interview.notes ? (
                  <p className="whitespace-pre-wrap">{interview.notes}</p>
                ) : (
                  <p className="italic">Notes from the live interview will appear here.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--color-warm-border)] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[var(--color-secondary)]">
                Suggested Next Angle
              </h2>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Additional recruiter guidance
              </p>
              <div className="mt-4 text-sm text-[var(--color-text-muted)]">
                <p>
                  Additional recruiter guidance will show up here when live coaching data is available.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}