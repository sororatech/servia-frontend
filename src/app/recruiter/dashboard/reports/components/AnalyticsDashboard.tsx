'use client';

import { useAnalytics } from '@/hooks/useAnalytics';
import { AnalyticsData } from '@/types/analytics';
import StatsCard from './StatsCard';
import AIFitScoreChart from './AIFitScoreChart';
import PipelineBreakdown from './PipelineBreakdown';
import ApplicationsChart from './ApplicationsChart';
import ApplicationsTable from './ApplicationsTable';

import dynamic from 'next/dynamic';
const ExportButtons = dynamic(() => import('./ExportButtons'), { 
  ssr: false,
  loading: () => <span className="text-sm text-gray-400 px-4 py-2">Loading export...</span>
});

interface Props {
  initialData?: AnalyticsData;
}

export default function AnalyticsDashboard({ initialData }: Props) {
  const { data, loading, error, refresh } = useAnalytics({
    autoRefresh: true,
    refreshInterval: 60000,
    initialData,
  });

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
          <div className="text-red-500 text-4xl mb-4"></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load analytics</h2>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <button
            onClick={refresh}
            className="px-5 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
            <p className="text-gray-500 mt-1">Track recruitment performance and AI efficacy</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={refresh}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : '↻ Refresh'}
            </button>
            <ExportButtons data={data} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total Applications" value={data.total_applications} />
          <StatsCard title="Total Applicants" value={data.total_applicants} />
          <StatsCard title="Avg AI Fit Score" value={data.avg_ai_fit_score} suffix="%" />
          <StatsCard title="Acceptance Rate" value={data.acceptance_rate} suffix="%" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="h-96">
            <AIFitScoreChart data={data.ai_fit_score_distribution} />
          </div>
          <div className="h-96">
            <PipelineBreakdown data={data.pipeline_breakdown} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96">
            <ApplicationsChart data={data.applications_over_time} />
          </div>
          <div className="h-96">
            <ApplicationsTable data={data.applications_by_job} />
          </div>
        </div>
      </main>
    </div>
  );
}