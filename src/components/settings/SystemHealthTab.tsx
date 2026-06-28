'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface ServiceHealth {
  database: 'ok' | 'error';
  cache: 'ok' | 'error';
}

interface RecentError {
  id: string;
  title: string;
  level: string;
  culprit: string;
  count: number;
  url: string;
  first_seen: string;
}

interface HealthData {
  status: 'healthy' | 'degraded' | 'down';
  error_count_24h: number;
  uptime_percentage: number;
  services: ServiceHealth;
  api_usage: {
    current: number;
    limit: number;
    percentage: number;
    resets_on: string;
  };
  recent_errors: RecentError[];
  sentry: {
    configured: boolean;
    org: string;
    project: string;
    project_url: string;
  };
}

export default function SystemHealthTab() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<HealthData>('/system-health/');
      setData(response.data);
    } catch (err: any) {
      console.error('Failed to fetch health data:', err);
      setError(err.response?.data?.error || 'Failed to load system health');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-[var(--color-warm-border)] bg-white p-12 shadow-sm">
        <div className="animate-pulse space-y-4 text-center">
          <div className="h-4 w-48 rounded bg-gray-200 mx-auto" />
          <div className="h-3 w-32 rounded bg-gray-100 mx-auto" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[var(--color-status-error-border)] bg-[var(--color-status-error-bg)] p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-[var(--color-status-error-text)]">⚠️ {error}</p>
        <Button variant="primary" onClick={fetchData} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const statusIcon = (status: 'ok' | 'error') =>
    status === 'ok' ? '✓' : '✗';
  const statusColor = (status: 'ok' | 'error') =>
    status === 'ok' ? 'text-[var(--color-status-active-text)]' : 'text-[var(--color-status-error-text)]';

  return (
    <div className="space-y-6">
      {/* Top stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-[var(--color-warm-border)] bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-[var(--color-primary)]">System Status</p>
          <p
            className={`mt-2 text-2xl font-bold ${
              data.status === 'healthy'
                ? 'text-[var(--color-status-active-text)]'
                : data.status === 'degraded'
                ? 'text-[var(--color-status-warning-text)]'
                : 'text-[var(--color-status-error-text)]'
            }`}
          >
            {data.status === 'healthy' ? '✓ Healthy' : data.status === 'degraded' ? '⚠️ Degraded' : '✗ Down'}
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {data.status === 'healthy' ? 'All services operational' : 'Some issues detected'}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--color-warm-border)] bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-[var(--color-primary)]">Uptime (30d)</p>
          <p className="mt-2 text-3xl font-bold text-[var(--color-foreground)]">{data.uptime_percentage}%</p>
        </div>
        <div className="rounded-2xl border border-[var(--color-warm-border)] bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-[var(--color-primary)]">Errors (24h)</p>
          <p className="mt-2 text-3xl font-bold text-[var(--color-foreground)]">{data.error_count_24h}</p>
        </div>
      </div>

      {/* Service health */}
      <div className="rounded-2xl border border-[var(--color-warm-border)] bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[var(--color-secondary)] mb-4">Service Health</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(data.services).map(([service, status]) => (
            <div
              key={service}
              className="flex items-center justify-between rounded-xl border border-[var(--color-warm-border)] bg-[var(--color-warm-bg)] p-3"
            >
              <span className="text-sm font-medium capitalize text-[var(--color-text-dark)]">{service}</span>
              <span className={`text-sm font-semibold ${statusColor(status)}`}>
                {statusIcon(status)} {status === 'ok' ? 'OK' : 'Error'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* API usage */}
      <div className="rounded-2xl border border-[var(--color-warm-border)] bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[var(--color-secondary)]">API Usage</h3>
        <p className="mb-2 text-sm text-[var(--color-text-muted)]">Monthly AI scoring API consumption</p>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-[var(--color-foreground)]">
            {data.api_usage.current.toLocaleString()}
          </span>
          <span className="text-sm text-[var(--color-text-muted)] mb-1">
            / {data.api_usage.limit.toLocaleString()} calls
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--color-progress-track)]">
          <div
            className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500"
            style={{ width: `${Math.min(data.api_usage.percentage, 100)}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          {data.api_usage.percentage}% used — resets on{' '}
          {new Date(data.api_usage.resets_on).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      </div>

      {/* Error log */}
      <div className="rounded-2xl border border-[var(--color-warm-border)] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-bold text-[var(--color-secondary)]">Error Log</h3>
          {data.sentry.configured && (
            <a
              href={data.sentry.project_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
            >
              View in Sentry →
            </a>
          )}
        </div>
        {data.recent_errors.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-status-active-border)] bg-[var(--color-status-active-bg)] p-4 text-sm text-[var(--color-status-active-text)]">
            ✓ No errors in the last 24 hours
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {data.recent_errors.map((err) => (
              <a
                key={err.id}
                href={err.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-[var(--color-warm-border)] p-4 transition hover:bg-[var(--color-warm-bg)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[var(--color-secondary)]">{err.title}</p>
                    {err.culprit && (
                      <p className="mt-1 font-mono text-xs text-[var(--color-text-muted)]">{err.culprit}</p>
                    )}
                    <p className="mt-2 text-xs text-[var(--color-text-subtle)]">
                      {new Date(err.first_seen).toLocaleString()} • {err.count} occurrence
                      {err.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      err.level === 'error'
                        ? 'bg-[var(--color-status-error-bg)] text-[var(--color-status-error-text)]'
                        : err.level === 'warning'
                        ? 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-text)]'
                        : 'bg-[var(--color-warm-surface)] text-[var(--color-text-subtle)]'
                    }`}
                  >
                    {err.level}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}