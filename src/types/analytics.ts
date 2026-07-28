export interface AnalyticsData {
  total_applications: number;
  total_applicants: number;
  avg_ai_fit_score: number;
  acceptance_rate: number;
  ai_fit_score_distribution: { job_title: string; average_score: number }[];
  pipeline_breakdown: { status: string; count: number }[];
  applications_over_time: { day: string; count: number }[];
  applications_by_job: { job_title: string; applications: number }[];
}

export const __analyticsModuleMarker = true;
