'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useJobDetail } from '@/hooks/useJob';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';

export default function JobDetail() {
  const params = useParams();
  const { job, loading, applying, errorMessage, clearError, handleApply, salaryInfo, formattedDeadline, requirements, skills, goToJobs, goToDashboard, goToProfile } = useJobDetail(params.jobId as string);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSkeleton variant="card" className="max-w-2xl w-full mx-4" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4 text-sm">Job not found</p>
          <Button variant="ghost" size="sm" onClick={goToJobs} className="font-medium">
            ← Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="flex w-full shadow-xl rounded-2xl overflow-hidden">
          <div className="w-80 flex-shrink-0 bg-gradient-to-br from-blue-50 to-[#26B9C8]/10 p-6 flex flex-col">
            
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700 flex-1">{errorMessage}</p>
                <button onClick={clearError} className="text-red-400 hover:text-red-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <div className="mb-4">
              <div className="w-14 h-14 relative mb-2">
                <Image src="/specific-logo-.png" alt="Company Logo" fill className="object-contain" />
              </div>
              <h3 className="font-bold text-black mb-2 text-lg leading-tight" title={job.title}>{job.title}</h3>
              <p className="text-[#26B9C8] font-medium text-xs mb-4 truncate" title={`${job.department} • ${job.location}`}>{job.department} • {job.location}</p>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-white rounded-lg p-2 border border-gray-100 text-center">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Salary</p>
                  <p className="text-xs font-bold text-gray-900 leading-tight">{salaryInfo.amount}</p>
                </div>
                <div className="bg-white rounded-lg p-2 border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5 text-center">Type</p>
                  <p className="text-xs font-bold text-gray-900 truncate text-center" title={job.employment_type.replace('_', ' ')}>{job.employment_type.replace('_', ' ')}</p>
                </div>
              </div>

              {skills.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-normal text-[#26B9C8] uppercase mb-2">Core Skills</h4>
                 <div className="flex flex-wrap gap-1.5">
                    {skills.map((skill: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-blue-100 text-gray-700 text-xs font-medium rounded-full truncate" title={skill}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-auto pt-4 border-t border-gray-200">
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={handleApply}
                disabled={applying}
                isLoading={applying}
                className="!rounded-xl"
              >
                {applying ? 'Applying...' : 'Apply Now'}
              </Button>
              
              {formattedDeadline ? (
                <p className="text-xs text-gray-600 text-center mt-3 font-medium">Applications close on <span className="text-gray-900 font-bold">{formattedDeadline}</span></p>
              ) : (
                <p className="text-xs text-gray-400 text-center mt-3 font-medium">No application deadline</p>
              )}
            </div>
          </div>

          <div className="flex-1 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-gray-900">About the Role</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToJobs}
                className="!p-2 !h-auto"
                aria-label="Back to Jobs"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            <div className="mb-4">
              <p className="text-gray-600 leading-relaxed mb-3 text-sm">
                {job.description || `At Servia Hotels, we are crafting exceptional hospitality experiences for discerning guests. As a ${job.title}, you will be the primary architect of our front desk operations...`}
              </p>
            </div>
            {requirements.length > 0 && (
              <div>
                <h3 className="text-gray-900 mb-3">Key Requirements</h3>
                <ul className="space-y-2.5">
                  {requirements.map((req: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="w-4 h-4 bg-[#26B9C8] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </div>
                      <span className="text-gray-600 leading-relaxed text-sm">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}