'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';


export default function ApplicationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
 
  const applicationId = searchParams.get('application');
 
  const [formData, setFormData] = useState({
    full_name: '',
    work_email: '',
    contact_number: '',
    alternate_number: '',
    current_location: '',
    current_position: '',
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };


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
      alert('Application ID not found. Please go back and try again.');
      console.error('applicationId is missing');
      return;
    }
   
    if (!cvFile) {
      alert('Please select a CV file');
      return;
    }
   
    setIsSubmitting(true);


    try {
      const token = getCookie('auth_token');
     
      const confirmResponse = await fetch(
        `http://127.0.0.1:8000/candidates/candidates/${applicationId}/confirm-cv/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Token ${token}` }),
          },
          body: JSON.stringify({
            file_key: `cv/${applicationId}/${cvFile.name}`,
            filename: cvFile.name,
          }),
        }
      );


      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json().catch(() => ({}));
        console.error('Confirm upload error:', errorData);
        throw new Error(errorData.error || `Failed: ${confirmResponse.status}`);
      }


      alert('CV uploaded successfully!');
      router.push('/candidate/application-success');


    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
            </div>
           
            {/* ✅ FIX: Swapped active/inactive styles on nav buttons */}
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


            <div className="flex items-center gap-4">
              <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-500 font-semibold text-xs">U</span>
              </div>
            </div>
          </div>
        </div>
      </header>


      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="grid grid-cols-2 gap-12">
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
              <p className="text-gray-600 text-sm leading-relaxed">
                First impressions are everything. Fill in your details and upload your CV to help us tailor your career experience.
              </p>
            </div>


            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    Privacy First
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Your data is encrypted and only shared with verified premium recruiters.
                  </p>
                </div>
              </div>
            </div>
          </div>


          <div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all duration-300">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-gray-50 disabled:opacity-50"
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
                      value={formData.work_email}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-gray-50 disabled:opacity-50"
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
                      value={formData.current_location}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-gray-50 pl-11 disabled:opacity-50"
                      placeholder="e.g. London, United Kingdom"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                      isDragging
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-300 hover:border-teal-400 bg-gray-50'
                    } ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Drag and drop your CV
                        </p>
                        <p className="text-xs text-gray-500 mb-3">PDF, DOCX up to 10MB</p>
                        <label className="inline-block">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            disabled={isSubmitting}
                            className="hidden"
                            required
                          />
                          <span className="px-4 py-2 bg-teal-500 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-teal-600 transition-colors disabled:opacity-50">
                            Choose File
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>


                <div className="flex justify-between items-center pt-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                    className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors disabled:opacity-50"
                  >
                    Save Draft
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !cvFile}
                    className="px-8 py-3 bg-teal-500 text-white text-sm font-semibold rounded-full hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
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

