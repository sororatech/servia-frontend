interface StatsCardProps {
  title: string;
  value: string | number;
  suffix?: string;
}

export default function StatsCard({ title, value, suffix }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">
        {value}
        {suffix && <span className="text-lg text-gray-500 ml-1">{suffix}</span>}
      </p>
    </div>
  );
}