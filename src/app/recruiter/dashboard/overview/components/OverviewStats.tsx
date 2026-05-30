'use client';

import { Card } from '@/components/ui/card';
import { Users, Star, Calendar, TrendingUp } from 'lucide-react';

interface StatsProps {
  totalCandidates: number;
  shortlisted: number;
  interviewsThisWeek: number;
  avgAiScore: number | null;
}

export default function OverviewStats({ 
  totalCandidates, 
  shortlisted, 
  interviewsThisWeek, 
  avgAiScore 
}: StatsProps) {
  const stats = [
    {
      label: 'Total Candidates',
      value: totalCandidates,
      icon: Users,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Shortlisted',
      value: shortlisted,
      icon: Star,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      label: 'Interviews this week',
      value: interviewsThisWeek,
      icon: Calendar,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      label: 'Avg AI Score',
      value: avgAiScore !== null ? `${avgAiScore}%` : 'N/A',
      icon: TrendingUp,
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={stat.label} 
            className="p-5 hover:shadow-lg transition-shadow border-0 bg-[#C2B5B5]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-800 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-[#26B9C8]">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.iconBg}`}>
                <Icon className={`w-6 h-6 ${stat.iconColor}`} aria-hidden="true" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}