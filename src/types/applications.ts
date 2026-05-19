export interface JobSummary {
  id: string;
  title: string;
  department: string;
  location: string;
  department_display?: string;
  employment_type?: string;
  is_active?: boolean;
}

export interface Application {
  id: string;
  status: string;               // e.g., 'applied', 'shortlisted', 'interviewed', 'offered', 'hired', etc.
  applied_at: string;           
  updated_at?: string;
  job: JobSummary | null;
  ai_score?: number | null;
  cv_uploaded_at?: string | null;
  video_uploaded_at?: string | null;
  cv_status?: string;
}

