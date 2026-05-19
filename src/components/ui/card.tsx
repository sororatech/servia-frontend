import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-[#FFFAFA] rounded-xl shadow-sm border border-gray-200/50 ${className}`}>
      {children}
    </div>
  );
}