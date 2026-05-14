'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Video } from 'lucide-react';

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
}

interface Props {
  applications: RecentApplication[];
}

export default function RecentApplications({ applications }: Props) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
    ];
    return colors[index % colors.length];
  };

  if (applications.length === 0) {
    return (
      <Card className="p-8 text-center border-0 bg-[#C2B5B5]">
        <p className="text-gray-800 mb-4">No applications yet</p>
        <Link 
          href="/jobs"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-full border-2 border-[#26B9C8] text-[#26B9C8] hover:bg-[#26B9C8] hover:text-white transition-all"
        >
          Browse Jobs
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-5 mb-6 border-0 bg-[#C2B5B5]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#0F2A44]">Recent Applications</h2>
          <p className="text-sm text-gray-800 mt-1">Candidates waiting for your review</p>
        </div>
        <Link 
          href="/recruiter/dashboard/candidates" 
          className="text-sm font-medium text-[#26B9C8] hover:text-[#26B9C8]/80"
        >
          View all &gt;
        </Link>
      </div>

      <div className="space-y-3">
        {applications.map((app, index) => (
          <div 
            key={app.id}
            // Default bg is transparent/white-ish, Hover bg is light blue
            className="flex items-center justify-between p-4 rounded-xl transition-colors bg-white/40 hover:bg-blue-50 cursor-pointer"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className={`w-10 h-10 rounded-full ${getAvatarColor(index)} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                {getInitials(app.candidate.first_name, app.candidate.last_name)}
              </div>
              <div className="flex-1 min-w-0">
                <Link 
                  href={`/recruiter/dashboard/candidates/${app.candidate.id}`}
                  className="font-semibold text-gray-900 hover:text-[#26B9C8] block truncate"
                >
                  {app.candidate.first_name} {app.candidate.last_name}
                </Link>
                <p className="text-sm text-gray-600 truncate">
                  {app.job?.title || 'Front Desk Manager'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {app.ai_score && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#26B9C8]/20 text-[#26B9C8]">
                  {app.ai_score}%
                </span>
              )}
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Shortlisted
              </span>
              <button className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#26B9C8]/20 text-[#26B9C8] hover:bg-[#26B9C8] hover:text-white transition-colors">
                <Video className="w-3 h-3" />
                Video
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}