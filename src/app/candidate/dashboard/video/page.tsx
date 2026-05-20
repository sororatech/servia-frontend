// src/app/candidate/dashboard/video/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { VideoRecord } from '@/components/candidate/VideoRecord';

export default function VideoIntroPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Steps */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-xs font-medium text-white">1</span>
            </div>
            <span className="text-sm text-gray-600">Personal Details</span>
          </div>
          <div className="w-12 h-px bg-gray-300" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center">
              <span className="text-xs font-medium text-white">2</span>
            </div>
            <span className="text-sm font-medium text-gray-900">Video Intro</span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Let them see the person behind the CV.
        </h1>
        <p className="text-gray-600 mb-8 max-w-3xl leading-relaxed">
          A short 60-second introduction helps recruiters understand your communication
          style and personality. Focus on your biggest professional achievement and why
          you're passionate about this role.
        </p>

        {/* Video Component */}
        <VideoRecord 
          onSave={() => router.push('/candidate/dashboard/status')}
          onSkip={() => router.push('/candidate/dashboard/status')}
        />

        {/* Tip */}
        <div className="mt-8 flex items-start gap-2 text-sm text-gray-600">
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p>
            <span className="font-medium text-[#26B9C8]">Tip:</span> Ensure you're in a well-lit environment and using a clear microphone for the best impression.
          </p>
        </div>
      </main>
    </div>
  );
}