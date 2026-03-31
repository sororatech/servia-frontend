// src/app/candidate/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AUTH_STORAGE } from '@/lib/auth';

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = AUTH_STORAGE.getToken();
    const userType = AUTH_STORAGE.getUserType();
    
    if (!token || userType !== 'candidate') {
      router.push('/login');
    }
  }, [router]);

  return <>{children}</>;
}