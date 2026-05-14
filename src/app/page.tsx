'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { useBrowseJobs } from '@/hooks/useJob';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Button } from '@/components/ui/Button';
import { Footer } from '@/components/layout/Footer';

const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('auth_token');
};

export default function BrowseJobs() {
  const router = useRouter();
  const {
    jobs, loading, searchQuery, setSearchQuery, departmentGroups,
    expandedCategories, filters, toggleJobType, toggleDepartment,
    toggleCategory, clearFilters, getPostedDate, getDeadlineText,
    goToJob, goToDashboard, goToProfile
  } = useBrowseJobs();

  const handleViewJobDetails = (jobId: string) => {
    if (!isAuthenticated()) {
      const redirectUrl = encodeURIComponent(`/jobs/${jobId}`);
      router.push(`/login?redirect=${redirectUrl}`);
      return;
    }
    router.push(`/jobs/${jobId}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-8 py-8 flex gap-12 pt-8 w-full">
        <aside className="w-56 flex-shrink-0">
          <div className="sticky top-8">
            <h3 className="font-bold text-gray-900 mb-6 text-base">Filters</h3>
            <div className="mb-8">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Job Type</h4>
              <div className="flex flex-wrap gap-2">
                {['Full-time', 'Part-time', 'Contract'].map(type => {
                  const isActive = filters.jobType.includes(type.toLowerCase());
                  return (
                    <Button
                      key={type}
                      variant={isActive ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => toggleJobType(type.toLowerCase())}
                      className={`!rounded-md transition-all duration-200 ${
                        isActive 
                          ? '' 
                          : '!text-gray-500 !border-2 !border-[#26B9C8] hover:!outline-2 hover:!outline-[#26B9C8] hover:!outline-offset-2'
                      }`}
                    >
                      {type}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Department</h4>
              <div className="space-y-1">
                {Object.keys(departmentGroups).length === 0 ? (
                  <div className="animate-pulse space-y-3 py-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                  </div>
                ) : (
                  Object.entries(departmentGroups).map(([category, depts]) => {
                    const selectedCount = depts.filter(d => filters.department.includes(d.value)).length;
                    const isExpanded = expandedCategories.includes(category);
                    return (
                      <div key={category}>
                        <button 
                          onClick={() => toggleCategory(category)} 
                          className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 rounded px-2 transition-colors w-full text-left"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-sm font-semibold text-gray-800">{category}</span>
                            {selectedCount > 0 && <span className="text-xs text-[#26B9C8] font-medium">({selectedCount})</span>}
                          </div>
                          <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isExpanded && (
                          <div className="pl-4 space-y-0.5 pb-2">
                            {depts.map(dept => {
                              const isSelected = filters.department.includes(dept.value);
                              return (
                                <button
                                  key={dept.value}
                                  onClick={() => toggleDepartment(dept.value)}
                                  className={`flex items-center gap-2 cursor-pointer py-1.5 px-2 rounded text-sm transition-colors w-full text-left ${
                                    isSelected 
                                      ? 'bg-[#26B9C8]/10 text-[#26B9C8] font-medium' 
                                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                  }`}
                                >
                                  <span>{dept.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {filters.department.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Selected</h4>
                <div className="flex flex-wrap gap-2">
                  {filters.department.map(val => {
                    const label = Object.values(departmentGroups).flat().find(d => d.value === val)?.label || val;
                    return (
                      <span key={val} className="inline-flex items-center gap-1 px-2 py-1 bg-[#26B9C8]/10 text-[#26B9C8] text-xs rounded-md">
                        {label}
                        <button 
                          onClick={() => toggleDepartment(val)} 
                          className="hover:text-[#26B9C8]/70 transition-colors p-0.5"
                          aria-label={`Remove ${label} filter`}
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {(filters.jobType.length > 0 || filters.department.length > 0 || searchQuery) && (
              <div className="pt-6 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="!p-0 !h-auto font-medium"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1">
          {loading ? (
            <LoadingSkeleton variant="list" className="w-full" />
          ) : jobs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 mb-4">{searchQuery || filters.jobType.length > 0 || filters.department.length > 0 ? 'No jobs match your filters.' : 'No jobs available at the moment.'}</p>
              {(searchQuery || filters.jobType.length > 0 || filters.department.length > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="font-medium"
                >
                  Clear filters to see all jobs
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {jobs.map(job => {
                const postedDate = getPostedDate(job);
                const deadlineText = getDeadlineText(job);
                const isClosed = deadlineText?.text === 'Closed';
                
                return (
                  <div 
                    key={job.id} 
                    onClick={!isClosed ? () => handleViewJobDetails(job.id) : undefined}
                    className={`bg-white rounded-2xl p-6 border border-gray-100 transition-all ${
                      isClosed 
                        ? 'cursor-not-allowed opacity-75' 
                        : 'cursor-pointer hover:shadow-xl hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl border-2 border-gray-50 bg-gray-200 p-1.5 relative flex items-center justify-center">
                        <Image src="/company-logo.png" alt="Company Logo" fill className="object-contain rounded" />
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1 rounded-full block">{postedDate}</span>
                        {deadlineText && <span className={`text-[10px] mt-0.5 block ${deadlineText.className}`}>{deadlineText.text}</span>}
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{job.title}</h3>
                    <p className="text-sm text-[#26B9C8] font-medium mb-4">{job.location}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-md font-medium">{job.employment_type.replace('_', ' ')}</span>
                      <span className={`text-xs px-3 py-1.5 rounded-md font-medium ${job.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{job.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                    
                    <Button
                      variant={isClosed ? 'secondary' : 'primary'}
                      size="md"
                      fullWidth
                      disabled={isClosed}
                      className="!rounded-xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isClosed) handleViewJobDetails(job.id);
                      }}
                    >
                      {isClosed ? 'Application Closed' : 'View Details'}
                    </Button>
                    
                    {typeof job.openings_remaining === 'number' && job.openings_remaining > 0 && (
                      <p className="text-xs text-gray-500 mt-2 text-center">{job.openings_remaining} {job.openings_remaining === 1 ? 'opening' : 'openings'} remaining</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}