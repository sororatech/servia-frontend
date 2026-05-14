'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Briefcase, Building2 } from 'lucide-react';

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

  const getDepartmentIcon = (department?: string) => {
    switch (department) {
      case 'housekeeping': return Building2;
      case 'kitchen': return Briefcase;
      default: return Building2;
    }
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
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-300/50">
        <div className="flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-[#26B9C8]" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-[#0F2A44]">Open Roles</h2>
        </div>
      </div>

      <div className="space-y-6">
        {roles.map((role, index) => {
          const progress = role.openings_count > 0 
            ? (role.applications_count / role.openings_count) * 100 
            : 0;
          const barColor = getProgressColor(index);
          const Icon = getDepartmentIcon(role.department);
          
          return (
            <div key={role.id} className="pb-4 border-b border-gray-300/30 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#0F2A44]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-[#0F2A44]">{role.title}</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      {role.department?.replace('_', ' ')} • {role.location}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: barColor }}>
                    {role.applications_count}
                  </p>
                  <p className="text-xs text-gray-600">applied</p>
                </div>
              </div>
              
              <div className="w-full bg-gray-300/50 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: barColor }}
                  role="progressbar"
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Roles Button at Bottom */}
      <div className="mt-6 pt-4 border-t border-gray-300/50">
        <Link 
          href="/recruiter/dashboard/jobs" 
          className="block w-full text-center py-2 px-4 rounded-lg bg-[#26B9C8]/10 text-[#26B9C8] font-semibold text-sm hover:bg-[#26B9C8] hover:text-white transition-colors"
        >
          View All Roles
        </Link>
      </div>
    </Card>
  );
}