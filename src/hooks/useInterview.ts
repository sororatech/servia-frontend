"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import type {
  ApiResponse,
  BackendInterview,
  BackendInterviewConversation,
  BackendJob,
  FollowUpSuggestion,
  LiveInterviewSocketEvent,
  LiveInterviewState,
  TranscriptEntry,
} from "@/types/api";
import { unwrapCollection } from "@/lib/responseUtils";
import type { PaginatedResponse } from "@/lib/responseUtils";
import useWebSocket from "@/hooks/useWebSocket";

const WS_OPEN = 1;
const REFRESH_INTERVAL_MS = 5000;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type UseInterviewResult = {
  interview: LiveInterviewState;
  isLoading: boolean;
  error: string | null;
  streamStatus: "connected" | "disconnected";
  refresh: () => Promise<void>;
  endInterview: () => boolean;
};

type BackendCandidate = {
  id: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
};


function createEmptyInterview(interviewId: string): LiveInterviewState {
  return {
    interviewId,
    candidateName: "",
    candidateEmail: "",
    candidateRole: "",
    currentQuestion: "",
    transcript: [],
    followUpSuggestions: [],
    notes: "",
    recordingTime: "00:00",
    status: "idle",
  };
}

function formatClock(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function formatDuration(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function mapSpeaker(
  speaker: BackendInterviewConversation["speaker"],
): TranscriptEntry["speaker"] {
  if (speaker === "candidate") {
    return "Candidate";
  }

  if (speaker === "recruiter") {
    return "Recruiter";
  }

  return "AI";
}

function stableEntryId(timestamp: string): number {
  const ms = new Date(timestamp).getTime();
  return Number.isNaN(ms) ? Date.now() : ms;
}

function mapConversationEntry(
  entry: BackendInterviewConversation,
  _index: number,
): TranscriptEntry {
  return {
    id: stableEntryId(entry.timestamp),
    speaker: mapSpeaker(entry.speaker),
    time: formatClock(entry.timestamp),
    text: entry.text,
  };
}

function mergeTranscriptEntries(
  currentEntries: TranscriptEntry[],
  incomingEntry: TranscriptEntry,
) {
  const nextEntries = currentEntries.filter((entry) => entry.id !== incomingEntry.id);
  nextEntries.push(incomingEntry);
  return nextEntries.sort((left, right) => left.id - right.id);
}

function deriveWebSocketUrl(interviewId: string) {
  const configuredUrl =
    process.env.NEXT_PUBLIC_WS_URL ?? process.env.NEXT_PUBLIC_WS_BASE_URL;

  if (configuredUrl) {
    const baseUrl = configuredUrl.replace(/\/$/, "");
    return `${baseUrl}/${interviewId}/`;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return null;
  }

  const normalizedApiUrl = apiUrl.replace(/^http/, "ws").replace(/\/$/, "");
  return `${normalizedApiUrl}/ws/interview/${interviewId}/`;
}

function getWsProtocols(): string[] | undefined {
  const token = process.env.NEXT_PUBLIC_AUTH_TOKEN;
  return token ? ["auth", token] : undefined;
}

function isValidInterviewId(interviewId: string) {
  return UUID_PATTERN.test(interviewId);
}

function mapBackendStatus(status: string): LiveInterviewState["status"] {
  if (status === "in_progress" || status === "connected") {
    return "live";
  }

  if (status === "completed") {
    return "ended";
  }

  return "idle";
}

function formatCandidateName(candidate: BackendCandidate | null) {
  if (!candidate) {
    return "";
  }

  const fullName =
    `${candidate.user.first_name} ${candidate.user.last_name}`.trim();

  return fullName || candidate.user.email || "";
}


export default function useInterview(interviewId: string): UseInterviewResult {
  const [interview, setInterview] = useState<LiveInterviewState>(() =>
    createEmptyInterview(interviewId),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startedAtMs, setStartedAtMs] = useState<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const hasValidInterviewId = useMemo(() => isValidInterviewId(interviewId), [interviewId]);

  const webSocketUrl = useMemo(
    () => (hasValidInterviewId ? deriveWebSocketUrl(interviewId) : null),
    [hasValidInterviewId, interviewId],
  );
  const wsProtocols = useMemo(() => getWsProtocols(), []);
  const { lastMessage, readyState, error: socketError, sendMessage } =
    useWebSocket<LiveInterviewSocketEvent>(webSocketUrl, {
      enabled: Boolean(webSocketUrl),
      protocols: wsProtocols,
    });

  const endInterview = useCallback(() => {
    const sent = sendMessage({
      type: "meeting_ended",
      interview_id: interviewId,
      timestamp: new Date().toISOString(),
    });

    if (sent) {
      setInterview((currentInterview) => ({
        ...currentInterview,
        status: "ended",
      }));
    }

    return sent;
  }, [interviewId, sendMessage]);

  const refresh = useCallback(async () => {
    if (!hasValidInterviewId) {
      setError("This live interview link is invalid. Open a real session from the recruiter interviews page.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [interviewResponse, conversationsResponse] = await Promise.all([
        api.get<ApiResponse<BackendInterview> | BackendInterview>(
          `/interviews/interviews/${interviewId}/`,
        ),
        api.get<
          ApiResponse<BackendInterviewConversation[]> | BackendInterviewConversation[]
        >(`/interviews/conversations/?interview=${interviewId}`),
      ]);

      const interviewPayload =
        "data" in interviewResponse.data
          ? interviewResponse.data.data
          : interviewResponse.data;
      const conversationPayload = unwrapCollection(
        conversationsResponse.data as
          | ApiResponse<BackendInterviewConversation[]>
          | PaginatedResponse<BackendInterviewConversation>
          | BackendInterviewConversation[],
      );
      const filteredConversations = conversationPayload.items.filter(
        (conversation) => conversation.interview === interviewId,
      );

      setInterview((currentInterview) => ({
        ...currentInterview,
        interviewId,
        currentQuestion: "",
        transcript: filteredConversations.map(mapConversationEntry),
        followUpSuggestions: [],
        notes: "",
        recordingTime: currentInterview.recordingTime,
        status: mapBackendStatus(interviewPayload.status),
      }));
      setError(null);
      if (interviewPayload.status === "in_progress" && startedAtRef.current === null) {
        const now = Date.now();
        startedAtRef.current = now;
        setStartedAtMs(now);
      }

      const [candidateResult, jobResult] = await Promise.allSettled([
        api.get<ApiResponse<BackendCandidate> | BackendCandidate>(
          `/candidates/candidates/${interviewPayload.candidate}/`,
        ),
        api.get<ApiResponse<BackendJob> | BackendJob>(
          `/jobs/jobs/${interviewPayload.job}/`,
        ),
      ]);

      setInterview((currentInterview) => {
        let candidateName = currentInterview.candidateName;
        let candidateEmail = currentInterview.candidateEmail;
        let candidateRole = currentInterview.candidateRole;

        if (candidateResult.status === "fulfilled") {
          const candidatePayload =
            "data" in candidateResult.value.data
              ? candidateResult.value.data.data
              : candidateResult.value.data;
          candidateName = formatCandidateName(candidatePayload);
          candidateEmail = candidatePayload.user.email || "";
        }

        if (jobResult.status === "fulfilled") {
          const jobPayload =
            "data" in jobResult.value.data
              ? jobResult.value.data.data
              : jobResult.value.data;
          candidateRole = jobPayload.title || "";
        }

        return {
          ...currentInterview,
          candidateName,
          candidateEmail,
          candidateRole,
        };
      });
    } catch {
      setError("Waiting for live interview data from the backend.");
    } finally {
      setIsLoading(false);
    }
  }, [hasValidInterviewId, interviewId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!hasValidInterviewId) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void refresh();
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [hasValidInterviewId, refresh]);

  useEffect(() => {
    if (!hasValidInterviewId || readyState !== WS_OPEN) {
      return;
    }

    if (startedAtRef.current === null) {
      const now = Date.now();
      startedAtRef.current = now;
      setStartedAtMs(now);
    }

    setInterview((currentInterview) => ({
      ...currentInterview,
      status: currentInterview.status === "ended" ? currentInterview.status : "live",
    }));

    void refresh();
  }, [hasValidInterviewId, readyState, refresh, startedAtMs]);

  useEffect(() => {
    if (interview.status !== "live" || startedAtMs === null) {
      return;
    }

    const updateTimer = () => {
      const elapsedSeconds = Math.floor((Date.now() - startedAtMs) / 1000);
      setInterview((currentInterview) => ({
        ...currentInterview,
        recordingTime: formatDuration(elapsedSeconds),
      }));
    };

    updateTimer();
    const intervalId = window.setInterval(updateTimer, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [interview.status, startedAtMs]);

  useEffect(() => {
    if (!lastMessage) {
      return;
    }

    setInterview((currentInterview) => {
      switch (lastMessage.type) {
        case "transcript":
          if (startedAtRef.current === null) {
            const now = Date.now();
            startedAtRef.current = now;
            setStartedAtMs(now);
          }
          return {
            ...currentInterview,
            transcript: mergeTranscriptEntries(
              currentInterview.transcript,
              {
                id: stableEntryId(lastMessage.timestamp ?? ""),
                speaker: mapSpeaker(lastMessage.speaker),
                time: formatClock(lastMessage.timestamp ?? ""),
                text: lastMessage.text || lastMessage.message || "",
              },
            ),
            status: "live",
          };
        case "follow_up_questions":
          return {
            ...currentInterview,
            followUpSuggestions: lastMessage.questions.map((question, index) => ({
              id: `${index}-${question}`,
              text: question,
            })),
          };
        case "interview_status":
          return {
            ...currentInterview,
            status: mapBackendStatus(lastMessage.status),
          };
        case "interview_analysis_ready":
          return {
            ...currentInterview,
            notes:
              lastMessage.analysis?.overall_summary ?? currentInterview.notes,
          };
        default:
          return currentInterview;
      }
    });
  }, [lastMessage]);

  return {
    interview,
    isLoading,
    error:
      hasValidInterviewId &&
      readyState === WS_OPEN &&
      interview.transcript.length === 0
        ? socketError
        : error ?? socketError,
    streamStatus: readyState === WS_OPEN ? "connected" : "disconnected",
    refresh,
    endInterview,
  };
}
