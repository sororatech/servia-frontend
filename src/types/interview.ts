export type ScheduleInterviewPageProps = {
  params: Promise<{ candidateId: string }>;
  searchParams: Promise<{
    candidateName?: string;
    candidateEmail?: string;
    candidateRole?: string;
    jobId?: string;
    error?: string;
  }>;
};

export type CandidateRecord = {
  id: string;
  job: string;
  status: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
};

export type JobRecord = {
  id: string;
  title: string;
};

export type InterviewRecord = {
  id: string;
  candidate: string;
  job: string;
  recruiter?: string | null;
  recruiter_name?: string;
  scheduled_time: string | null;
  duration_minutes: number;
  stage: string;
  status: string;
  meet_link?: string;
  created_at: string;
  updated_at?: string;
};

export type AIReportRecord = {
  id: string;
  candidate: string;
  interview: string | null;
  report_type: string;
  fit_score: number;
  recommendation: 'hire' | 'hold' | 'reject' | null;
};

export type AIReportDetail = AIReportRecord & {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  feedback: string;
  extracted_skills: string[];
  confidence: 'high' | 'medium' | 'low' | null;
  created_at: string;
};

export type InterviewRow = {
  interviewId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  role: string;
  status: string;
  rawStatus: string;
  recommendation: 'hire' | 'hold' | 'reject' | null;
  score: number | null;
  scheduledTime: string | null;
  meetLink: string;
  recruiterName?: string;
};

export type PageStats = {
  total: number;
  completed: number;
  pending: number;
  avgScore: number | null;
};

export type ShortlistedRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  jobId: string;
};