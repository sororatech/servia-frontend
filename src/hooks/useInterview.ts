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
import { AUTH_STORAGE } from "@/lib/auth";

const WS_OPEN = 1;
const REFRESH_INTERVAL_MS = 5000;
const ANALYZING_NOTES = "Generating interview summary...";
const ANALYSIS_FAILED_NOTES =
  "Interview summary could not be generated. Try refreshing in a moment.";
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


type BackendAIReport = {
  id: string;
  interview: string | null;
  report_type: string;
  fit_score: number;
  summary: string;
  recommendation: string | null;
};

function formatInterviewNotes(
  analysis:
    | {
        summary?: string;
        fit_score?: number;
        recommendation?: string | null;
      }
    | null
    | undefined,
): string {
  const summary = analysis?.summary?.trim();
  if (!summary) {
    return "";
  }

  const parts = [summary];
  if (analysis?.recommendation) {
    const labels: Record<string, string> = {
      hire: "Hire",
      hold: "Hold",
      reject: "Reject",
    };
    const label = labels[analysis.recommendation] ?? analysis.recommendation;
    const score =
      typeof analysis.fit_score === "number"
        ? ` · ${analysis.fit_score}/100 fit`
        : "";
    parts.push(`Recommendation: ${label}${score}.`);
  }

  return parts.join("\n\n");
}

async function fetchInterviewAnalysisNotes(interviewId: string): Promise<string> {
  try {
    const response = await api.get<
      ApiResponse<BackendAIReport[]> | BackendAIReport[]
    >(
      `/ai-reports/reports/?interview=${interviewId}&report_type=interview_analysis`,
    );
    const payload = unwrapCollection(
      response.data as
        | ApiResponse<BackendAIReport[]>
        | PaginatedResponse<BackendAIReport>
        | BackendAIReport[],
    );
    const report = payload.items.find(
      (item) => item.interview === interviewId && item.report_type === "interview_analysis",
    );
    return formatInterviewNotes(report);
  } catch {
    return "";
  }
}

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

function timestampSortKey(timestamp: string): number {
  const ms = new Date(timestamp).getTime();
  return Number.isNaN(ms) ? Date.now() : ms;
}

function mapConversationEntry(
  entry: BackendInterviewConversation,
  _index: number,
): TranscriptEntry {
  return {
    id: entry.id,
    speaker: mapSpeaker(entry.speaker),
    time: formatClock(entry.timestamp),
    text: entry.text,
    sortAt: timestampSortKey(entry.timestamp),
  };
}

function liveTranscriptEntryId(
  message: Extract<LiveInterviewSocketEvent, { type: "transcript" }>,
): string {
  const text = message.text || message.message || "";
  if (typeof message.start === "number" && typeof message.end === "number") {
    return `live-${message.start}-${message.end}-${message.speaker}`;
  }
  return `live-${message.timestamp ?? "unknown"}-${message.speaker}-${text.slice(0, 48)}`;
}

function mergeTranscriptEntries(
  currentEntries: TranscriptEntry[],
  incomingEntry: TranscriptEntry,
) {
  const nextEntries = currentEntries.filter((entry) => entry.id !== incomingEntry.id);
  nextEntries.push(incomingEntry);
  return nextEntries.sort((left, right) => left.sortAt - right.sortAt);
}

// REST polling fetches the persisted transcript, which uses real DB ids — different
// from the "live-..." placeholder ids used for entries pushed over the WebSocket
// before they're saved. Replacing the array outright on every poll would unmount
// and remount those recent lines under a new key, flickering the live view. Instead,
// keep the persisted entries as the source of truth and only retain WebSocket-only
// entries that are genuinely ahead of what's been persisted so far.
function mergeRestTranscript(
  currentEntries: TranscriptEntry[],
  persistedEntries: TranscriptEntry[],
) {
  const persistedIds = new Set(persistedEntries.map((entry) => entry.id));
  const latestPersistedSortAt = persistedEntries.reduce(
    (max, entry) => Math.max(max, entry.sortAt),
    -Infinity,
  );
  const aheadLiveEntries = currentEntries.filter(
    (entry) =>
      entry.id.startsWith("live-") &&
      !persistedIds.has(entry.id) &&
      entry.sortAt > latestPersistedSortAt,
  );
  return [...persistedEntries, ...aheadLiveEntries].sort(
    (left, right) => left.sortAt - right.sortAt,
  );
}

function deriveWebSocketUrl(interviewId: string) {
  const configuredUrl =
    process.env.NEXT_PUBLIC_WS_URL ?? process.env.NEXT_PUBLIC_WS_BASE_URL;

  let baseUrl: string | null = null;
  if (configuredUrl) {
    baseUrl = configuredUrl.replace(/\/$/, "");
  } else if (process.env.NEXT_PUBLIC_API_URL) {
    baseUrl = `${process.env.NEXT_PUBLIC_API_URL.replace(/^http/, "ws").replace(/\/$/, "")}/ws/interview`;
  }

  if (!baseUrl) {
    return null;
  }

  const url = `${baseUrl}/${interviewId}/`;
  if (typeof window === "undefined") {
    return url;
  }

  const token = AUTH_STORAGE.getWebSocketToken();
  if (!token) {
    return url;
  }

  return `${url}?token=${encodeURIComponent(token)}`;
}

function isValidInterviewId(interviewId: string) {
  return UUID_PATTERN.test(interviewId);
}

