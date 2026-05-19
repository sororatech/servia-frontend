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
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
    ];
    const hash = candidateId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getStatusBadgeClass = (status: string) => {
    const statusClasses: { [key: string]: string } = {
      'applied': 'bg-blue-100 text-blue-700',
      'shortlisted': 'bg-green-100 text-green-700',
      'interviewing': 'bg-purple-100 text-purple-700',
      'rejected': 'bg-red-100 text-red-700',
      'hired': 'bg-teal-100 text-teal-700',
    };
    return statusClasses[status.toLowerCase()] || 'bg-gray-100 text-gray-700';
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
        {applications.map((app) => (
          <Link 
            key={app.id}
            href={`/recruiter/dashboard/candidates/${app.candidate.id}`}
            className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center p-4 rounded-xl transition-colors bg-white/40 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-[#26B9C8]"
          >
            <div className={`w-10 h-10 rounded-full ${getAvatarColor(app.candidate.id)} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
              {getInitials(app.candidate.first_name, app.candidate.last_name)}
            </div>
            
            <div className="min-w-0">
              <span className="font-semibold text-gray-900 hover:text-[#26B9C8] block truncate">
                {app.candidate.first_name} {app.candidate.last_name}
              </span>
              <p className="text-sm text-gray-600 truncate">
                {app.job?.title || 'Unknown Job'}
              </p>
            </div>

            {app.ai_score && (
              <div className="w-16 flex justify-end">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#26B9C8]/20 text-[#26B9C8]">
                  {app.ai_score}%
                </span>
              </div>
            )}
            {!app.ai_score && <div className="w-16" />}

            <div className="w-24 flex justify-center">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(app.status)}`}>
                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
              </span>
            </div>

            <div className="w-28 flex justify-end">
              {app.video_intro_url ? (
                <button 
                  type="button"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#26B9C8] text-white hover:bg-[#26B9C8]/90 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(app.video_intro_url, '_blank');
                  }}
                  aria-label={`Watch video introduction for ${app.candidate.first_name} ${app.candidate.last_name}`}
                >
                  <Video className="w-3 h-3" aria-hidden="true" />
                  Watch Video
                </button>
              ) : (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-500">
                  <Video className="w-3 h-3" aria-hidden="true" />
                  No Video
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}