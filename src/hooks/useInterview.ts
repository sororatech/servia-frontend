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
import useWebSocket from "@/hooks/useWebSocket";

const WS_OPEN = 1;
const REFRESH_INTERVAL_MS = 5000;

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

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
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

function mapConversationEntry(
  entry: BackendInterviewConversation,
  index: number,
): TranscriptEntry {
  return {
    id: index + 1,
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
  const authToken = process.env.NEXT_PUBLIC_AUTH_TOKEN;

  if (configuredUrl) {
    const baseUrl = configuredUrl.replace(/\/$/, "");
    const wsUrl = `${baseUrl}/${interviewId}/`;
    return authToken ? `${wsUrl}?token=${authToken}` : wsUrl;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return null;
  }

  const normalizedApiUrl = apiUrl.replace(/^http/, "ws").replace(/\/$/, "");
  const wsUrl = `${normalizedApiUrl}/ws/interview/${interviewId}/`;
  return authToken ? `${wsUrl}?token=${authToken}` : wsUrl;
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

function unwrapCollection<T>(
  payload: ApiResponse<T[]> | PaginatedResponse<T> | T[],
): T[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if ("data" in payload && Array.isArray(payload.data)) {
    return payload.data;
  }

  if ("results" in payload && Array.isArray(payload.results)) {
    return payload.results;
  }

  return [];
}

export default function useInterview(interviewId: string): UseInterviewResult {
  const [interview, setInterview] = useState<LiveInterviewState>(() =>
    createEmptyInterview(interviewId),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startedAtMs, setStartedAtMs] = useState<number | null>(null);
  const startedAtRef = useRef<number | null>(null);

  const webSocketUrl = useMemo(() => deriveWebSocketUrl(interviewId), [interviewId]);
  const { lastMessage, readyState, error: socketError, sendMessage } =
    useWebSocket<LiveInterviewSocketEvent>(webSocketUrl, {
      enabled: Boolean(webSocketUrl),
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
      const filteredConversations = conversationPayload.filter(
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
  }, [interviewId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void refresh();
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refresh]);

  useEffect(() => {
    if (readyState !== WS_OPEN) {
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
  }, [readyState, refresh, startedAtMs]);

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
                id: Date.now(),
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
      readyState === WS_OPEN && interview.transcript.length === 0
        ? socketError
        : error ?? socketError,
    streamStatus: readyState === WS_OPEN ? "connected" : "disconnected",
    refresh,
    endInterview,
  };
}
