export const APPLICATION_STAGES = ['APPLIED', 'SHORTLISTED', 'IN REVIEW', 'INTERVIEW', 'OFFER'] as const;
export type ApplicationStage = typeof APPLICATION_STAGES[number];

export const STATUS_TO_STAGE_INDEX: Record<string, number> = {
  'applied': 0,
  'screened': 1,
  'shortlisted': 1,
  'in_review': 2,
  'review': 2,
  'video_submitted': 3,
  'interview_scheduled': 3,
  'interviewed': 3,
  'offered': 4,
  'hired': 4,
  'rejected_cv': -1,
  'rejected_interview': -1,
  'not_selected': -1,
  'withdrawn': -1,
};

export const REJECTED_STATUSES = ['rejected_cv', 'rejected_interview', 'not_selected', 'withdrawn'] as const;
export type RejectedStatus = typeof REJECTED_STATUSES[number];

export const APPLICATION_FILTER_OPTIONS = [
  { value: 'all', label: 'Filter by Status' },
  { value: 'applied', label: 'Applied' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'in_review', label: 'In Review' },
  { value: 'interviewed', label: 'Interview' },
  { value: 'offered', label: 'Offered' },
  { value: 'rejected_cv', label: 'Not Selected' },
] as const;

export const TIME_FORMAT_THRESHOLDS = {
  MINUTES: 1,
  HOURS: 24,
  DAYS_SHORT: 2,
} as const;

export const UI_CONSTANTS = {
  MAX_RECENT_APPS: 5,
  SCROLL_CONTAINER_MAX_HEIGHT: '600px',
} as const;

export const formatStatusDisplay = (status: string): string => {
  if (!status) return 'Unknown';
  const s = status.toLowerCase();
  const map: Record<string, string> = {
    applied: 'Applied',
    screened: 'Screened',
    shortlisted: 'Shortlisted',
    in_review: 'In Review',
    review: 'In Review',
    video_submitted: 'Video Submitted',
    interview_scheduled: 'Interview Scheduled',
    interviewed: 'Interviewed',
    offered: 'Offered',
    hired: 'Hired',
    rejected_cv: 'Not Selected',
    rejected_interview: 'Not Selected',
    not_selected: 'Not Selected',
    withdrawn: 'Withdrawn',
    processing: 'Processing',
    analyzed: 'Analyzed',
    pending: 'Pending',
  };
  return map[s] || s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export const getStatusBadgeClass = (status: string): string => {
  if (!status) return 'bg-gray-100 text-gray-600';
  const s = status.toLowerCase();
  if (['rejected_cv', 'rejected_interview', 'not_selected', 'withdrawn'].includes(s)) return 'bg-gray-100 text-gray-600';
  if (['offered', 'hired'].includes(s)) return 'bg-green-100 text-green-700';
  if (['interview_scheduled', 'interviewed', 'video_submitted'].includes(s)) return 'bg-purple-100 text-purple-700';
  if (['shortlisted', 'in_review', 'review', 'screened'].includes(s)) return 'bg-blue-100 text-blue-700';
  return 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]';
};

export const WITHDRAWABLE_STATUSES = [
  'applied', 'screened', 'shortlisted', 'video_submitted',
  'interview_scheduled', 'interviewed', 'offered', 'hold'
];

export const canWithdraw = (status: string): boolean => {
  return WITHDRAWABLE_STATUSES.includes(status?.toLowerCase());
};