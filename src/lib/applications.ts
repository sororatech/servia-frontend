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