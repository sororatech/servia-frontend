export type Choice = { value: string; label: string };

export type JobFormChoices = {
  departmentCategories: Record<string, Choice[]>;
  departments: Choice[];
  employmentTypes: Choice[];
  shiftTypes: Choice[];
  educationLevels: Choice[];
  suggestedSkills: string[];
};

export type BackendJobSummary = {
  id: string;
  title: string;
  department?: string;
};

export type BackendJob = {
  id: string;
  title: string;
  description: string;
  responsibilities?: string;
  requirements: string;
  department: string;
  shift_type: string;
  employment_type: string;
  location: string;
  is_active: boolean;
  posted_by: string | null;
  created_at: string;
  updated_at: string;
  candidate_count: number;
  shortlisted_count: number;
  openings_count: number;
  openings_remaining: number;
  core_skills: string[];
  education_level?: string;
};

export type JobListItem = {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  isActive: boolean;
  candidateCount: number;
  shortlistedCount: number;
  openingsCount: number;
  openingsRemaining: number;
  postedAt: string;
};

export type CreateJobPayload = {
  title: string;
  description: string;
  responsibilities?: string;
  requirements: string;
  department: string;
  shift_type: string;
  employment_type: string;
  location: string;
  is_active: boolean;
  core_skills?: string[];
  openings_count?: number;
  education_level?: string;
};

export type CreateJobResult =
  | { ok: true; jobId: string }
  | { ok: false; error: string };
