'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api';

export default function CVUploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('application');
  
  const [uploading, setUploading] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setCvFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!applicationId) {
      alert('Application ID not found');
      return;
    }

    if (!cvFile) {
      alert('Please select a CV file');
      return;
    }
    
    setUploading(true);
    setUploadProgress(10);

    try {
      const fileExtension = cvFile.name.split('.').pop()?.toLowerCase() || 'pdf';
      
      setUploadProgress(20);
      
      const urlResponse = await api.post(
        `/candidates/candidates/${applicationId}/upload-cv/`,
        { file_extension: fileExtension }
      );
      const urlData = urlResponse.data;

      setUploadProgress(40);

      const uploadResponse = await fetch(urlData.upload_url, {
        method: 'PUT',
        headers: {
          'Content-Type': urlData.content_type,
        },
        body: cvFile,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload to R2: ${uploadResponse.status}`);
      }

      setUploadProgress(70);

      const confirmResponse = await api.post(
        `/candidates/candidates/${applicationId}/confirm-cv/`,
        { file_key: urlData.file_key, filename: cvFile.name }
      );

      setUploadProgress(100);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      router.push(`/candidate/application-success?applicationId=${applicationId}`);

    } catch (error: any) {
      console.error('Upload error:', error);
      
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_role');
          window.location.href = '/login';
        }
        return;
      }
      
      alert(`Upload failed: ${error.message || 'Unknown error'}`);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 relative">
                <Image
                  src="/servia-logo.png"
                  alt="Servia Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            
            <nav className="flex gap-8">
              <button 
                onClick={() => router.push('/jobs')}
                className="text-teal-600 font-semibold text-sm border-b-2 border-teal-600 pb-0.5"
              >
                Browse Jobs
              </button>
              <button 
                onClick={() => router.push('/candidate/dashboard')}
                className="text-gray-400 hover:text-gray-600 font-medium text-sm"
              >
                My Applications
              </button>
            </nav>

            <button 
              onClick={() => router.push('/candidate/profile')}
              className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
              title="Profile"
            >
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">1</span>
            </div>
            <span className="text-gray-900 text-sm font-medium">Personal Details</span>
          </div>

          <div className="w-12 h-px bg-gray-200"></div>

          <button 
            onClick={() => router.push('/candidate/dashboard/video')}
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-400 text-xs font-medium">2</span>
            </div>
            <span className="text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors">Video Intro</span>
          </button>
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
                  <span className="text-teal-500">curated </span>
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
                <svg className="w-7 h-7 text-teal-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                  Privacy First
                </h3>
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
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      required
                      disabled={uploading}
                      className="w-full px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-gray-50 disabled:opacity-50"
                      placeholder="Alex Rivera"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Work Email
                    </label>
                    <input
                      type="email"
                      name="work_email"
                      required
                      disabled={uploading}
                      className="w-full px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-gray-50 disabled:opacity-50"
                      placeholder="alex@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Current Location
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="current_location"
                      required
                      disabled={uploading}
                      className="w-full px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-gray-50 pl-12 disabled:opacity-50"
                      placeholder="e.g. London, United Kingdom"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Curriculum Vitae
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
                      isDragging
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-300 hover:border-teal-400 bg-gray-50'
                    } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    {cvFile ? (
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">{cvFile.name}</p>
                        <p className="text-xs text-gray-500">{(cvFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Drag and drop your CV
                        </p>
                        <p className="text-xs text-gray-500 mb-4">PDF, DOCX up to 10MB</p>
                        <label className="inline-block">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            disabled={uploading}
                            className="hidden"
                            required
                          />
                          <span className="px-5 py-2.5 bg-teal-500 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-teal-600 transition-colors disabled:opacity-50">
                            Choose File
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {uploading && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-teal-500 h-2.5 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    disabled={uploading}
                    className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors disabled:opacity-50"
                  >
                    Save Draft
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !cvFile}
                    className="px-10 py-3.5 bg-teal-500 text-white text-sm font-semibold rounded-full hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Uploading...
                      </>
                    ) : (
                      'Submit'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}