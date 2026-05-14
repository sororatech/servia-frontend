'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useCVUpload } from '@/hooks/useCVUpload';
import { MAX_CV_SIZE_MB } from '@/utils/cvUpload';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';

export default function CVUploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('application');
  
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

  const onSubmit = (e: React.FormEvent) => handleSubmit(e, applicationId);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">1</span>
            </div>
            <span className="text-gray-900 text-sm font-medium">Personal Details</span>
          </div>
          <div className="w-12 h-px bg-gray-200"></div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/candidate/dashboard/video')}
            className="!p-0 !h-auto flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-400 text-xs font-medium">2</span>
            </div>
            <span className="text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors">Video Intro</span>
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 leading-tight">
                <span className="text-gray-900">Start your</span>
                <br />
                <span>
                  <span className="text-[#26B9C8]">curated </span>
                  <span className="text-gray-900">journey.</span>
                </span>
              </h1>
              <p className="text-gray-600 text-sm leading-relaxed mt-4">
                First impressions are everything. Fill in your details and
                <br />
                upload your CV to help us tailor your career
                <br />
                experience.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 w-110">
              <div className="flex flex-col items-start text-left">
                <svg className="w-7 h-7 text-[#26B9C8] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">Privacy First</h3>
                <p className="text-xs text-gray-600 leading-relaxed text-left">
                  Your data is encrypted and only shared with verified premium
                  <br />
                  recruiters.
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15),0_8px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 hover:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.2),0_10px_25px_-4px_rgba(0,0,0,0.15)] transition-all duration-300">
              <form onSubmit={onSubmit} className="space-y-6">
                
                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-700 flex-1">{errorMessage}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={clearError}
                      className="!p-1 !h-auto text-red-400 hover:text-red-600"
                      aria-label="Clear error"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      required
                      disabled={uploading}
                      className="w-full px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#26B9C8] text-sm bg-gray-50 disabled:opacity-50"
                      placeholder="Alex Rivera"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Work Email</label>
                    <input
                      type="email"
                      name="work_email"
                      required
                      disabled={uploading}
                      className="w-full px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#26B9C8] text-sm bg-gray-50 disabled:opacity-50"
                      placeholder="alex@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Current Location</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="current_location"
                      required
                      disabled={uploading}
                      className="w-full px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#26B9C8] text-sm bg-gray-50 pl-12 disabled:opacity-50"
                      placeholder="e.g. London, United Kingdom"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Curriculum Vitae</label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
                      isDragging ? 'border-[#26B9C8] bg-[#26B9C8]/10' : 'border-gray-300 hover:border-[#26B9C8] bg-gray-50'
                    } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    
                    {cvFile ? (
                      <div className="relative">
                        <p className="text-sm font-semibold text-gray-900 mb-1">{cvFile.name}</p>
                        <p className={`text-xs ${isFileTooLarge(cvFile) ? 'text-red-500' : 'text-gray-500'}`}>
                          {formatFileSize(cvFile.size)} MB
                          {isFileTooLarge(cvFile) && ` • Too large (max ${MAX_CV_SIZE_MB}MB)`}
                        </p>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={removeFile}
                          disabled={uploading}
                          className="!p-0 !h-auto mt-3 text-xs font-medium text-[#26B9C8] hover:opacity-80 transition-opacity disabled:opacity-50"
                        >
                          ✕ Remove file
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Drag and drop your CV</p>
                        <p className="text-xs text-gray-500 mb-4">PDF, DOCX up to {MAX_CV_SIZE_MB}MB</p>
                        
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
                            className="!rounded-lg cursor-pointer disabled:opacity-50"
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
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-[#26B9C8] h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => router.back()}
                    disabled={uploading}
                    className="font-semibold text-[#26B9C8] hover:text-[#20a8b6] transition-colors disabled:opacity-50"
                  >
                    Save Draft
                  </Button>
                  
                  <Button
                    variant="primary"
                    size="md"
                    type="submit"
                    disabled={uploading || !cvFile}
                    isLoading={uploading}
                    className="!rounded-full px-10 py-3.5 shadow-lg shadow-[#26B9C8]/30 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Uploading...' : 'Submit'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}