'use client';

import { useRef } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { AnalyticsData } from '@/types/analytics';
import { Button } from '@/components/ui/Button';
import { LoadingSkeleton } from '@/components/ui';
import { RefreshCw } from 'lucide-react';
import dynamic from 'next/dynamic';
import StatsCard from './StatsCard';
import AIFitScoreChart from './AIFitScoreChart';
import PipelineBreakdown from './PipelineBreakdown';
import ApplicationsChart from './ApplicationsChart';
import ApplicationsTable from './ApplicationsTable';

const ExportButtons = dynamic(
  () => import('./ExportButtons'),
  { ssr: false, loading: () => <Button variant="ghost" disabled>Loading...</Button> }
);

interface Props {
  initialData?: AnalyticsData;
}

export default function AnalyticsDashboard({ initialData }: Props) {
  const { data, loading, error, refresh } = useAnalytics({
    autoRefresh: true,
    refreshInterval: 60000,
    initialData,
  });

  const contentRef = useRef<HTMLDivElement>(null);

  if (loading && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page-gradient px-4 py-8 sm:px-6 lg:px-10">
        <div className="w-full max-w-7xl">
          <div className="mb-8">
            <LoadingSkeleton className="h-10 w-64" />
            <LoadingSkeleton className="mt-3 h-6 w-96" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <LoadingSkeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LoadingSkeleton className="h-96 rounded-2xl" />
            <LoadingSkeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page-gradient p-8">
        <div className="max-w-md w-full rounded-2xl border border-[var(--color-status-error-border)] bg-white p-8 text-center shadow-sm">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="mb-2 text-xl font-bold text-[var(--color-status-error-text)]">
            Failed to load analytics
          </h2>
          <p className="mb-6 text-sm text-[var(--color-text-muted)]">{error.message}</p>
          <Button variant="primary" onClick={refresh}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-page-gradient px-4 py-8 sm:px-6 lg:px-25">
      <div className="mx-auto max-w-8xl">
        {/* Header (with buttons) – excluded from PDF screenshot */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between exclude-from-pdf">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-secondary)]">Analytics & Reports</h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Track recruitment performance and AI efficacy
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ExportButtons data={data} contentRef={contentRef} />
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              disabled={loading}
              aria-label="Refresh analytics"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content to be captured in PDF */}
        <div ref={contentRef}>
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
        </div>
      </div>
    </div>
  );
}