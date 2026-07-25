'use client';

import Link from 'next/link';
import { Video } from 'lucide-react';
import { DASHBOARD_RECENT_LIMIT } from '@/hooks/useDashboardData';

interface RecentApplication {
  id: string;
  candidate: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  job: {
    id: string;
    title: string;
  };
  applied_at: string;
  status: string;
  ai_score?: number;
  video_intro_url?: string;
}

interface Props {
  applications: RecentApplication[];
}

export default function RecentApplications({ applications }: Props) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (candidateId: string) => {
    const colors = [
      'bg-[var(--color-status-info-bg)] text-[var(--color-status-info-text)]',
      'bg-[var(--color-status-active-bg)] text-[var(--color-status-active-text)]',
      'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-text)]',
      'bg-[var(--color-status-error-bg)] text-[var(--color-status-error-text)]',
      'bg-[var(--color-teal-light)] text-[var(--color-teal-dark)]',
    ];
    const hash = candidateId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getStatusBadgeClass = (status: string) => {
    const statusClasses: Record<string, string> = {
      applied: 'bg-[var(--color-status-info-bg)] text-[var(--color-status-info-text)]',
      shortlisted: 'bg-[var(--color-status-active-bg)] text-[var(--color-status-active-text)]',
      interviewing: 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-text)]',
      rejected: 'bg-[var(--color-status-error-bg)] text-[var(--color-status-error-text)]',
      hired: 'bg-[var(--color-status-active-bg)] text-[var(--color-status-active-text)]',
    };
    return statusClasses[status.toLowerCase()] || 'bg-[var(--color-warm-surface)] text-[var(--color-text-muted)]';
  };

  const recentApplications = applications.slice(0, DASHBOARD_RECENT_LIMIT);
  const hasMoreApplications = applications.length > DASHBOARD_RECENT_LIMIT;

  if (applications.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[var(--color-warm-bg-deep)] p-8 text-center shadow-sm border-0">
        <p className="text-[var(--color-text-muted)] mb-4">No applications yet</p>
        <Link
          href="/jobs"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-all"
        >
          Browse Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-[var(--color-warm-bg-deep)] p-6 shadow-sm mb-8 border-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-foreground)]">Recent Applications</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Candidates waiting for your review
          </p>
        </div>
        {hasMoreApplications && (
          <Link
            href="/recruiter/dashboard/candidates"
            className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
          >
            View all ({applications.length}) &gt;
          </Link>
        )}
      </div>

      <div className="space-y-3">
        {recentApplications.map((app) => {
          const candidateFullName = `${app.candidate.first_name} ${app.candidate.last_name}`;
          return (
            <Link
              key={app.id}
              href={`/recruiter/dashboard/candidates/${app.id}`}
              className="flex flex-wrap items-center gap-3 p-4 rounded-xl transition-colors bg-[var(--color-warm-bg-page)] dark:bg-[var(--color-warm-surface)] hover:bg-[var(--color-warm-surface)] dark:hover:bg-[var(--color-warm-bg-deep)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer border-0"
            >
              <div
                className={`w-10 h-10 rounded-full ${getAvatarColor(app.candidate.id)} flex items-center justify-center font-semibold text-sm flex-shrink-0`}
              >
                {getInitials(app.candidate.first_name, app.candidate.last_name)}
              </div>

              <div className="flex-1 min-w-0">
                <span className="font-semibold text-[var(--color-foreground)] hover:text-[var(--color-primary)] block truncate">
                  {candidateFullName}
                </span>
                <p className="text-sm text-[var(--color-text-muted)] truncate">
                  {app.job?.title || 'Unknown Job'}
                </p>
              </div>

              <div className="flex-shrink-0 w-16 text-right">
                {app.ai_score ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--color-primary)]/20 text-[var(--color-primary)]">
                    {app.ai_score}%
                  </span>
                ) : (
                  <span className="text-xs text-[var(--color-text-faint)]">—</span>
                )}
              </div>

              <div className="flex-shrink-0 w-24 text-center">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(app.status)}`}>
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </span>
              </div>

              <div className="flex-shrink-0 w-28 text-right">
                {app.video_intro_url ? (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(app.video_intro_url, '_blank');
                    }}
                  >
                    <Video className="w-3 h-3" aria-hidden="true" />
                    Watch Video
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-warm-border)] text-[var(--color-text-muted)]">
                    <Video className="w-3 h-3" aria-hidden="true" />
                    No Video
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}