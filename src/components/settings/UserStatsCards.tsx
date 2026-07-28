import { UserStats } from '@/types/settings';

export default function UserStatsCards({ stats }: { stats: UserStats }) {
  const cards = [
    { label: 'Total Recruiters', value: stats.total_recruiters },
    { label: 'Active Recruiters', value: stats.active_recruiters },
    { label: 'Total Candidates', value: stats.total_candidates },
    { label: 'New This Week', value: stats.users_this_week },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-[var(--color-warm-border)] bg-white dark:bg-[var(--color-warm-surface)] p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm font-semibold text-[var(--color-primary)]">{card.label}</p>
          <p className="mt-2 text-3xl font-bold text-[var(--color-foreground)]">{card.value}</p>
        </div>
      ))}
    </div>
  );
}