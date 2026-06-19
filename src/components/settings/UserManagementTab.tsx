'use client';

import { useState } from 'react';
import { Recruiter, Candidate, UserStats } from '@/types/settings';
import RecruitersTable from './RecruitersTable';
import CandidatesTable from './CandidatesTable';
import AddRecruiterModal from './AddRecruiterModal';
import { Button } from '@/components/ui/Button';

function UserStatsCards({ stats }: { stats: UserStats }) {
  const items = [
    { label: 'Total Recruiters', value: stats.total_recruiters },
    { label: 'Active Recruiters', value: stats.active_recruiters },
    { label: 'Total Candidates', value: stats.total_candidates },
    { label: 'New This Week', value: stats.users_this_week },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-[var(--color-warm-border)] bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <p className="text-sm font-semibold text-[var(--color-primary)]">{item.label}</p>
          <p className="mt-2 text-3xl font-bold text-[var(--color-foreground)]">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export default function UserManagementTab({
  initialRecruiters = [],
  initialCandidates = [],
  initialStats = {
    total_recruiters: 0,
    active_recruiters: 0,
    total_candidates: 0,
    users_this_week: 0,
  },
  isEmpty = false,
}: {
  initialRecruiters?: Recruiter[];
  initialCandidates?: Candidate[];
  initialStats?: UserStats;
  isEmpty?: boolean;
}) {
  const [recruiters, setRecruiters] = useState<Recruiter[]>(initialRecruiters ?? []);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleRecruiterAdded = (newRecruiter: Recruiter) => {
    setRecruiters([...recruiters, newRecruiter]);
    setIsAddModalOpen(false);
  };

  const handleRecruiterUpdated = (updatedRecruiter: Recruiter) => {
    setRecruiters(recruiters.map((r) => (r.id === updatedRecruiter.id ? updatedRecruiter : r)));
  };

  const handleRecruiterDeleted = (id: string) => {
    setRecruiters(recruiters.filter((r) => r.id !== id));
  };

  if (isEmpty) {
    return (
      <div className="rounded-2xl border border-[var(--color-warm-border)] bg-white p-12 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
          <svg className="h-8 w-8 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[var(--color-secondary)]">No User Data Available</h3>
        <p className="mt-2 text-[var(--color-text-muted)]">
          Either no users exist yet, or your account doesn&apos;t have permission to view them.
        </p>
        <Button variant="primary" onClick={() => setIsAddModalOpen(true)} className="mt-4">
          + Add First Recruiter
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <UserStatsCards stats={initialStats} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-[var(--color-text-muted)]">
          {recruiters.length} total recruiter accounts
        </p>
        <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
          + Add Recruiter
        </Button>
      </div>

      <RecruitersTable
        recruiters={recruiters}
        onUpdated={handleRecruiterUpdated}
        onDeleted={handleRecruiterDeleted}
      />

      <div>
        <h2 className="mb-4 text-2xl font-bold text-[var(--color-secondary)]">Candidates</h2>
        <CandidatesTable candidates={initialCandidates} />
      </div>

      {isAddModalOpen && (
        <AddRecruiterModal onClose={() => setIsAddModalOpen(false)} onAdded={handleRecruiterAdded} />
      )}
    </div>
  );
}