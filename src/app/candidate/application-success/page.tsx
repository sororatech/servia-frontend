'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useApplicationSuccess } from '@/hooks/useApplicationSuccess';

export default function ApplicationSuccess() {
  const router = useRouter();
  
  const {
    loading,
    error,
    
    handleViewDashboard,
    handleReturnToJobs,
    
    getStatusColor,
    getProgressWidth,
    formatStatus,
    getDisplayJobTitle,
    getDisplayCompany,
    getDisplayRecruiter,
  } = useApplicationSuccess();

  const status = 'Applied'; 
  const displayJobTitle = getDisplayJobTitle();
  const displayCompany = getDisplayCompany();
  const displayRecruiter = getDisplayRecruiter();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-teal-600 hover:text-teal-700 font-medium text-xs"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
                  sizes="(max-width: 768px) 100vw, 36px"
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

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-teal-600 text-xs font-semibold">
              SUBMISSION SUCCESSFUL
            </div>

            <h1 className="text-5xl font-bold text-black leading-tight">
              Application Received!
            </h1>

            <p className="text-gray-600 text-base leading-relaxed max-w-xl">
              Your professional profile has been successfully delivered to the hiring team. You&apos;ve taken the first step toward your next career move.
            </p>

            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
              <h2 className="text-sm font-semibold text-black mb-6">
                What happens next?
              </h2>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-teal-400 text-xs font-bold">01</span>
                  </div>
                  <div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      A recruiter will review your profile and experience within <strong>3-5 business days</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-teal-400 text-xs font-bold">02</span>
                  </div>
                  <div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Check your email for a confirmation receipt and further instructions regarding technical assessments.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-teal-400 text-xs font-bold">03</span>
                  </div>
                  <div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      You can track the live progress of this application and update your documents in your candidate dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleViewDashboard}
                className="px-8 py-3 bg-teal-500 text-white font-semibold rounded-full hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/30"
              >
                View Dashboard
              </button>
              <button
                onClick={handleReturnToJobs}
                className="px-8 py-3 border-2 border-teal-500 text-teal-600 font-semibold rounded-full hover:bg-teal-50 transition-colors"
              >
                Return to Job Listings
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-8 flex flex-col">
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-auto">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className={`px-3 py-1 bg-blue-50 text-xs font-semibold rounded-full capitalize ${getStatusColor(status)}`}>
                  {formatStatus(status)}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {displayJobTitle}
              </h3>
              <p className="text-teal-600 text-sm font-medium mb-4">
                {displayCompany}
              </p>

              <div className="mb-4">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full ${getProgressWidth(status)} bg-teal-500 rounded-full transition-all duration-500`}></div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className={`text-xs font-semibold ${getStatusColor('applied')}`}>APPLIED</span>
                  <span className={`text-xs font-medium ${getStatusColor('review')}`}>REVIEW</span>
                  <span className={`text-xs font-medium ${getStatusColor('interview')}`}>INTERVIEW</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{displayRecruiter.name}</p>
                  <p className="text-xs text-teal-600">{displayRecruiter.title}</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed italic">
                &quot;{displayRecruiter.quote}&quot;
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}