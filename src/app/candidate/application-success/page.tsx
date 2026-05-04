'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface JobInfo {
  title: string;
  department: string;
  location: string;
  company?: string;
  recruiter?: {
    name: string;
    title: string;
    quote: string;
  } | null;
}

interface ApplicationData {
  id: string;
  status: string;
  created_at: string;
  job: string | JobInfo | null;
}

export default function ApplicationSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [jobDetails, setJobDetails] = useState<JobInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicationData();
  }, []);

  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  const fetchApplicationData = async () => {
    try {
      const token = getCookie('auth_token');
      
      const response = await fetch('http://127.0.0.1:8000/candidates/candidates/', {
        headers: {
          ...(token && { 'Authorization': `Token ${token}` }),
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const applications = data.results || data;
        
        if (applications && applications.length > 0) {
          const latestApp = applications[0];
          setApplicationData(latestApp);
          
          if (typeof latestApp.job === 'string') {
            await fetchJobDetails(latestApp.job, token);
          } else if (latestApp.job && typeof latestApp.job === 'object') {
            setJobDetails(latestApp.job as JobInfo);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching application ', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobDetails = async (jobId: string, token: string | null) => {
    try {
      const jobEndpoints = [
        `http://127.0.0.1:8000/jobs/${jobId}/`,
        `http://127.0.0.1:8000/api/jobs/${jobId}/`,
        `http://127.0.0.1:8000/jobs/jobs/${jobId}/`,
      ];
      
      let jobData = null;
      
      for (const endpoint of jobEndpoints) {
        try {
          const response = await fetch(endpoint, {
            headers: {
              ...(token && { 'Authorization': `Token ${token}` }),
            },
          });
          
          if (response.ok) {
            jobData = await response.json();
            break;
          }
        } catch (err) {
          continue;
        }
      }
      
      if (!jobData) return;
      
      const department = jobData.department || jobData.company || jobData.organization || 'Servia Hotels';
      
      setJobDetails({
        title: jobData.title || 'Position Applied',
        department: department,
        location: jobData.location || '',
        company: jobData.company,
        recruiter: jobData.recruiter || jobData.hiring_manager || jobData.contact_person || null,
      });
      
      if (!jobData.recruiter && !jobData.hiring_manager) {
        await fetchRecruiterInfo(department, token);
      }
      
    } catch (error) {
      console.error('Error fetching job details:', error);
    }
  };

  const fetchRecruiterInfo = async (department: string, token: string | null) => {
    try {
      const recruiterEndpoints = [
        `http://127.0.0.1:8000/recruiters/?department=${encodeURIComponent(department)}`,
        `http://127.0.0.1:8000/api/recruiters/?department=${encodeURIComponent(department)}`,
        `http://127.0.0.1:8000/recruiters/`,
      ];
      
      for (const endpoint of recruiterEndpoints) {
        try {
          const response = await fetch(endpoint, {
            headers: {
              ...(token && { 'Authorization': `Token ${token}` }),
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            let recruiter = null;
            
            if (Array.isArray(data) && data.length > 0) {
              recruiter = data[0];
            } else if (data.results && Array.isArray(data.results) && data.results.length > 0) {
              recruiter = data.results[0];
            } else if (data.name || data.full_name) {
              recruiter = data;
            }
            
            if (recruiter) {
              setJobDetails(prev => prev ? {
                ...prev,
                recruiter: {
                  name: recruiter.name || recruiter.full_name || 'Recruiter',
                  title: recruiter.title || recruiter.role || 'Talent Acquisition',
                  quote: recruiter.quote || recruiter.bio || recruiter.description || '',
                }
              } : prev);
              return;
            }
          }
        } catch (err) {
          continue;
        }
      }
    } catch (error) {
      console.error('Error fetching recruiter info:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'applied':
      case 'submitted':
        return 'text-teal-600';
      case 'under_review':
      case 'review':
        return 'text-blue-600';
      case 'interview':
        return 'text-purple-600';
      case 'accepted':
      case 'hired':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getProgressWidth = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'applied':
      case 'submitted':
        return 'w-1/3';
      case 'under_review':
      case 'review':
        return 'w-2/3';
      case 'interview':
      case 'accepted':
      case 'hired':
        return 'w-full';
      default:
        return 'w-1/3';
    }
  };

  const handleViewDashboard = () => {
    router.push('/candidate/dashboard');
  };

  const handleReturnToJobs = () => {
    router.push('/jobs');
  };

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

  const displayJobTitle = jobDetails?.title || 'Position Applied';
  const displayCompany = jobDetails?.department || jobDetails?.company || jobDetails?.location || 'Servia Hotels';
  const status = applicationData?.status || 'Applied';
  
  const displayRecruiter = jobDetails?.recruiter || {
    name: 'Talent Team',
    title: 'Servia Hotels',
    quote: "We've received your application! Our team is currently reviewing candidates who align with our vision of high-stakes professional introduction.",
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
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
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
              SUBMISSION SUCCESSFUL
            </div>

            <h1 className="text-5xl font-bold text-black leading-tight">
              Application Received!
            </h1>

            <p className="text-gray-600 text-base leading-relaxed max-w-xl">
              Your professional profile has been successfully delivered to the hiring team. You've taken the first step toward your next career move.
            </p>

            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
              <h2 className="text-sm font-semibold text-black mb-6">
                What happens next?
              </h2>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-xs font-bold">01</span>
                  </div>
                  <div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      A recruiter will review your profile and experience within <strong>3-5 business days</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-xs font-bold">02</span>
                  </div>
                  <div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Check your email for a confirmation receipt and further instructions regarding technical assessments.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-xs font-bold">03</span>
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
                  {status.replace('_', ' ')}
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
                "{displayRecruiter.quote}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}