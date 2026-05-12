export type JobType = 'full-time' | 'part-time' | 'contract' | string;

export const normalizeJobType = (type: string): JobType => {
  return type?.toLowerCase().replace('_', '-') || 'full-time';
};

export const formatPostedDate = (dateStr?: string): string => {
  if (!dateStr) return 'Recently Posted';
  
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

export const formatDeadlineText = (deadline?: string | null): { text: string; className: string } | null => {
  if (!deadline) return null;
  
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { text: 'Closed', className: 'text-gray-400' };
  if (diffDays === 0) return { text: '• Closes today', className: 'text-red-500 font-medium' };
  if (diffDays === 1) return { text: '• 1 day left', className: 'text-orange-500 font-medium' };
  if (diffDays <= 3) return { text: `• ${diffDays} days left`, className: 'text-orange-500' };
  if (diffDays <= 7) return { text: `• ${diffDays} days left`, className: 'text-yellow-600' };
  return { text: `• ${diffDays} days remaining`, className: 'text-green-400' };
};

export const formatSalary = (job: {
  salary?: string;
  salary_range?: string;
  salary_min?: number | string;
  salary_max?: number | string;
  salary_currency?: string;
  salary_period?: string;
}): { amount: string; detail: string } => {
  const amount = job.salary_range || job.salary || 
    (job.salary_min && job.salary_max ? `${job.salary_min} - ${job.salary_max}` : 'Not specified');
  
  const currency = job.salary_currency || '';
  const period = job.salary_period || '';
  const detail = currency || period ? `${currency}/${period}` : '';
  
  return { amount, detail };
};

export const cleanRequirement = (req: string): string => {
  return req.replace(/^[\s•\-\*]+/, '').trim();
};