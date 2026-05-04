'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

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
              <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
            </div>
           
            <nav className="flex gap-8">
              <button className="text-teal-600 font-semibold text-sm border-b-2 border-teal-600 pb-0.5">
                Browse Jobs
              </button>
              <button className="text-gray-400 hover:text-gray-600 font-medium text-sm">
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


      <div className="max-w-7xl mx-auto px-35 py-6">
        <div className="flex">
          <div className="w-72 flex-shrink-0">
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-l-xl p-5 border border-r-0 border-gray-100 sticky top-6 min-h-[480px] flex flex-col justify-between">
              <div>
                <h1 className="text-[8px] font-normal text-gray-500 mb-1 block max-w-full truncate leading-none" style={{ color: '#6B7280' }}>
                  {job.title}
                </h1>
                <p className="text-teal-600 font-medium text-xs mb-4">
                  {job.location}
                </p>


                <div className="grid grid-cols-2 gap-2.5 mb-5">
                  <div className="bg-white rounded-lg p-2.5 border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Salary</p>
                    <p className="text-xs font-semibold text-gray-900">$10k - $18k</p>
                  </div>
                  <div className="bg-white rounded-lg p-2.5 border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Type</p>
                    <p className="text-xs font-semibold text-gray-900">{job.employment_type.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>


              <div className="mt-auto pt-4 border-t border-gray-200">
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="w-full bg-teal-500 text-white py-3 rounded-full hover:bg-teal-600 transition-colors font-semibold text-xs shadow-lg shadow-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                <p className="text-xs text-gray-400 text-center mt-2.5">
                  Application takes less than 5 mins
                </p>
              </div>
            </div>
          </div>


          <div className="flex-1">
            <div className="bg-white rounded-r-xl p-6 border border-gray-100 min-h-[480px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900">About the Role</h2>
                <button
                  onClick={() => router.push('/jobs')}
                  className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>


              <div className="mb-5">
                <p className="text-gray-600 leading-relaxed mb-3 text-xs">
                  {job.description || `At Servia Hotels, we are crafting exceptional hospitality experiences. As a ${job.title}, you will deliver seamless guest service and contribute to our team's success.`}
                </p>
              </div>


              <div className="mb-2">
                <h3 className="text-base font-bold text-gray-900 mb-3">
                  Key Requirements
                </h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5">
                    <div className="w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-600 leading-relaxed text-xs">
                      2+ years in hospitality front desk operations, with proven guest service excellence
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-600 leading-relaxed text-xs">
                      Strong capacity for managing reservations, check-ins, and walk-ins
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-600 leading-relaxed text-xs">
                      Excellent communication skills to handle inquiries and drive guest satisfaction
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
