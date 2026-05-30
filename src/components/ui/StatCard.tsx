import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  variant: 'primary' | 'secondary';
}

export const StatCard = ({ title, value, icon, variant }: StatCardProps) => {
  const bgColor = variant === 'primary' 
    ? 'bg-[var(--color-primary-light)]' 
    : 'bg-gray-100';
  
  const textColor = variant === 'primary' 
    ? 'text-[var(--color-primary)]' 
    : 'text-gray-700';
  
  const iconColor = variant === 'primary' 
    ? 'text-[var(--color-primary)]' 
    : 'text-gray-500';

  return (
    <div className={`${bgColor} rounded-3xl p-6 flex flex-col justify-between h-36 transition-all duration-200`}>
      <div className={iconColor}>{icon}</div>
      <div>
        <div className={`text-3xl font-bold ${textColor} leading-none`}>
          {value.toString().padStart(2, '0')}
        </div>
        <div className={`text-[11px] font-semibold uppercase tracking-widest mt-2 ${textColor} opacity-80`}>
          {title}
        </div>
      </div>
    </div>
  );
};