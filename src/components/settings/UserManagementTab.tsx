// src/components/settings/UserManagementTab.tsx
'use client';

import { useState } from 'react';
import { Recruiter, Candidate, UserStats } from '@/types/settings';
import UserStatsCards from './UserStatsCards';
import RecruitersTable from './RecruitersTable';
import CandidatesTable from './CandidatesTable';
import AddRecruiterModal from './AddRecruiterModal';
import { Button } from '@/components/ui/Button';

export default function UserManagementTab({
  initialRecruiters = [],
  initialCandidates = [],
  initialStats = {
    total_recruiters: 0,
    active_recruiters: 0,
    total_candidates: 0,
    users_this_week: 0,
  },
  isEmpty = false, // ✅ New prop for empty state
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
    setRecruiters(recruiters.map(r => r.id === updatedRecruiter.id ? updatedRecruiter : r));
  };

  const handleRecruiterDeleted = (id: string) => {
    setRecruiters(recruiters.filter(r => r.id !== id));
  };

  // ✅ Show helpful message when data is empty due to permissions
  if (isEmpty) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white/85 p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#26b9c8]/10">
          <svg className="h-8 w-8 text-[#26b9c8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-[#171717]">No User Data Available</h3>
        <p className="mt-2 text-[#635b55]">
          Either no users exist yet, or your account doesn&apos;t have permission to view them.
        </p>
        <Button onClick={() => setIsAddModalOpen(true)} className="mt-4">
          + Add First Recruiter
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <UserStatsCards stats={initialStats} />
      
      <div className="flex items-center justify-between">
        <p className="text-lg text-[#635b55]">{recruiters.length} total recruiter accounts</p>
        <Button onClick={() => setIsAddModalOpen(true)}>+ Add Recruiter</Button>
      </div>
      
      <RecruitersTable
        recruiters={recruiters}
        onUpdated={handleRecruiterUpdated}
        onDeleted={handleRecruiterDeleted}
      />

      <div>
        <h2 className="mb-4 text-2xl font-semibold text-[#171717]">Candidates</h2>
        <CandidatesTable candidates={initialCandidates} />
      </div>

      {isAddModalOpen && (
        <AddRecruiterModal onClose={() => setIsAddModalOpen(false)} onAdded={handleRecruiterAdded} />
      )}
    </div>
  );
}