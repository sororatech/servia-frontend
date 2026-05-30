export type UserRole = 'candidate' | 'recruiter';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  avatar?: string | null;
  location?: string | null;
  department?: string | null;
  phone?: string | null;
  joined_date?: string | null;
  // Candidate-specific
  applications_count?: number;
  cv_status?: string | null;
  pending_actions?: number;  
  // Recruiter-specific
  managed_jobs?: number;
  total_candidates?: number;
  pending_review?: number;
  isAdmin?: boolean; 
}
export interface ProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
  location: string;
  department: string;
  phone: string;
}