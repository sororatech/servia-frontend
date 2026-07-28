export type ApplicationStatus = 
  | 'applied' 
  | 'submitted' 
  | 'under_review' 
  | 'review' 
  | 'interview' 
  | 'accepted' 
  | 'hired' 
  | 'rejected' 
  | string;

export const getStatusColor = (status: ApplicationStatus): string => {
  const normalized = status?.toLowerCase() || '';
  
  const statusMap: Record<string, string> = {
    applied: 'text-teal-600',
    submitted: 'text-teal-600',
    under_review: 'text-blue-600',
    review: 'text-blue-600',
    interview: 'text-purple-600',
    accepted: 'text-green-600',
    hired: 'text-green-600',
    rejected: 'text-red-600',
  };
  
  return statusMap[normalized] || 'text-gray-600';
};

export const getProgressWidth = (status: ApplicationStatus): string => {
  const normalized = status?.toLowerCase() || '';
  
  const progressMap: Record<string, string> = {
    applied: 'w-1/3',
    submitted: 'w-1/3',
    under_review: 'w-2/3',
    review: 'w-2/3',
    interview: 'w-full',
    accepted: 'w-full',
    hired: 'w-full',
  };
  
  return progressMap[normalized] || 'w-1/3';
};

export const formatStatus = (status: string): string => {
  return status.replace(/_/g, ' ').toUpperCase();
};

export const extractJobInfo = (job: string | Record<string, any> | null): Record<string, any> | null => {
  if (!job || typeof job === 'string') return null;
  
  return {
    title: job.title || job.position_title || job.role || 'Position Applied',
    department: job.department || job.company || job.organization || 'Servia Hotels',
    location: job.location || job.work_location || '',
    company: job.company,
    recruiter: job.recruiter || job.hiring_manager || job.contact_person || null,
  };
};

export const extractRecruiterInfo = (data: any): Record<string, string> | null => {
  if (!data) return null;
  
  let recruiter = null;
  
  if (Array.isArray(data) && data.length > 0) {
    recruiter = data[0];
  } else if (data?.results && Array.isArray(data.results) && data.results.length > 0) {
    recruiter = data.results[0];
  } else if (data?.name || data?.full_name) {
    recruiter = data;
  }
  
  if (!recruiter) return null;
  
  return {
    name: recruiter.name || recruiter.full_name || 'Talent Team',
    title: recruiter.title || recruiter.role || 'Servia Hotels',
    quote: recruiter.quote || recruiter.bio || recruiter.description || "We've received your application!",
  };
};

export const DEFAULT_RECRUITER = {
  name: 'Talent Team',
  title: 'Servia Hotels',
  quote: "We've received your application! Our team is currently reviewing candidates who align with our vision of high-stakes professional introduction.",
};