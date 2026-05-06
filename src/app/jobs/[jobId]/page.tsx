'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  description: string;
  requirements: string;
  posted_date: string;
  is_active: boolean;
}

export default function JobDetail() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [params.jobId]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/jobs/jobs/${params.jobId}/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setJob(data);
    } catch (error) {
      console.error('Failed to fetch job:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  const handleApply = async () => {
    try {
      setApplying(true);
      
      const token = getCookie('auth_token');
      
      const response = await fetch('http://127.0.0.1:8000/candidates/candidates/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Token ${token}` }),
        },
        body: JSON.stringify({
          job: params.jobId,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const applicationId = data.id;
        
        if (data.exists) {
          alert('You have already applied to this job! Redirecting to your application...');
        } else {
          alert('Application started! Please upload your CV.');
        }
        
        if (applicationId) {
          router.push(`/candidate/dashboard/cv?application=${applicationId}`);
        } else {
          router.push('/candidate/dashboard/cv');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401) {
          alert('Please login to apply for jobs.');
          router.push('/login');
        } else if (response.status === 403) {
          alert('Authentication failed. Please login again.');
          router.push('/login');
        } else if (response.status === 400) {
          alert(`Validation error: ${JSON.stringify(errorData)}`);
        } else {
          alert(`Failed to apply: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error applying:', error);
      alert('Failed to start application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4 text-sm">Job not found</p>
          <button
            onClick={() => router.push('/jobs')}
            className="text-teal-600 hover:text-teal-700 font-medium text-xs"
          >
            ← Back to Jobs
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
              <div className="w-9 h-9">
                <Image
                  src="/servia-logo.png"
                  alt="Servia Logo"
                  width={36}
                  height={36}
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

      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="flex">
          <div className="w-80 flex-shrink-0">
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-l-2xl p-6 border border-r-0 border-gray-100 sticky top-8 h-full flex flex-col">
              <div className="mb-4">
                <div className="p-1 mb-4">
                  <Image
                    src="/specific-logo.png"
                    alt="Specific Logo"
                    width={40}
                    height={40}
                    className="object-contain rounded"
                  />
                </div>

                <h1 className="font-bold text-gray-900 mb-10">
                  {job.title}
                </h1>
                <p className="text-teal-600 font-medium text-xs mb-4">
                  {job.department} • {job.location}
                </p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Salary</p>
                    <p className="text-xs font-bold text-gray-900">$10k - $18k</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Type</p>
                    <p className="text-xs font-bold text-gray-900">{job.employment_type.replace('_', ' ')}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-xs font-normal text-teal-600 uppercase mb-2">
                    Core Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      PMS
                    </span>
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      Conflict resolution
                    </span>
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      Leadership
                    </span>
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      Customer Service
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-200">
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="w-full bg-teal-500 text-white py-3 rounded-xl hover:bg-teal-600 transition-colors font-semibold text-xs shadow-lg shadow-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {applying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Applying...
                    </>
                  ) : (
                    'Apply Now'
                  )}
                </button>
                <p className="text-xs text-gray-400 text-center mt-2">
                  Applications close in 4 days.
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-white rounded-r-2xl p-6 border border-gray-100 h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">About the Role</h2>
                <button
                  onClick={() => router.push('/jobs')}
                  className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-600 leading-relaxed mb-3 text-sm">
                  {job.description || `At Hilton Hotel, we are crafting exceptional hospitality experiences for discerning guests. As a ${job.title}, you will be the primary architect of our front desk operations, working directly with management and housekeeping teams to transform check-ins, inquiries, and guest requests into seamless, memorable interactions.`}
                </p>

                <p className="text-gray-600 leading-relaxed mb-3 text-sm">
                  We value managers who think in systems, not just shifts. You will own front desk workflows from reservations and concierge services through to check-outs and feedback loops, ensuring every guest touchpoint feels intuitive, personalized, and impeccably polished.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Key Requirements
                </h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-600 leading-relaxed text-sm">
                      3+ years in hospitality front desk operations, with proven guest service leadership.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-600 leading-relaxed text-sm">
                      Strong systems thinking for managing reservations, check-ins, and team workflows.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-600 leading-relaxed text-sm">
                      Excellent communication skills to handle inquiries, resolve issues, and drive guest satisfaction.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}