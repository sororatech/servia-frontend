import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { AnalyticsData } from '@/types/analytics';

interface UseAnalyticsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  initialData?: AnalyticsData;
}

export function useAnalytics({ autoRefresh = true, refreshInterval = 60000, initialData }: UseAnalyticsOptions) {
  const [data, setData] = useState<AnalyticsData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all required data in parallel
      const [jobsRes, candidatesRes, reportsRes] = await Promise.all([
        api.get('/jobs/jobs/'),
        api.get('/candidates/candidates/'),
        api.get('/ai-reports/reports/'),
      ]);

      const jobs = jobsRes.data.results || [];
      const candidates = candidatesRes.data.results || [];
      const reports = reportsRes.data.results || [];

      // Build job lookup map
      const jobMap = new Map();
      jobs.forEach((job: any) => {
        jobMap.set(job.id, {
          id: job.id,
          title: job.title,
          department: job.department_display || job.department,
        });
      });

      // 1. AI Fit Score Distribution – group reports by job title
      const jobScores: Record<string, { total: number; count: number; title: string }> = {};
      reports.forEach((report: any) => {
        const candidate = candidates.find((c: any) => c.id === report.candidate);
        if (candidate) {
          const jobId = candidate.job;
          const job = jobMap.get(jobId);
          if (job) {
            if (!jobScores[jobId]) {
              jobScores[jobId] = { total: 0, count: 0, title: job.title };
            }
            jobScores[jobId].total += report.fit_score || 0;
            jobScores[jobId].count += 1;
          }
        }
      });

      const ai_fit_score_distribution = Object.values(jobScores).map((item) => ({
        job_title: item.title,
        average_score: Math.round((item.total / item.count) * 10) / 10,
      }));

      // 2. Pipeline Breakdown – count candidates by status
      const statusCounts: Record<string, number> = {};
      candidates.forEach((candidate: any) => {
        const status = candidate.status || 'unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      const pipeline_breakdown = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
      }));

      // 3. Applications By Job – count candidates by job title
      const jobCounts: Record<string, { count: number; title: string }> = {};
      candidates.forEach((candidate: any) => {
        const jobId = candidate.job;
        const job = jobMap.get(jobId);
        if (job) {
          if (!jobCounts[jobId]) {
            jobCounts[jobId] = { count: 0, title: job.title };
          }
          jobCounts[jobId].count += 1;
        }
      });

      const applications_by_job = Object.values(jobCounts).map((item) => ({
        job_title: item.title,
        applications: item.count,
      }));

      // 4. Applications Over Time – group by day
      const dayCounts: Record<string, number> = {};
      candidates.forEach((candidate: any) => {
        const day = candidate.applied_at?.split('T')[0] || '';
        if (day) {
          dayCounts[day] = (dayCounts[day] || 0) + 1;
        }
      });

      const applications_over_time = Object.entries(dayCounts)
        .map(([day, count]) => ({ day, count }))
        .sort((a, b) => a.day.localeCompare(b.day));

      // 5. Stats
      const total_applications = candidates.length;
      const total_applicants = new Set(candidates.map((c: any) => c.user?.id)).size;
      const allScores = reports.map((r: any) => r.fit_score).filter((s: any) => s !== null && s !== undefined);
      const avg_ai_fit_score = allScores.length > 0 ? Math.round((allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length) * 10) / 10 : 0;
      const acceptance_rate = total_applications > 0
        ? Math.round((candidates.filter((c: any) => c.status === 'shortlisted' || c.status === 'offered' || c.status === 'hired').length / total_applications) * 10000) / 100
        : 0;

      setData({
        total_applications,
        total_applicants,
        avg_ai_fit_score,
        acceptance_rate,
        ai_fit_score_distribution,
        pipeline_breakdown,
        applications_over_time,
        applications_by_job,
      });

    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const refresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return { data, loading, error, refresh };
}