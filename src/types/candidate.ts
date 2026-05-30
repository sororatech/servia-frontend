export type BackendUserBasic = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
};

export type BackendCandidate = {
  id: string;
  user: BackendUserBasic;
  job: string;
  status: string;
  ai_score: number | null;
  applied_at: string;
  updated_at: string;
};

export type BackendCandidateDetail = BackendCandidate & {
  cv_file: string | null;
  cv_filename: string | null;
  cv_status: string | null;
  cv_uploaded_at: string | null;
  video_intro_url: string | null;
  video_uploaded_at: string | null;
  ai_summary: string | null;
  ai_strengths: string[];
  ai_weaknesses: string[];
  ai_skills: string[];
  ai_feedback: string | null;
  ai_confidence: 'high' | 'medium' | 'low' | null;
};

export const CANDIDATE_STATUSES = [
  'applied',
  'screened',
  'shortlisted',
  'video_submitted',
  'interview_scheduled',
  'interviewed',
  'offered',
  'rejected_cv',
  'rejected_interview',
  'hold',
] as const;

export type CandidateStatus = typeof CANDIDATE_STATUSES[number];

export type CandidateListItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  aiScore: number | null;
  status: string;
  appliedAt: string;
  jobId: string;
};

export type CandidateStatusTone =
  | "success"
  | "warning"
  | "danger"
  | "neutral";
