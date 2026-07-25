'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ApplicationProgress } from './ApplicationProgress';

interface ApplicationCardProps {
  id: string;
  jobTitle: string;
  company: string;
  appliedAt: string;
  status: string;
}

export const ApplicationCard = ({ id, jobTitle, company, appliedAt, status }: ApplicationCardProps) => {
  const timeAgo = formatDistanceToNow(new Date(appliedAt), { addSuffix: true });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Link href={`/candidate/applications/${id}`}>
      <div className="bg-white dark:bg-[var(--color-warm-surface)] rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-[var(--color-warm-border)]">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-[var(--color-warm-bg-page)] dark:bg-[var(--color-warm-bg-deep)] rounded-xl flex items-center justify-center text-[var(--color-text-muted)] font-bold text-lg border border-[var(--color-warm-border)]">
            {getInitials(company)}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="text-base font-bold text-[var(--color-foreground)] truncate mb-1">{jobTitle}</h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              {company} • Applied {timeAgo}
            </p>
            <ApplicationProgress status={status} />
          </div>
        </div>
      </div>
    </Link>
  );
};