function mapBackendStatus(status: string): LiveInterviewState["status"] {
  if (status === "in_progress" || status === "connected") {
    return "live";
  }

  if (status === "completed" || status === "analyzing") {
    return "ended";
  }

  return "idle";
}

function mapFollowUpSuggestions(
  payload: { questions?: string[] } | null | undefined,
): FollowUpSuggestion[] {
  const questions = payload?.questions ?? [];
  if (!questions.length) {
    return [];
  }

  return questions.map((question, index) => ({
    id: `${index}-${question}`,
    text: question,
  }));
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
  const [webSocketUrl, setWebSocketUrl] = useState<string | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const isRefreshingRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const hasValidInterviewId = useMemo(() => isValidInterviewId(interviewId), [interviewId]);

  useEffect(() => {
    if (!hasValidInterviewId) {
      setWebSocketUrl(null);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch(`/api/interviews/${interviewId}/ws-url`, {
          credentials: "include",
          cache: "no-store",
        });

        if (response.ok) {
          const payload = (await response.json()) as { url?: string };
          if (!cancelled && payload.url) {
            setWebSocketUrl(payload.url);
            return;
          }
        }
      } catch {
        // Fall back to client-side URL construction below.
      }

      if (!cancelled) {
        setWebSocketUrl(deriveWebSocketUrl(interviewId));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hasValidInterviewId, interviewId]);

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
        notes: ANALYZING_NOTES,
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

    // Guard against overlapping calls: a slow refresh (network latency) combined
    // with a fixed polling tick can otherwise pile up concurrent in-flight
    // requests that never let the page settle.
    if (isRefreshingRef.current) {
      return;
    }
    isRefreshingRef.current = true;

    // Only show the full loading state for the initial fetch — background
    // polling refreshes should update data quietly without flickering the
    // whole page back to a loading skeleton.
    if (!hasLoadedRef.current) {
      setIsLoading(true);
    }
    try {
      const [interviewResponse, conversationsResponse, followUpsResponse] = await Promise.all([
        api.get<ApiResponse<BackendInterview> | BackendInterview>(
          `/interviews/interviews/${interviewId}/`,
        ),
        api.get<
          ApiResponse<BackendInterviewConversation[]> | BackendInterviewConversation[]
        >(`/interviews/conversations/?interview=${interviewId}`),
        api
          .get<
            ApiResponse<{ questions?: string[] }> | { questions?: string[] }
          >(`/interviews/interviews/${interviewId}/follow-ups/`)
          .catch(() => null),
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
      const followUpPayload =
        followUpsResponse &&
        ("data" in followUpsResponse.data
          ? followUpsResponse.data.data
          : followUpsResponse.data);

      const mappedStatus = mapBackendStatus(interviewPayload.status);
      let analysisNotes = "";
      if (mappedStatus === "ended" && interviewPayload.status === "completed") {
        analysisNotes = await fetchInterviewAnalysisNotes(interviewId);
      }

      setInterview((currentInterview) => ({
        ...currentInterview,
        interviewId,
        currentQuestion: "",
        transcript: mergeRestTranscript(
          currentInterview.transcript,
          filteredConversations.map(mapConversationEntry),
        ),
        followUpSuggestions: mapFollowUpSuggestions(followUpPayload),
        notes: analysisNotes || currentInterview.notes,
        recordingTime: currentInterview.recordingTime,
        status: mappedStatus,
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
      isRefreshingRef.current = false;
      hasLoadedRef.current = true;
      setIsLoading(false);
    }
  }, [hasValidInterviewId, interviewId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!hasValidInterviewId || interview.status === "ended") {
      return;
    }

    const intervalId = window.setInterval(() => {
      void refresh();
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [hasValidInterviewId, interview.status, refresh]);

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
                id: liveTranscriptEntryId(lastMessage),
                speaker: mapSpeaker(lastMessage.speaker),
                time: formatClock(lastMessage.timestamp ?? ""),
                text: lastMessage.text || lastMessage.message || "",
                sortAt:
                  typeof lastMessage.start === "number"
                    ? lastMessage.start * 1000
                    : timestampSortKey(lastMessage.timestamp ?? ""),
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
        case "session_started":
          if (startedAtRef.current === null) {
            const now = Date.now();
            startedAtRef.current = now;
            setStartedAtMs(now);
          }
          return {
            ...currentInterview,
            transcript: [],
            followUpSuggestions: [],
            currentQuestion: "",
            notes: "",
            status: "live",
          };
        case "interview_status":
          if (lastMessage.status === "analyzing") {
            return {
              ...currentInterview,
              status: "ended",
              notes: ANALYZING_NOTES,
            };
          }
          if (lastMessage.status === "analysis_failed") {
            return {
              ...currentInterview,
              status: "ended",
              notes: ANALYSIS_FAILED_NOTES,
            };
          }
          return {
            ...currentInterview,
            status: mapBackendStatus(lastMessage.status),
          };
        case "interview_analysis_ready":
          return {
            ...currentInterview,
            status: "ended",
            notes: formatInterviewNotes(lastMessage.analysis) || currentInterview.notes,
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
      readyState === WS_OPEN
        ? error
        : interview.transcript.length > 0
          ? error
          : (error ?? socketError),
    streamStatus: readyState === WS_OPEN ? "connected" : "disconnected",
    refresh,
    endInterview,
  };
}
