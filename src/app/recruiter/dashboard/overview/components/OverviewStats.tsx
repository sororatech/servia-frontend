'use client';

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
      iconBg: 'bg-[var(--color-status-info-bg)]',
      iconColor: 'text-[var(--color-status-info-text)]',
    },
    {
      label: 'Shortlisted',
      value: shortlisted,
      icon: Star,
      iconBg: 'bg-[var(--color-status-active-bg)]',
      iconColor: 'text-[var(--color-status-active-text)]',
    },
    {
      label: 'Interviews this week',
      value: interviewsThisWeek,
      icon: Calendar,
      iconBg: 'bg-[var(--color-status-warning-bg)]',
      iconColor: 'text-[var(--color-status-warning-text)]',
    },
    {
      label: 'Avg AI Score',
      value: avgAiScore !== null ? `${avgAiScore}%` : 'N/A',
      icon: TrendingUp,
      iconBg: 'bg-[var(--color-teal-light)]',
      iconColor: 'text-[var(--color-teal-dark)]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div 
            key={stat.label} 
            className="p-5 hover:shadow-lg transition-shadow bg-white dark:bg-[var(--color-warm-bg-deep)] shadow-sm border-0 rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--color-primary)] mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-[var(--color-foreground)]">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.iconBg}`}>
                <Icon className={`w-6 h-6 ${stat.iconColor}`} aria-hidden="true" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}