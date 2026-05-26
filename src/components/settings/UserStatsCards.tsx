// src/components/settings/UserStatsCards.tsx
import { UserStats } from '@/types/settings';

export default function UserStatsCards({ stats }: { stats: UserStats }) {
  const cards = [
    { label: 'Total Recruiters', value: stats.total_recruiters, color: '#7e756f' },
    { label: 'Active Recruiters', value: stats.active_recruiters, color: '#7e756f' },
    { label: 'Total Candidates', value: stats.total_candidates, color: '#7e756f' },
    { label: 'New This Week', value: stats.users_this_week, color: '#7e756f' },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-[1.5rem] border border-black/10 bg-white/85 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm">
          <p className="text-2xl font-medium text-[#26b9c8]">{card.label}</p>
          <p className="mt-2 text-3xl font-normal" style={{ color: card.color }}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}