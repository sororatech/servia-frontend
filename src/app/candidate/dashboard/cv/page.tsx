'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCVUpload } from '@/hooks/useCVUpload';
import { MAX_CV_SIZE_MB } from '@/utils/cvUpload';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Footer } from '@/components/layout/Footer';

function CVUploadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('application');
  const jobTitle = searchParams.get('jobTitle') || '';
  const department = searchParams.get('department') || '';

  const {
    cvFile,
    isDragging,
    uploadProgress,
    uploading,
    errorMessage,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleSubmit,
    clearError,
    removeFile,
    formatFileSize,
    isFileTooLarge,
  } = useCVUpload();

  const onSubmit = (e: React.FormEvent) => handleSubmit(e, applicationId, jobTitle, department);

  return (
    <div className="min-h-screen bg-[var(--color-background)] dark:bg-[var(--color-warm-bg-deep)] flex flex-col transition-colors">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full">
        {/* Stepper */}
        <div className="flex flex-wrap items-center gap-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[var(--color-primary)] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-medium">1</span>
            </div>
            <span className="text-[var(--color-foreground)] text-sm font-medium whitespace-nowrap">Personal Details</span>
          </div>
          <div className="w-8 sm:w-12 h-px bg-[var(--color-warm-border)] flex-shrink-0"></div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/candidate/dashboard/video')}
            className="!p-0 !h-auto flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <div className="w-7 h-7 bg-[var(--color-warm-surface)] dark:bg-[var(--color-warm-bg-deep)] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[var(--color-text-faint)] text-xs font-medium">2</span>
            </div>
            <span className="text-[var(--color-text-faint)] text-sm font-medium hover:text-[var(--color-foreground)] transition-colors whitespace-nowrap">Video Intro</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 py-2">
          {/* Left Column: Info (Now order-1 on mobile to appear on TOP) */}
          <div className="space-y-6 order-1 lg:order-1">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 leading-tight">
                <span className="text-[var(--color-foreground)]">Start your</span>
                <br />
                <span>
                  <span className="text-[var(--color-primary)]">curated </span>
                  <span className="text-[var(--color-foreground)]">journey.</span>
                </span>
              </h1>
              <p className="text-[var(--color-text-muted)] text-sm sm:text-base leading-relaxed mt-4">
                First impressions are everything. Fill in your details and upload your CV to help us tailor your career experience.
              </p>
            </div>

            {/* Privacy First Box: Now matches the Form Card styling exactly */}
            <div className="bg-white dark:bg-[var(--color-warm-surface)] rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg border border-[var(--color-warm-border)] w-full transition-colors">
              <div className="flex flex-col items-start text-left">
                <svg className="w-7 h-7 text-[var(--color-primary)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 className="text-base font-semibold text-[var(--color-foreground)] mb-1.5">Privacy First</h3>
                <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                  Your data is encrypted and only shared with verified premium recruiters.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Form (Now order-2 on mobile to appear BELOW the info) */}
          <div className="order-2 lg:order-2">
            <div className="bg-white dark:bg-[var(--color-warm-surface)] rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg border border-[var(--color-warm-border)] hover:shadow-xl transition-all duration-300">
              <form onSubmit={onSubmit} className="space-y-5 sm:space-y-6">
                
                {errorMessage && (
                  <div className="p-3 bg-[var(--color-status-error-bg)] border border-[var(--color-status-error-border)] rounded-lg flex items-start gap-2">
                    <svg className="w-4 h-4 text-[var(--color-status-error-text)] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-[var(--color-status-error-text)] flex-1">{errorMessage}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={clearError}
                      className="!p-1 !h-auto text-[var(--color-status-error-text)]/60 hover:text-[var(--color-status-error-text)] transition-colors"
                      aria-label="Clear error"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-dark)] dark:text-[var(--color-foreground)] mb-2">Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      required
                      disabled={uploading}
                      className="w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl border border-[var(--color-warm-border)] bg-[var(--color-input-bg)] dark:bg-[var(--color-input-bg-light)] text-[var(--color-foreground)] placeholder-[var(--color-text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] text-sm disabled:opacity-50 transition-colors"
                      placeholder="Alex Rivera"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-dark)] dark:text-[var(--color-foreground)] mb-2">Work Email</label>
                    <input
                      type="email"
                      name="work_email"
                      required
                      disabled={uploading}
                      className="w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl border border-[var(--color-warm-border)] bg-[var(--color-input-bg)] dark:bg-[var(--color-input-bg-light)] text-[var(--color-foreground)] placeholder-[var(--color-text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] text-sm disabled:opacity-50 transition-colors"
                      placeholder="alex@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-dark)] dark:text-[var(--color-foreground)] mb-2">Current Location</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="current_location"
                      required
                      disabled={uploading}
                      className="w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl border border-[var(--color-warm-border)] bg-[var(--color-input-bg)] dark:bg-[var(--color-input-bg-light)] text-[var(--color-foreground)] placeholder-[var(--color-text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] text-sm pl-12 disabled:opacity-50 transition-colors"
                      placeholder="e.g. London, United Kingdom"
                    />
                    <svg className="w-5 h-5 text-[var(--color-text-faint)] absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-dark)] dark:text-[var(--color-foreground)] mb-2">Curriculum Vitae</label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 sm:p-10 text-center transition-colors ${
                      isDragging 
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                        : 'border-[var(--color-warm-border)] bg-[var(--color-input-bg)] dark:bg-[var(--color-input-bg-light)] hover:border-[var(--color-primary)]'
                    } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <div className="w-14 h-14 bg-white dark:bg-[var(--color-warm-bg-deep)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-[var(--color-warm-border)]">
                      <svg className="w-6 h-6 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    
                    {cvFile ? (
                      <div className="relative">
                        <p className="text-sm font-semibold text-[var(--color-foreground)] mb-1 break-all">{cvFile.name}</p>
                        <p className={`text-xs ${isFileTooLarge(cvFile) ? 'text-[var(--color-status-error-text)]' : 'text-[var(--color-text-muted)]'}`}>
                          {formatFileSize(cvFile.size)} MB
                          {isFileTooLarge(cvFile) && ` • Too large (max ${MAX_CV_SIZE_MB}MB)`}
                        </p>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={removeFile}
                          disabled={uploading}
                          className="!p-0 !h-auto mt-3 text-xs font-medium text-[var(--color-primary)] hover:opacity-80 transition-opacity disabled:opacity-50"
                        >
                          ✕ Remove file
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-[var(--color-foreground)] mb-2">Drag and drop your CV</p>
                        <p className="text-xs text-[var(--color-text-muted)] mb-4">PDF, DOCX up to {MAX_CV_SIZE_MB}MB</p>
                        
                        <div>
                          <input
                            type="file"
                            id="cv-file-input"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            disabled={uploading}
                            className="hidden"
                            required
                          />
                          <Button
                            variant="primary"
                            size="sm"
                            type="button"
                            onClick={() => document.getElementById('cv-file-input')?.click()}
                            className="!rounded-lg cursor-pointer disabled:opacity-50 w-full sm:w-auto"
                            disabled={uploading}
                          >
                            Choose File
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {uploading && (
                  <div className="w-full bg-[var(--color-warm-border)] rounded-full h-2.5 overflow-hidden">
                    <div className="bg-[var(--color-primary)] h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 sm:pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => router.back()}
                    disabled={uploading}
                    className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors disabled:opacity-50 w-full sm:w-auto"
                  >
                    Save Draft
                  </Button>
                  
                  <Button
                    variant="primary"
                    size="md"
                    type="submit"
                    disabled={uploading || !cvFile}
                    isLoading={uploading}
                    className="!rounded-full px-8 sm:px-10 py-3 sm:py-3.5 shadow-lg shadow-[var(--color-primary)]/20 disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    {uploading ? 'Uploading...' : 'Submit'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function CVUploadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-[var(--color-background)] dark:bg-[var(--color-warm-bg-deep)]">
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
          <LoadingSkeleton variant="page" />
        </div>
      </div>
    }>
      <CVUploadContent />
    </Suspense>
  );
}