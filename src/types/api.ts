export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type TranscriptSpeaker = "AI" | "Candidate" | "Recruiter";

export type TranscriptEntry = {
  id: number;
  speaker: TranscriptSpeaker;
  time: string;
  text: string;
};

export type FollowUpSuggestion = {
  id: string;
  text: string;
};

export type LiveInterviewState = {
  interviewId: string;
  candidateName: string;
  candidateEmail: string;
  candidateRole: string;
  currentQuestion: string;
  transcript: TranscriptEntry[];
  followUpSuggestions: FollowUpSuggestion[];
  notes: string;
  recordingTime: string;
  status: "idle" | "live" | "ended";
};

export type BackendInterview = {
  id: string;
  candidate: string;
  recruiter: string | null;
  job: string;
  scheduled_time: string | null;
  duration_minutes: number;
  stage: string;
  meet_link: string;
  status: string;
  bot_join_status: string;
  created_at: string;
  updated_at: string;
};

export type BackendJob = {
  id: string;
  title: string;
};

export type BackendInterviewConversation = {
  id: string;
  interview: string;
  speaker: "recruiter" | "candidate" | "unknown";
  text: string;
  timestamp: string;
  confidence: number | null;
};

export type LiveInterviewSocketEvent =
  | {
      type: "transcript";
      text: string;
      message?: string;
      speaker: "recruiter" | "candidate" | "unknown";
      timestamp?: string;
      start?: number;
      end?: number;
      interview_id: string;
    }
  | {
      type: "follow_up_questions";
      questions: string[];
      candidate_text?: string;
      context?: string[];
      interview_id: string;
      timestamp?: string;
      automatic?: boolean;
      trigger?: string;
    }
  | {
      type: "interview_status";
      status: "connected" | "analyzing" | "completed" | "analysis_failed";
      interview_id: string;
      timestamp?: string;
    }
  | {
      type: "interview_analysis_ready";
      interview_id: string;
      timestamp?: string;
      analysis?: {
        overall_summary?: string;
      };
    };
