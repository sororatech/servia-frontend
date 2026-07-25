'use client';

import { Suspense } from 'react';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { VideoRecord, type VideoRecordHandle } from '@/components/candidate/VideoRecorder';

function VideoIntroPageContent() {
  const router = useRouter();
  const videoRef = useRef<VideoRecordHandle>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hasUploadedFile, setHasUploadedFile] = useState(false);
  const [hasRecordedVideo, setHasRecordedVideo] = useState(false);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setHasUploadedFile(true);
    setHasRecordedVideo(false);
    setUploadedFileName(file.name);
    await videoRef.current?.handleFileUpload(file);
  };

  const handleSave = async () => {
    setIsUploading(true);
    await videoRef.current?.handleSave();
    setIsUploading(false);
  };

  const handleRemoveFile = () => {
    if (uploadedPreviewUrl) {
      URL.revokeObjectURL(uploadedPreviewUrl);
    }
    setHasUploadedFile(false);
    setUploadedPreviewUrl(null);
    setUploadedFileName(null);
    videoRef.current?.clearUpload();
  };

  const handleHasVideoChange = (hasVideo: boolean) => {
    setHasRecordedVideo(hasVideo);
    if (hasVideo) {
      setHasUploadedFile(false);
      setUploadedFileName(null);
      if (uploadedPreviewUrl) {
        URL.revokeObjectURL(uploadedPreviewUrl);
        setUploadedPreviewUrl(null);
      }
    }
  };

  const handleUploadedFileChange = (file: File | null, previewUrl: string | null) => {
    if (uploadedPreviewUrl) {
      URL.revokeObjectURL(uploadedPreviewUrl);
    }
    setUploadedPreviewUrl(previewUrl);
    setUploadedFileName(file?.name || null);
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] dark:bg-[var(--color-warm-bg-deep)] transition-colors">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Stepper */}
        <div className="flex flex-wrap items-center gap-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[var(--color-warm-surface)] dark:bg-[var(--color-warm-bg-deep)] flex items-center justify-center border border-[var(--color-warm-border)]">
              <span className="text-xs font-medium text-[var(--color-text-faint)]">1</span>
            </div>
            <span className="text-sm text-[var(--color-text-faint)] whitespace-nowrap">Personal Details</span>
          </div>
          <div className="w-8 sm:w-12 h-px bg-[var(--color-warm-border)] flex-shrink-0" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-white">2</span>
            </div>
            <span className="text-sm font-medium text-[var(--color-foreground)] whitespace-nowrap">Video Intro</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column: Info */}
          <div className="space-y-6 sm:space-y-8 order-1 lg:order-1">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-foreground)] mb-3 leading-tight">
                Let them see the person behind the CV.
              </h1>
              <p className="text-[var(--color-text-muted)] leading-relaxed text-sm sm:text-base">
                A short 60-second introduction helps recruiters understand your communication style and personality.
                Focus on your biggest professional achievement and why you&apos;re passionate about this role.
              </p>
            </div>

            <VideoRecord
              ref={videoRef}
              onSave={() => router.push('/candidate/applications')}
              onSkip={() => router.push('/candidate/applications')}
              hasUploadedVideo={hasUploadedFile}
              onHasVideoChange={handleHasVideoChange}
              onUploadedFileChange={handleUploadedFileChange}
            />

            <div className="p-4 bg-[var(--color-warm-bg-page)] dark:bg-[var(--color-warm-bg-deep)] rounded-xl flex items-start gap-3 border border-[var(--color-warm-border)]">
              <svg className="w-5 h-5 text-[var(--color-text-faint)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm text-[var(--color-text-muted)]">
                <span className="font-medium text-[var(--color-primary)]">Tip:</span> Ensure you&apos;re in a well-lit environment and using a clear microphone for the best impression.
              </p>
            </div>
          </div>

          {/* Right Column: Upload Area */}
          <div className="space-y-6 sm:space-y-8 order-2 lg:order-2">
            <div className="bg-[var(--color-warm-bg-page)] dark:bg-[var(--color-warm-bg-deep)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 relative border border-[var(--color-warm-border)]">
              <h3 className="font-semibold text-[var(--color-foreground)] mb-1">Already have a video?</h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">Upload your pre-recorded introduction in MP4, MOV, or WEBM format.</p>

              {hasUploadedFile && uploadedPreviewUrl ? (
                <div className="mb-4">
                  <div className="relative aspect-video bg-[var(--color-warm-surface)] dark:bg-[var(--color-warm-bg-deep)] rounded-lg overflow-hidden mb-3 border border-[var(--color-warm-border)]">
                    <video
                      src={uploadedPreviewUrl}
                      className="w-full h-full object-cover"
                      controls
                    />
                  </div>
                  <div className="flex justify-between items-center gap-3">
                    <p className="text-sm text-[var(--color-text-muted)] truncate flex-1">{uploadedFileName}</p>
                    <button
                      onClick={handleRemoveFile}
                      className="px-4 py-2 bg-[var(--color-status-error-bg)] text-[var(--color-status-error-text)] rounded-full text-sm font-medium hover:bg-[var(--color-status-error-bg)]/80 transition-colors border border-[var(--color-status-error-border)] flex-shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file?.type.startsWith('video/')) {
                      handleFileUpload(file);
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'video/mp4,video/quicktime,video/webm';
                    input.onchange = (e: any) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    };
                    input.click();
                  }}
                  className="border-2 border-dashed border-[var(--color-warm-border)] rounded-xl p-6 sm:p-8 text-center cursor-pointer hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors"
                >
                  <div className="w-10 h-10 bg-[var(--color-status-info-bg)] rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-[var(--color-foreground)] font-medium">Drop video here</p>
                  <p className="text-sm text-[var(--color-primary)]">or click to browse files</p>
                </div>
              )}

              <div className="mt-6">
                <p className="text-xs font-semibold text-[var(--color-foreground)] uppercase tracking-wide mb-2">QUICK CHECKLIST</p>
                <ul className="space-y-1.5 text-sm text-[var(--color-text-muted)]">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[var(--color-primary)]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Professional attire recommended
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[var(--color-primary)]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Clear background
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[var(--color-primary)]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Under 50MB file size
                  </li>
                </ul>
              </div>

              {hasRecordedVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl sm:rounded-3xl pointer-events-none">
                  <div className="text-center text-white p-6">
                    <svg className="w-12 h-12 mx-auto mb-3 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-semibold mb-1">Video Recorded</p>
                    <p className="text-sm text-gray-300">Use Save & Continue button below</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={handleSave}
                disabled={isUploading || (!hasUploadedFile && !hasRecordedVideo)}
                className="w-full py-3 sm:py-3.5 bg-[var(--color-primary)] text-white rounded-full font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {isUploading ? 'Uploading...' : 'Save & Continue'}
              </button>
              <button
                onClick={() => router.push('/candidate/dashboard/status')}
                disabled={isUploading}
                className="w-full py-3 sm:py-3.5 border-2 border-[var(--color-primary)] text-[var(--color-primary)] bg-white dark:bg-[var(--color-warm-surface)] rounded-full font-medium hover:bg-[var(--color-primary)]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function VideoIntroPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] dark:bg-[var(--color-warm-bg-deep)]">
        <p className="text-[var(--color-text-muted)]">Loading...</p>
      </div>
    }>
      <VideoIntroPageContent />
    </Suspense>
  );
}