'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
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

export default function OpenRolesProgress({ roles }: Props) {
  const getProgressColor = (index: number) => {
    const colors = ['#26B9C8', '#0F2A44', '#D4A017'];
    return colors[index % colors.length];
  };

  if (roles.length === 0) {
    return (
      <Card className="p-8 text-center border-0 bg-[#C2B5B5]">
        <p className="text-gray-800 mb-4">No open roles</p>
        <Link
          href="/recruiter/dashboard/jobs/create"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-full border-2 border-[#26B9C8] text-[#26B9C8] hover:bg-[#26B9C8] hover:text-white transition-all"
        >
          Create Job
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-5 border-0 bg-[#C2B5B5]">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-300/50">
        <div className="flex items-center gap-2">
          <Briefcase className="w-8 h-8 pb-2 text-[#26B9C8]" aria-hidden="true" />
          <h2 className="text-xl font-bold text-[#0F2A44]">Open Roles</h2>
        </div>
        <Link
          href="/recruiter/dashboard/jobs"
          className="text-sm font-medium text-[#26B9C8] hover:text-[#26B9C8]/80"
        >
          View all &gt;
        </Link>
      </div>

      <div className="space-y-4">
        {roles.map((role, index) => {
          const progress = role.openings_count > 0
            ? Math.min((role.applications_count / role.openings_count) * 100, 100)
            : 0;
          const barColor = getProgressColor(index);

          return (
            <div key={role.id} className="pb-3 border-b border-gray-300/30 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-[15px] text-black truncate">
                    {role.title}
                  </h5>
                </div>

                <div className="text-right ml-3 flex-shrink-0">
                  <p className="text-sm font-bold" style={{ color: barColor }}>
                    {role.applications_count}
                  </p>
                  <p className="text-xs text-gray-500">applied</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-300/50 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, backgroundColor: barColor }}
                    role="progressbar"
                    aria-valuenow={Math.round(progress)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-3 border-t border-gray-300/50 flex justify-center">
        <Link
          href="/recruiter/dashboard/jobs"
          className="w-64 text-center py-2.5 px-4 rounded-lg bg-[#26B9C8] text-white font-semibold text-sm hover:bg-[#26B9C8]/90 transition-colors shadow-sm"
        >
          View All Roles
        </Link>
      </div>
    </Card>
  );
}