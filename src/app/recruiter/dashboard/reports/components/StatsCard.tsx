interface StatsCardProps {
  title: string;
  value: string | number;
  suffix?: string;
}

export default function StatsCard({ title, value, suffix }: StatsCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--color-warm-border)] bg-white p-6 shadow-sm hover:shadow-md transition-all">
      <p className="text-sm font-semibold text-[var(--color-primary)]">{title}</p>
      <div className="mt-2 flex items-baseline">
        <p className="text-3xl font-bold text-[var(--color-foreground)]">
          {value}
        </p>
        {suffix && (
          <span className="ml-1 text-lg font-bold text-[var(--color-foreground)]">{suffix}</span>
        )}
      </div>
    </div>
  );
}