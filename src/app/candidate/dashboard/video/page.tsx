'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { VideoRecord, type VideoRecordHandle } from '@/components/candidate/VideoRecorder';

export default function VideoIntroPage() {
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

  const handleSave = async () => {    setIsUploading(true);
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
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-10">
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

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Let them see the person behind the CV.
              </h1>
              <p className="text-gray-600 leading-relaxed">
                A short 60-second introduction helps recruiters understand your communication <br /> style and personality.
                
                Focus on your biggest professional achievement <br /> and why you're passionate about this role.
              </p>
            </div>

            <VideoRecord 
              ref={videoRef}
              onSave={() => router.push('/candidate/dashboard/status')}
              onSkip={() => router.push('/candidate/dashboard/status')}
              hasUploadedVideo={hasUploadedFile}
              onHasVideoChange={handleHasVideoChange}
              onUploadedFileChange={handleUploadedFileChange}
            />

            <div className="p-4 bg-gray-50 rounded-xl flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-[#26B9C8]">Tip:</span> Ensure you're in a well-lit environment and using a clear microphone for the best impression.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-gray-50 rounded-xl p-6 relative">
              <h3 className="font-semibold text-gray-900 mb-1">Already have a video?</h3>
              <p className="text-sm text-gray-600 mb-4">Upload your pre-recorded introduction in MP4, MOV, or WEBM format.</p>
              
              {hasUploadedFile && uploadedPreviewUrl ? (
                <div className="mb-4">
                  <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden mb-3">
                    <video 
                      src={uploadedPreviewUrl}
                      className="w-full h-full object-cover"
                      controls
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600 truncate">{uploadedFileName}</p>
                    <button 
                      onClick={handleRemoveFile}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium hover:bg-red-200 transition-colors"
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
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#26B9C8] hover:bg-[#26B9C8]/5 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-[#26B9C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-gray-900 font-medium">Drop video here</p>
                  <p className="text-sm text-[#26B9C8]">or click to browse files</p>
                </div>
              )}

              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-2">QUICK CHECKLIST</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#26B9C8]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Professional attire recommended
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#26B9C8]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Clear background
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#26B9C8]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Under 50MB file size
                  </li>
                </ul>
              </div>

              {hasRecordedVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm rounded-xl pointer-events-none">
                  <div className="text-center text-white p-6">
                    <svg className="w-12 h-12 mx-auto mb-3 text-[#26B9C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="w-full py-3 bg-[#26B9C8] text-white rounded-full font-medium hover:bg-[#26B9C8]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {isUploading ? 'Uploading...' : 'Save & Continue'}
              </button>
              <button 
                onClick={() => router.push('/candidate/dashboard/status')} 
                disabled={isUploading} 
                className="w-full py-3 border-2 border-[#26B9C8] text-[#26B9C8] bg-white rounded-full font-medium hover:bg-[#26B9C8]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
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