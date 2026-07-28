'use client';

import { Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Footer } from '@/components/layout/Footer';

function ApplicationSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('applicationId') || '';
  const jobTitle = decodeURIComponent(searchParams.get('jobTitle') || '');
  const company = decodeURIComponent(searchParams.get('company') || 'Servia Hotels');

  const handleViewDashboard = useCallback(() => {
    router.push('/candidate/applications');
  }, [router]);

  const handleReturnToJobs = useCallback(() => {
    router.push('/');
  }, [router]);

  const handleUploadVideo = useCallback(() => {
    router.push(`/candidate/dashboard/video?applicationId=${applicationId}`);
  }, [router, applicationId]);

  return (
    <div className="min-h-screen bg-[var(--color-background)] dark:bg-[var(--color-warm-bg-deep)] flex flex-col transition-colors">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          <div className="space-y-6 sm:space-y-8">
            
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--color-status-active-bg)] text-[var(--color-primary)] text-xs font-semibold border border-[var(--color-status-active-border)] mb-4">
                SUBMISSION SUCCESSFUL
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-foreground)] leading-tight mb-4">
                Application Received!
              </h1>

              <p className="text-[var(--color-text-muted)] text-sm sm:text-base leading-relaxed max-w-xl">
                Your professional profile has been successfully delivered to the hiring team. You&apos;ve taken the first step toward your next career move.
              </p>
            </div>

            <div className="bg-white dark:bg-[var(--color-warm-surface)] rounded-2xl p-6 border border-[var(--color-warm-border)] shadow-sm">
              <div className="flex items-start gap-4 mb-5">
                <div className="flex-shrink-0 w-10 h-10 bg-[var(--color-primary)]/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-[var(--color-primary)]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-base font-bold text-[var(--color-foreground)]">Add a 60-second Video Introduction</h4>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wide">Optional</span>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Introduce yourself to the hiring team and stand out from other candidates.
                  </p>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-gray-800/20 mb-5">
                <svg className="w-8 h-8 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm font-semibold text-[var(--color-foreground)] mb-1">
                  Upload video <span className="font-normal text-gray-500">or drag & drop</span>
                </p>
                <p className="text-xs text-gray-500">
                  MP4, MOV or WebM • Max 2 minutes • Max 100MB
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleUploadVideo}
                  className="!rounded-full px-6 py-2.5 font-semibold shadow-lg shadow-teal-500/20 bg-[#26B9C8] hover:bg-[#20a8b6] text-white"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  Upload Video
                </Button>
              </div>
            </div>

            <div className="bg-[var(--color-warm-bg-page)] dark:bg-[var(--color-warm-bg-deep)] text-[var(--color-text-muted)] rounded-2xl p-6 sm:p-8 border border-[var(--color-warm-border)] transition-colors">
              <h4 className="text-sm font-semibold text-[var(--color-foreground)] mb-6">What happens next?</h4>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center">
                    <span className="text-[var(--color-primary)] text-xs font-bold">01</span>
                  </div>
                  <div>
                    <p className="text-[var(--color-text-body)] text-sm leading-relaxed">
                      A recruiter will review your profile and experience within <strong className="text-[var(--color-foreground)]">3-5 business days</strong>.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center">
                    <span className="text-[var(--color-primary)] text-xs font-bold">02</span>
                  </div>
                  <div>
                    <p className="text-[var(--color-text-body)] text-sm leading-relaxed">
                      Check your email for a confirmation receipt and further instructions regarding technical assessments.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center">
                    <span className="text-[var(--color-primary)] text-xs font-bold">03</span>
                  </div>
                  <div>
                    <p className="text-[var(--color-text-body)] text-sm leading-relaxed">
                      You can track the live progress of this application and update your documents in your candidate dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="primary" size="md" onClick={handleViewDashboard} className="!rounded-full px-8 py-3 shadow-lg shadow-[var(--color-primary)]/20 w-full sm:w-auto">
                View Dashboard
              </Button>
              <Button variant="secondary" size="md" onClick={handleReturnToJobs} className="!rounded-full px-8 py-3 border-2 w-full sm:w-auto">
                Return to Job Listings
              </Button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[var(--color-warm-bg-page)] to-[var(--color-warm-surface)] dark:from-[var(--color-warm-bg-deep)] dark:to-[var(--color-warm-surface)] rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col border border-[var(--color-warm-border)]">
            <div className="bg-white dark:bg-[var(--color-warm-surface)] rounded-2xl p-6 shadow-lg mb-auto border border-[var(--color-warm-border)]">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-[var(--color-warm-bg-page)] dark:bg-[var(--color-warm-bg-deep)] rounded-xl flex items-center justify-center border border-[var(--color-warm-border)]">
                  <svg className="w-6 h-6 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="px-3 py-1 bg-[var(--color-status-active-bg)] text-xs font-semibold rounded-full capitalize text-[var(--color-status-active-text)] border border-[var(--color-status-active-border)]">
                  Applied
                </span>
              </div>

              <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-1 line-clamp-2" title={jobTitle}>
                {jobTitle || 'Position Applied'}
              </h3>
              <p className="text-[var(--color-primary)] text-sm font-medium mb-4">{company}</p>

              <div className="mb-4">
                <div className="h-1.5 bg-[var(--color-warm-border)] rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-[var(--color-primary)] rounded-full transition-all duration-500"></div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs font-semibold text-[var(--color-status-active-text)]">APPLIED</span>
                  <span className="text-xs font-medium text-[var(--color-text-faint)]">REVIEW</span>
                  <span className="text-xs font-medium text-[var(--color-text-faint)]">INTERVIEW</span>
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-foreground)]">Hiring Team</p>
                  <p className="text-xs text-[var(--color-primary)]">{company}</p>
                </div>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed italic">
                &quot;Thank you for your interest in joining our team!&quot;
              </p>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function ApplicationSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-[var(--color-background)] dark:bg-[var(--color-warm-bg-deep)]">
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <LoadingSkeleton variant="page" />
        </div>
      </div>
    }>
      <ApplicationSuccessContent />
    </Suspense>
  );
}