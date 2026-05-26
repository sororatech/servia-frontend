// src/types/settings.ts
export interface Recruiter {
  id: string;
  user:{
    first_name: string;
    last_name: string;
    email: string;
  }
  department?: string;
  role: 'Admin' | 'Recruiter' | string;
  is_active: boolean;
  last_login: string;
  date_joined: string;
}

export interface Candidate {
  id: string;
  user: {
  first_name: string;
  last_name: string;
  email: string;
  }
  status?: string;
  applied_date?: string;
  date_joined: string;
}

export interface UserStats {
  total_recruiters: number;
  active_recruiters: number;
  total_candidates: number;
  users_this_week: number;
}

export interface SystemConfig {
  shortlist_threshold: number;
  reject_threshold: number;
  interview_recommendation_threshold: number;
  from_email: string;
  support_email: string;
  max_cv_size_mb: number;
  max_video_size_mb: number;
  video_duration_limit_seconds: number;
  application_deadline_default_days: number;
  ai_screening_enabled: boolean;
  live_interviews_enabled: boolean;
  email_notifications_enabled: boolean;
  candidate_self_service_enabled: boolean;
}

export interface SystemHealth {
  uptime_percentage: number;
  status: 'operational' | 'degraded' | 'down';
  last_incident: string | null;
  avg_response_time_ms: number;
  p95_latency_ms: number;
}

export interface ApiUsage {
  date: string;
  requests: number;
  errors: number;
  latency_ms: number;
}

export interface ErrorLog {
  id: string;
  timestamp: string;
  error_type: string;
  endpoint: string;
  user_email: string | null;
  severity: 'critical' | 'error' | 'warning';
  status: 'resolved' | 'unresolved';
  message: string;
}