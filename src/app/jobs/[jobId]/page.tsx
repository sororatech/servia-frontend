'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useJobDetail } from '@/hooks/useJob';

export default function JobDetail() {
  const params = useParams();
  const { job, loading, applying, handleApply, salaryInfo, formattedDeadline, requirements, skills, goToJobs, goToDashboard, goToProfile } = useJobDetail(params.jobId as string);

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
          <button onClick={goToJobs} className="text-teal-600 hover:text-teal-700 font-medium text-xs">← Back to Jobs</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 relative">
              <Image src="/servia-logo.png" alt="Servia Logo" fill className="object-contain" priority />
            </div>
          </div>
          <nav className="flex gap-8">
            <button onClick={goToJobs} className="text-teal-600 font-semibold text-sm border-b-2 border-teal-600 pb-0.5">Browse Jobs</button>
            <button onClick={goToDashboard} className="text-gray-400 hover:text-gray-600 font-medium text-sm">My Applications</button>
          </nav>
          <button onClick={goToProfile} className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors" title="Profile">
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="flex w-full shadow-xl rounded-2xl overflow-hidden">
          <div className="w-80 flex-shrink-0 bg-gradient-to-br from-blue-50 to-teal-50 p-6 flex flex-col">
            <div className="mb-4">
              <div className="w-14 h-14 relative mb-2">
                <Image src="/specific-logo-.png" alt="Company Logo" fill className="object-contain" />
              </div>
              <h3 className="font-bold text-black mb-2 text-lg leading-tight" title={job.title}>{job.title}</h3>
              <p className="text-teal-600 font-medium text-xs mb-4 truncate" title={`${job.department} • ${job.location}`}>{job.department} • {job.location}</p>

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
                  <h4 className="text-xs font-normal text-teal-600 uppercase mb-2">Core Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((skill: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-blue-100 text-gray-700 text-xs font-medium rounded-full truncate" title={skill}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-auto pt-4 border-t border-gray-200">
              <button onClick={handleApply} disabled={applying} className="w-full bg-teal-500 text-white py-3 rounded-xl hover:bg-teal-600 transition-colors font-semibold text-xs shadow-lg shadow-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {applying ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Applying...</> : 'Apply Now'}
              </button>
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
              <button onClick={goToJobs} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
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
                      <div className="w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
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