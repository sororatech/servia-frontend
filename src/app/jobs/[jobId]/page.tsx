'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useJobDetail } from '@/hooks/useJob';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Footer } from '@/components/layout/Footer';

export default function JobDetail() {
  const params = useParams();
  const { job, loading, applying, errorMessage, clearError, handleApply, salaryInfo, formattedDeadline, requirements, skills, goToJobs, goToDashboard, goToProfile } = useJobDetail(params.jobId as string);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] dark:bg-[var(--color-warm-bg-deep)] flex items-center justify-center transition-colors">
        <LoadingSkeleton variant="card" className="max-w-2xl w-full mx-4" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] dark:bg-[var(--color-warm-bg-deep)] flex items-center justify-center transition-colors">
        <div className="text-center">
          <p className="text-[var(--color-text-muted)] mb-4 text-sm">Job not found</p>
          <Button variant="ghost" size="sm" onClick={goToJobs} className="font-medium">
            ← Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] dark:bg-[var(--color-warm-bg-deep)] flex flex-col transition-colors">
      <Navbar />

      <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* FIX: Changed to flex-col on mobile, flex-row on desktop. Added border for dark mode definition */}
        <div className="flex flex-col lg:flex-row w-full shadow-xl rounded-2xl overflow-hidden border border-[var(--color-warm-border)]">
          
          {/* Left Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0 bg-[var(--color-warm-bg-page)] dark:bg-[var(--color-warm-bg-deep)] p-6 flex flex-col border-b lg:border-b-0 lg:border-r border-[var(--color-warm-border)]">
            
            {errorMessage && (
              <div className="mb-4 p-3 bg-[var(--color-status-error-bg)] border border-[var(--color-status-error-border)] rounded-lg flex items-start gap-2">
                <svg className="w-4 h-4 text-[var(--color-status-error-text)] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-[var(--color-status-error-text)] flex-1">{errorMessage}</p>
                <button onClick={clearError} className="text-[var(--color-status-error-text)]/60 hover:text-[var(--color-status-error-text)] transition-colors">
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
              <h3 className="font-bold text-[var(--color-foreground)] mb-2 text-lg leading-tight" title={job.title}>{job.title}</h3>
              <p className="text-[var(--color-primary)] font-medium text-xs mb-4 truncate" title={`${job.department} • ${job.location}`}>{job.department} • {job.location}</p>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-white dark:bg-[var(--color-warm-surface)] rounded-lg p-2 border border-[var(--color-warm-border)] text-center">
                  <p className="text-[10px] text-[var(--color-text-faint)] uppercase font-semibold mb-0.5">Salary</p>
                  <p className="text-xs font-bold text-[var(--color-foreground)] leading-tight">{salaryInfo.amount}</p>
                </div>
                <div className="bg-white dark:bg-[var(--color-warm-surface)] rounded-lg p-2 border border-[var(--color-warm-border)]">
                  <p className="text-[10px] text-[var(--color-text-faint)] uppercase font-semibold mb-0.5 text-center">Type</p>
                  <p className="text-xs font-bold text-[var(--color-foreground)] truncate text-center" title={job.employment_type.replace('_', ' ')}>{job.employment_type.replace('_', ' ')}</p>
                </div>
              </div>

              {skills.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-[var(--color-primary)] uppercase mb-2">Core Skills</h4>
                 <div className="flex flex-wrap gap-1.5">
                    {skills.map((skill: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-[var(--color-teal-light)] text-[var(--color-teal-dark)] text-xs font-medium rounded-full truncate border border-[var(--color-teal-border)]" title={skill}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-auto pt-4 border-t border-[var(--color-warm-border)]">
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={handleApply}
                disabled={applying || errorMessage?.toLowerCase().includes('already applied')}
                isLoading={applying}
                className="!rounded-xl"
              >
                {applying 
                  ? 'Applying...' 
                  : errorMessage?.toLowerCase().includes('already applied') 
                    ? 'Already Applied' 
                    : 'Apply Now'}
              </Button>
              
              {formattedDeadline ? (
                <p className="text-xs text-[var(--color-text-muted)] text-center mt-3 font-medium">Applications close on <span className="text-[var(--color-foreground)] font-bold">{formattedDeadline}</span></p>
              ) : (
                <p className="text-xs text-[var(--color-text-faint)] text-center mt-3 font-medium">No application deadline</p>
              )}
            </div>
          </div>

          {/* Right Main Content */}
          <div className="flex-1 bg-white dark:bg-[var(--color-warm-surface)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--color-foreground)]">About the Role</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToJobs}
                className="!p-2 !h-auto"
                aria-label="Back to Jobs"
              >
                <svg className="w-4 h-4 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            <div className="mb-6">
              {/* Added whitespace-pre-wrap to respect line breaks from the backend */}
              <p className="text-[var(--color-text-body)] leading-relaxed mb-3 text-sm whitespace-pre-wrap">
                {job.description || `At Servia Hotels, we are crafting exceptional hospitality experiences for discerning guests. As a ${job.title}, you will be the primary architect of our front desk operations...`}
              </p>
            </div>
            {requirements.length > 0 && (
              <div>
                <h3 className="text-[var(--color-foreground)] font-semibold mb-3">Key Requirements</h3>
                <ul className="space-y-2.5">
                  {requirements.map((req: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="w-4 h-4 bg-[var(--color-primary)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </div>
                      <span className="text-[var(--color-text-body)] leading-relaxed text-sm">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}