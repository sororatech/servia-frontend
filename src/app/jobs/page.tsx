'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { fetchJobs, Job } from '@/utils/jobApi';

export default function BrowseJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    jobType: [] as string[],
    department: [] as string[],
  });
  const router = useRouter();

  useEffect(() => {
    loadJobs();
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

  const clearFilters = () => {
    setFilters({ jobType: [], department: [] });
    setSearchQuery('');
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

      const deptNormalized = job.department.toLowerCase().replace('_', ' ');
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

              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Department</h4>
                <div className="space-y-3">
                  {['Front Office', 'Housekeeping', 'Marketing', 'Security'].map(dept => {
                    const deptValue = dept.toLowerCase();
                    const isActive = filters.department.includes(deptValue);
                    return (
                      <div
                        key={dept}
                        onClick={() => toggleDepartment(deptValue)}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            isActive
                              ? 'bg-teal-500 border-teal-500'
                              : 'border-gray-300 group-hover:border-teal-400'
                          }`}
                        >
                          {isActive && (
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm ${isActive ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                          {dept}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {(filters.jobType.length > 0 || filters.department.length > 0 || searchQuery) && (
                <div className="mt-6 pt-6 border-t border-gray-100">
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
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all cursor-pointer"
                    onClick={() => router.push(`/jobs/${job.id}`)}
                  >
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl border-2 border-gray-50 bg-gray-200 p-1.5 relative flex items-center justify-center">
                        <Image
                          src="/company-logo.png"
                          alt="Company Logo"
                          fill
                          className="object-contain rounded"
                        />
                      </div>
                      <span className="text-xs font-semibold text-teal-500 bg-teal-50 px-3 py-1 rounded-full">
                        NEW POST
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-gray-900 text-lg mb-2">
                      {job.title}
                    </h3>
                    
                    <p className="text-sm text-teal-600 font-medium mb-4">
                      {job.location}
                    </p>
                    
                    <div className="flex gap-2 mb-6">
                      <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-md font-medium">
                        {job.employment_type.replace('_', ' ')}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-md font-medium">
                        {job.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <button
                      className="w-full bg-teal-500 text-white py-3 rounded-xl hover:bg-teal-600 transition-colors font-semibold text-sm"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}