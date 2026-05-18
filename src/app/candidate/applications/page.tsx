'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { StatCard } from '@/components/ui/StatCard';
import { ApplicationCard } from '@/components/ui/ApplicationCard';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { useApplications } from '@/hooks/useApplications';
import { 
  Play, Star, MessageSquare, Users, Award, XCircle,
  Filter, SlidersHorizontal, ChevronDown, ChevronUp
} from 'lucide-react';
import { useState } from 'react';
import { 
  APPLICATION_FILTER_OPTIONS, 
  REJECTED_STATUSES,
  UI_CONSTANTS 
} from '@/lib/applications';

type FilterStatus = typeof APPLICATION_FILTER_OPTIONS[number]['value'] | 'all';

export default function CandidateDashboardPage() {
  const { applications, loading, error } = useApplications();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
          <LoadingSkeleton/>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-6 py-10">
          <div className="text-center text-red-600 bg-red-50 p-6 rounded-2xl">{error}</div>
        </main>
        <Footer />
      </div>
    );
  }

  const stats = {
    applied: applications.length,
    shortlisted: applications.filter((app) => app.status.toLowerCase() === 'shortlisted').length,
    inReview: applications.filter((app) => 
      ['in_review', 'review', 'screened'].includes(app.status.toLowerCase())
    ).length,
    interview: applications.filter((app) => 
      ['video_submitted', 'interview_scheduled', 'interviewed'].includes(app.status.toLowerCase())
    ).length,
    offers: applications.filter((app) => app.status.toLowerCase() === 'offered').length,
    notSelected: applications.filter((app) => 
      REJECTED_STATUSES.includes(app.status.toLowerCase() as any)
    ).length,
  };

  const filteredApps = applications.filter((app) => {
    const matchesStatus = filterStatus === 'all' 
      ? true 
      : filterStatus === 'rejected_cv'
        ? REJECTED_STATUSES.includes(app.status.toLowerCase() as any)
        : app.status.toLowerCase() === filterStatus;
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      app.job?.title?.toLowerCase().includes(searchLower) ||
      app.job?.location?.toLowerCase().includes(searchLower) ||
      app.job?.department?.toLowerCase().includes(searchLower);
    
    return matchesStatus && matchesSearch;
  });

  const displayedApps = showAll ? filteredApps : filteredApps.slice(0, UI_CONSTANTS.MAX_RECENT_APPS);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <StatCard title="APPLIED" value={stats.applied} icon={<Play className="w-6 h-6" />} variant="primary" />
          <StatCard title="SHORTLISTED" value={stats.shortlisted} icon={<Star className="w-6 h-6" />} variant="secondary" />
          <StatCard title="IN REVIEW" value={stats.inReview} icon={<MessageSquare className="w-6 h-6" />} variant="primary" />
          <StatCard title="INTERVIEW" value={stats.interview} icon={<Users className="w-6 h-6" />} variant="primary" />
          <StatCard title="OFFERS" value={stats.offers} icon={<Award className="w-6 h-6" />} variant="secondary" />
          <StatCard title="NOT SELECTED" value={stats.notSelected} icon={<XCircle className="w-6 h-6" />} variant="primary" />
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Applications</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-full sm:w-64">
                <SearchInput 
                  placeholder="Search applications..." 
                  onSearch={setSearchQuery}
                  debounceMs={300}
                  className="w-full"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                  className="pl-9 pr-8 py-2 bg-white border-2 border-[var(--color-primary)] rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent appearance-none cursor-pointer transition-all duration-200"
                >
                  {APPLICATION_FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <button className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                <SlidersHorizontal className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {displayedApps.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-3xl border border-gray-100">
              <p className="text-gray-500 font-medium">
                {searchQuery ? `No applications match "${searchQuery}"` : 'No applications match this filter'}
              </p>
            </div>
          ) : (
            <div 
              className="space-y-4 transition-all duration-300"
              style={{ 
                maxHeight: showAll ? UI_CONSTANTS.SCROLL_CONTAINER_MAX_HEIGHT : undefined,
                overflowY: showAll ? 'auto' : undefined,
                paddingRight: showAll ? '0.5rem' : undefined
              }}
            >
              {displayedApps.map((app) => (
                <ApplicationCard
                  key={app.id}
                  id={app.id}
                  jobTitle={app.job?.title || 'Position'}
                  company={app.job?.location || 'Remote'}
                  appliedAt={app.applied_at}
                  status={app.status}
                />
              ))}
            </div>
          )}

          {filteredApps.length > UI_CONSTANTS.MAX_RECENT_APPS && (
            <div className="mt-8 flex justify-center">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setShowAll(!showAll)}
                rightIcon={showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              >
                {showAll ? 'Show Less' : `View All (${filteredApps.length})`}
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}