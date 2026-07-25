'use client';

import { Suspense, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useBrowseJobs } from '@/hooks/useJob';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Button } from '@/components/ui/Button';
import { Footer } from '@/components/layout/Footer';
import { X, SlidersHorizontal } from 'lucide-react';

const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('auth_token');
};

function BrowseJobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const {
    jobs, loading, searchQuery, setSearchQuery, departmentGroups,
    expandedCategories, filters, toggleJobType, toggleDepartment,
    toggleCategory, clearFilters, getPostedDate, getDeadlineText,
    goToJob, goToDashboard, goToProfile
  } = useBrowseJobs();

  // Sync URL search param with the hook's searchQuery
  useEffect(() => {
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
    }
  }, [urlSearch, searchQuery, setSearchQuery]);

  const handleViewJobDetails = (jobId: string) => {
    if (!isAuthenticated()) {
      const redirectUrl = encodeURIComponent(`/jobs/${jobId}`);
      router.push(`/login?redirect=${redirectUrl}`);
      return;
    }
    router.push(`/jobs/${jobId}`);
  };

  // Extracted filter content to reuse in both desktop sidebar and mobile drawer
  const FilterContent = () => (
    <>
      <div className="mb-8">
        <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">Job Type</h4>
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
                    : '!text-[var(--color-text-muted)] !border !border-[var(--color-warm-border)] hover:!border-[var(--color-primary)] hover:!text-[var(--color-primary)]'
                }`}
              >
                {type}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="mb-8">
        <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">Department</h4>
        <div className="space-y-1">
          {Object.keys(departmentGroups).length === 0 ? (
            <div className="animate-pulse space-y-3 py-2">
              <div className="h-4 bg-[var(--color-warm-border)] rounded w-1/2"></div>
              <div className="h-4 bg-[var(--color-warm-border)] rounded w-3/4"></div>
              <div className="h-4 bg-[var(--color-warm-border)] rounded w-2/3"></div>
            </div>
          ) : (
            Object.entries(departmentGroups).map(([category, depts]) => {
              const selectedCount = depts.filter(d => filters.department.includes(d.value)).length;
              const isExpanded = expandedCategories.includes(category);
              return (
                <div key={category}>
                  <button 
                    onClick={() => toggleCategory(category)} 
                    className="flex items-center justify-between py-2 cursor-pointer hover:bg-[var(--color-warm-bg-page)] dark:hover:bg-[var(--color-warm-bg-deep)] rounded px-2 transition-colors w-full text-left"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-sm font-semibold text-[var(--color-foreground)]">{category}</span>
                      {selectedCount > 0 && <span className="text-xs text-[var(--color-primary)] font-medium">({selectedCount})</span>}
                    </div>
                    <svg className={`w-4 h-4 text-[var(--color-text-faint)] transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium' 
                                : 'text-[var(--color-text-body)] hover:bg-[var(--color-warm-bg-page)] dark:hover:bg-[var(--color-warm-bg-deep)] hover:text-[var(--color-foreground)]'
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
          <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Selected</h4>
          <div className="flex flex-wrap gap-2">
            {filters.department.map(val => {
              const label = Object.values(departmentGroups).flat().find(d => d.value === val)?.label || val;
              return (
                <span key={val} className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs rounded-md">
                  {label}
                  <button 
                    onClick={() => toggleDepartment(val)} 
                    className="hover:text-[var(--color-primary)]/70 transition-colors p-0.5"
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
        <div className="pt-6 border-t border-[var(--color-warm-border)]">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="!p-0 !h-auto font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
          >
            Clear all filters
          </Button>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)] dark:bg-[var(--color-warm-bg-deep)] transition-colors">
      <Navbar />

      <div className="flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6">
          <Button variant="secondary" onClick={() => setIsMobileFilterOpen(true)} fullWidth className="flex items-center justify-center gap-2">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 pt-4 lg:pt-0">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <h3 className="font-bold text-[var(--color-foreground)] mb-6 text-base">Filters</h3>
              <FilterContent />
            </div>
          </aside>

          {/* Mobile Filter Drawer */}
          {isMobileFilterOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-[var(--color-warm-surface)] shadow-2xl p-6 overflow-y-auto transition-transform">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-[var(--color-foreground)] text-lg">Filters</h3>
                  <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 rounded-full hover:bg-[var(--color-warm-bg-page)] dark:hover:bg-[var(--color-warm-bg-deep)] transition-colors">
                    <X className="w-5 h-5 text-[var(--color-text-muted)]" />
                  </button>
                </div>
                <FilterContent />
                <div className="mt-8 pt-6 border-t border-[var(--color-warm-border)]">
                  <Button variant="primary" fullWidth onClick={() => setIsMobileFilterOpen(false)}>
                    Show Results
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Main Job Grid */}
          <main className="flex-1">
            {loading ? (
              <LoadingSkeleton variant="list" className="w-full" />
            ) : jobs.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[var(--color-warm-surface)] rounded-2xl border border-[var(--color-warm-border)]">
                <p className="text-[var(--color-text-muted)] mb-4">
                  {searchQuery || filters.jobType.length > 0 || filters.department.length > 0 
                    ? 'No jobs match your filters.' 
                    : 'No jobs available at the moment.'}
                </p>
                {(searchQuery || filters.jobType.length > 0 || filters.department.length > 0) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="font-medium text-[var(--color-primary)]"
                  >
                    Clear filters to see all jobs
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map(job => {
                  const postedDate = getPostedDate(job);
                  const deadlineText = getDeadlineText(job);
                  const isClosed = deadlineText?.text === 'Closed';
                  
                  return (
                    <div 
                      key={job.id} 
                      onClick={!isClosed ? () => handleViewJobDetails(job.id) : undefined}
                      className={`bg-white dark:bg-[var(--color-warm-surface)] rounded-2xl p-6 border border-[var(--color-warm-border)] transition-all ${
                        isClosed 
                          ? 'cursor-not-allowed opacity-75' 
                          : 'cursor-pointer hover:shadow-lg hover:border-[var(--color-primary)]/30 dark:hover:border-[var(--color-primary)]/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl border border-[var(--color-warm-border)] bg-[var(--color-warm-bg-page)] dark:bg-[var(--color-warm-bg-deep)] p-1.5 relative flex items-center justify-center flex-shrink-0">
                          <Image src="/company-logo.png" alt="Company Logo" fill className="object-contain rounded" />
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <span className="text-xs font-semibold text-[var(--color-text-muted)] bg-[var(--color-warm-bg-page)] dark:bg-[var(--color-warm-bg-deep)] px-3 py-1 rounded-full block">
                            {postedDate}
                          </span>
                          {deadlineText && (
                            <span className={`text-[10px] mt-1 block font-medium ${
                              isClosed ? 'text-[var(--color-status-error-text)]' : 'text-[var(--color-status-active-text)]'
                            }`}>
                              {deadlineText.text}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-[var(--color-foreground)] text-lg mb-1 line-clamp-2">{job.title}</h3>
                      <p className="text-sm text-[var(--color-primary)] font-medium mb-4">{job.location}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="text-xs bg-[var(--color-warm-bg-page)] dark:bg-[var(--color-warm-bg-deep)] text-[var(--color-text-body)] px-3 py-1.5 rounded-md font-medium border border-[var(--color-warm-border)]">
                          {job.employment_type.replace('_', ' ')}
                        </span>
                        <span className={`text-xs px-3 py-1.5 rounded-md font-medium border ${
                          job.is_active 
                            ? 'bg-[var(--color-status-active-bg)] text-[var(--color-status-active-text)] border-[var(--color-status-active-border)]' 
                            : 'bg-[var(--color-status-error-bg)] text-[var(--color-status-error-text)] border-[var(--color-status-error-border)]'
                        }`}>
                          {job.is_active ? 'Active' : 'Inactive'}
                        </span>
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
                        <p className="text-xs text-[var(--color-text-muted)] mt-3 text-center">
                          {job.openings_remaining} {job.openings_remaining === 1 ? 'opening' : 'openings'} remaining
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function BrowseJobs() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-[var(--color-background)] dark:bg-[var(--color-warm-bg-deep)]">
        <div className="flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <LoadingSkeleton variant="page" />
        </div>
      </div>
    }>
      <BrowseJobsContent />
    </Suspense>
  );
}