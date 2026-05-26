interface StatsCardProps {
  title: string;
  value: string | number;
  suffix?: string;
}

export default function StatsCard({ title, value, suffix }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <div className="flex items-baseline">
        <p className="text-3xl font-bold text-[var(--color-primary,#26B9C8)]">
          {value}
        </p>
        {suffix && (
          <span className="text-lg font-bold text-[var(--color-primary,#26B9C8)] ml-1">{suffix}</span>
        )}
      </div>
    </div>
  );
}