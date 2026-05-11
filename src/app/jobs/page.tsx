'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { fetchJobs, Job } from '@/utils/jobApi';
import { api } from '@/lib/api';

type DepartmentGroup = Record<string, { value: string; label: string }[]>;

export default function BrowseJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentGroups, setDepartmentGroups] = useState<DepartmentGroup>({});
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    jobType: [] as string[],
    department: [] as string[],
  });
  const router = useRouter();

  useEffect(() => {
    loadJobs();
    loadDepartmentCategories();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await fetchJobs();
      setJobs(data);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartmentCategories = async () => {
    try {
      const response = await api.get('/jobs/departments/categories/');
      setDepartmentGroups(response.data);
    } catch (error) {
      console.error('Failed to load department categories:', error);
      setDepartmentGroups({});
    }
  };

  const normalizeJobType = (type: string) => {
    return type.toLowerCase().replace('_', '-');
  };

  const toggleJobType = (value: string) => {
    setFilters(prev => ({
      ...prev,
      jobType: prev.jobType.includes(value)
        ? prev.jobType.filter(v => v !== value)
        : [...prev.jobType, value]
    }));
  };

  const toggleDepartment = (value: string) => {
    setFilters(prev => ({
      ...prev,
      department: prev.department.includes(value)
        ? prev.department.filter(v => v !== value)
        : [...prev.department, value]
    }));
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setFilters({ jobType: [], department: [] });
    setSearchQuery('');
  };

  const getPostedDateBadge = (dateStr?: string): string => {
    if (!dateStr) return 'Recently Posted';
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getDeadlineText = (deadline?: string | null): { text: string; className: string } | null => {
    if (!deadline) return null;
    
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Closed', className: 'text-gray-400' };
    if (diffDays === 0) return { text: '• Closes today', className: 'text-red-500 font-medium' };
    if (diffDays === 1) return { text: '• 1 day left', className: 'text-orange-500 font-medium' };
    if (diffDays <= 3) return { text: `• ${diffDays} days left`, className: 'text-orange-500' };
    if (diffDays <= 7) return { text: `• ${diffDays} days left`, className: 'text-yellow-600' };
    return { text: `• ${diffDays} days remaining`, className: 'text-green-400' };
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        job.title.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.location.toLowerCase().includes(searchLower) ||
        job.department.toLowerCase().includes(searchLower);

      const jobTypeNormalized = normalizeJobType(job.employment_type);
      const matchesJobType =
        filters.jobType.length === 0 ||
        filters.jobType.includes(jobTypeNormalized);

      const deptNormalized = job.department.toLowerCase().replace(/_/g, ' ');
      const matchesDepartment =
        filters.department.length === 0 ||
        filters.department.includes(deptNormalized);

      return matchesSearch && matchesJobType && matchesDepartment;
    });
  }, [jobs, searchQuery, filters]);

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 relative">
                <Image
                  src="/servia-logo.png"
                  alt="Servia Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            
            <nav className="flex gap-8">
              <button className="text-teal-600 font-semibold text-base border-b-2 border-teal-600 pb-1">
                Browse Jobs
              </button>
              <button 
                onClick={() => router.push('/candidate/dashboard')}
                className="text-gray-400 hover:text-gray-600 font-medium text-base"
              >
                My Applications
              </button>
            </nav>

            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-50 border border-gray-200 px-5 py-2.5 rounded-full text-sm w-72 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-700 placeholder-gray-400"
                />
                <svg className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button 
                onClick={() => router.push('/candidate/profile')}
                className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                title="Profile"
              >
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex gap-12">
          <aside className="w-56 flex-shrink-0">
            <div className="sticky top-8">
              <h3 className="font-bold text-gray-900 mb-6 text-base">Filters</h3>
              
              <div className="mb-8">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Job Type</h4>
                <div className="flex flex-wrap gap-2">
                  {['Full-time', 'Part-time', 'Contract'].map(type => {
                    const isActive = filters.jobType.includes(type.toLowerCase());
                    return (
                      <button
                        key={type}
                        onClick={() => toggleJobType(type.toLowerCase())}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                          isActive
                            ? 'bg-teal-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Department</h4>
                <div className="space-y-1">
                  {Object.entries(departmentGroups).map(([category, depts]) => {
                    const allValues = depts.map(d => d.value);
                    const selectedCount = allValues.filter(v => filters.department.includes(v)).length;
                    const isExpanded = expandedCategories.includes(category);
                    
                    return (
                      <div key={category}>
                        <div
                          onClick={() => toggleCategory(category)}
                          className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 rounded px-2 transition-colors"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-sm font-semibold text-gray-800">
                              {category}
                            </span>
                            {selectedCount > 0 && (
                              <span className="text-xs text-teal-600 font-medium">
                                ({selectedCount})
                              </span>
                            )}
                          </div>
                          <svg
                            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        
                        {isExpanded && (
                          <div className="pl-4 space-y-0.5 pb-2">
                            {depts.map((dept) => {
                              const isSelected = filters.department.includes(dept.value);
                              return (
                                <div
                                  key={dept.value}
                                  onClick={() => toggleDepartment(dept.value)}
                                  className={`flex items-center gap-2 cursor-pointer py-1.5 px-2 rounded text-sm transition-colors ${
                                    isSelected 
                                      ? 'bg-teal-50 text-teal-700 font-medium' 
                                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                  }`}
                                >
                                  <span>{dept.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {filters.department.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Selected</h4>
                  <div className="flex flex-wrap gap-2">
                    {filters.department.map((deptValue) => {
                      const deptLabel = Object.values(departmentGroups)
                        .flat()
                        .find((d) => d.value === deptValue)?.label || deptValue;
                      
                      return (
                        <span
                          key={deptValue}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 text-xs rounded-md"
                        >
                          {deptLabel}
                          <button
                            onClick={() => toggleDepartment(deptValue)}
                            className="hover:text-teal-900"
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
                  <button
                    onClick={clearFilters}
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </aside>

          <main className="flex-1">
            {loading ? (
              <p className="text-gray-500">Loading jobs...</p>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 mb-4">
                  {searchQuery || filters.jobType.length > 0 || filters.department.length > 0
                    ? 'No jobs match your filters.'
                    : 'No jobs available at the moment.'}
                </p>
                {(searchQuery || filters.jobType.length > 0 || filters.department.length > 0) && (
                  <button
                    onClick={clearFilters}
                    className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                  >
                    Clear filters to see all jobs
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {filteredJobs.map((job) => {
                  const postedDate = getPostedDateBadge(job.created_at);
                  const deadlineText = getDeadlineText(job.application_deadline);
                  
                  return (
                    <div
                      key={job.id}
                      className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all cursor-pointer"
                      onClick={() => router.push(`/jobs/${job.id}`)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl border-2 border-gray-50 bg-gray-200 p-1.5 relative flex items-center justify-center">
                          <Image
                            src="/company-logo.png"
                            alt="Company Logo"
                            fill
                            className="object-contain rounded"
                          />
                        </div>
                        
                        <div className="text-right">
                          <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1 rounded-full block">
                            {postedDate}
                          </span>
                          {deadlineText && (
                            <span className={`text-[10px] mt-0.5 block ${deadlineText.className}`}>
                              {deadlineText.text}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-gray-900 text-lg mb-1">
                        {job.title}
                      </h3>
                      
                      <p className="text-sm text-teal-600 font-medium mb-4">
                        {job.location}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-md font-medium">
                          {job.employment_type.replace('_', ' ')}
                        </span>
                        <span className={`text-xs px-3 py-1.5 rounded-md font-medium ${
                          job.is_active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {job.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <button
                        className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
                          deadlineText?.text === '• Closed'
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-teal-500 text-white hover:bg-teal-600'
                        }`}
                        disabled={deadlineText?.text === '• Closed'}
                      >
                        {deadlineText?.text === '• Closed' ? 'Application Closed' : 'View Details'}
                      </button>

                      {typeof job.openings_remaining === 'number' && job.openings_remaining > 0 && (
                        <p className="text-xs text-gray-500 mt-2 text-center">
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
    </div>
  );
}