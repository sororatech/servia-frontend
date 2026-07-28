'use client';

import Link from 'next/link';
import { Briefcase } from 'lucide-react';

interface OpenRole {
  id: string;
  title: string;
  department?: string;
  location?: string;
  openings_count: number;
  applications_count: number;
}

interface Props {
  roles: OpenRole[];
}

const HIGH_FILL_THRESHOLD = 80;
const MEDIUM_FILL_THRESHOLD = 40;

export default function OpenRolesProgress({ roles }: Props) {
  const getProgressColor = (progress: number) => {
    if (progress >= HIGH_FILL_THRESHOLD) return 'var(--color-primary)'; 
    if (progress >= MEDIUM_FILL_THRESHOLD) return 'var(--color-primary-hover)'; 
    return 'var(--color-status-warning-text)'; 
  };

  if (roles.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[var(--color-warm-bg-deep)] shadow-sm border-0 rounded-2xl">
        <p className="text-[var(--color-text-muted)] mb-4">No open roles</p>
        <Link
          href="/recruiter/dashboard/jobs/create"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-all"
        >
          Create Job
        </Link>
      </div>
    );
  }

  return (
    <div className="p-5 bg-white dark:bg-[var(--color-warm-bg-deep)] shadow-sm border-0 rounded-2xl">
      <div className="flex items-center justify-between mb-5 pb-3">
        <div className="flex items-center gap-2">
          <Briefcase className="w-8 h-8 pb-2 text-[var(--color-primary)]" aria-hidden="true" />
          <h2 className="text-xl font-bold text-[var(--color-foreground)]">Open Roles</h2>
        </div>
        <Link
          href="/recruiter/dashboard/jobs"
          className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
        >
          View all &gt;
        </Link>
      </div>

      <div className="space-y-5">
        {roles.map((role) => {
          const progress = role.openings_count > 0
            ? Math.min((role.applications_count / role.openings_count) * 100, 100)
            : 0;
          const barColor = getProgressColor(progress);

          return (
            <div key={role.id} className="pb-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-[15px] text-[var(--color-foreground)] truncate">
                    {role.title}
                  </h5>
                </div>

                <div className="text-right ml-3 flex-shrink-0">
                  <p className="text-sm font-bold" style={{ color: barColor }}>
                    {role.applications_count}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">applied</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 bg-[var(--color-warm-border)] rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, backgroundColor: barColor }}
                    role="progressbar"
                    aria-valuenow={Math.round(progress)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${role.title}: ${Math.round(progress)}% of openings filled`}
                  />
                </div>
                <span className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-3 flex justify-center">
        <Link
          href="/recruiter/dashboard/jobs"
          className="w-64 text-center py-2.5 px-4 rounded-lg bg-[var(--color-primary)] text-white font-semibold text-sm hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm"
        >
          View All Roles
        </Link>
      </div>
    </div>
  );
}