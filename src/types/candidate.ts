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

export type BackendJobSummary = {
  id: string;
  title: string;
  department?: string;
};

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
