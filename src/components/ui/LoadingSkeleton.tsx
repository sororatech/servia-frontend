'use client';

import Image from 'next/image';

interface LoadingSkeletonProps {
  variant?: 'page' | 'card' | 'list' | 'profile';
  className?: string;
}

export function LoadingSkeleton({ variant = 'page', className = '' }: LoadingSkeletonProps) {
  if (variant === 'page') {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen bg-background ${className}`}>
        <style>{`
          @keyframes loading-slide {
            0% { 
              transform: translateX(-150%); 
            }
            100% { 
              transform: translateX(250%); 
            }
          }
          .animate-loading-bar {
            animation: loading-slide 1.5s infinite ease-in-out;
          }
        `}</style>

        <div className="relative mb-8">
          <div className="relative bg-background p-6 rounded-full shadow-sm border border-gray-100">
            <Image
              src="/logo.png"
              alt="ServiaAI"
              width={96}
              height={96}
              className="w-24 h-24 object-contain"
              priority
            />
          </div>
        </div>

        <p className="text-foreground font-semibold tracking-wide animate-pulse">
          Loading your experience...
        </p>

  
        <div className="w-64 h-1.5 bg-gray-100 rounded-full mt-6 overflow-hidden relative">

      <div className="animate-loading-bar h-full w-1/3 bg-[var(--color-primary)] rounded-full" />
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-background rounded-xl border border-gray-100 shadow-sm p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-gray-200 rounded-md w-3/4" />
          <div className="h-4 bg-gray-200 rounded-md w-1/2" />
          <div className="h-24 bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse flex items-center space-x-4 p-3 bg-white rounded-lg border border-gray-50">
            <div className="h-12 w-12 bg-gray-200 rounded-full shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'profile') {
    return (
      <div className={`animate-pulse bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 ${className}`}>
        <div className="h-32 bg-gray-100" />
        <div className="flex justify-center -mt-12">
          <div className="h-24 w-24 bg-gray-200 rounded-full border-4 border-white shadow-md" />
        </div>
        <div className="p-6 space-y-4 text-center">
          <div className="h-6 bg-gray-200 rounded-md w-1/3 mx-auto" />
          <div className="h-4 bg-gray-100 rounded-md w-1/2 mx-auto" />
          <div className="space-y-2 mt-4">
            <div className="h-3 bg-gray-50 rounded w-full" />
            <div className="h-3 bg-gray-50 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  return null;
}