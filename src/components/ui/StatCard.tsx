'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  variant: 'primary' | 'secondary';
}

export const StatCard = ({ title, value, icon, variant }: StatCardProps) => {
  return (
    <div
      className={`
        rounded-3xl p-6 flex flex-col justify-between h-36 transition-all duration-200
        ${variant === 'primary'
          ? 'bg-[#E8EEFB] dark:bg-[#191715] text-[#26B9C8]'
          : 'bg-[#F3F4F6] dark:bg-[#272321] text-[#374151] dark:text-[#e8e2dc]'
        }
      `}
    >
      <div
        className={
          variant === 'primary'
            ? 'text-[#26B9C8]'
            : 'text-[#6B7280] dark:text-[#9a9088]'
        }
      >
        {icon}
      </div>
      <div>
        <div className="text-3xl font-bold leading-none">
          {value.toString().padStart(2, '0')}
        </div>
        <div className="text-[11px] font-semibold uppercase tracking-widest mt-2 opacity-80">
          {title}
        </div>
      </div>
    </div>
  );
};