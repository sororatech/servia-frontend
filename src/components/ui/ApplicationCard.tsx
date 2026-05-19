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
      <div className="bg-white rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer border border-gray-100">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-600 font-bold text-lg border border-gray-200">
            {getInitials(company)}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="text-base font-bold text-gray-900 truncate mb-1">{jobTitle}</h3>
            <p className="text-sm text-gray-500 mb-4">
              {company} • Applied {timeAgo}
            </p>
            <ApplicationProgress status={status} />
          </div>
        </div>
      </div>
    </Link>
  );
};