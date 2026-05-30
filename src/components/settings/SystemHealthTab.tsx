'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<HealthData>(`/system-health/`);
      setData(response.data);
    } catch (err: any) {
      console.error('Failed to fetch health data:', err);
      setError(err.response?.data?.error || 'Failed to load system health');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white/85 p-12 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-red-700 font-medium">⚠️ {error}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-black/10 bg-white/85 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#171717]">System Status</h3>
          <p className={`text-2xl font-bold mt-2 ${data.status === 'healthy' ? 'text-green-600' : data.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'}`}>
            {data.status === 'healthy' ? '✓ System Healthy' : data.status === 'degraded' ? '⚠️ Degraded' : '✗ Down'}
          </p>
          <p className="text-sm text-[#635b55] mt-1">
            {data.status === 'healthy' ? 'All services operational' : 'Some issues detected'}
          </p>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white/85 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#171717]">Uptime</h3>
          <p className="text-3xl font-bold text-[#26b9c8] mt-2">{data.uptime_percentage}%</p>
          <p className="text-sm text-[#635b55] mt-1">Last 30 days</p>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white/85 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#171717]">Errors (24h)</h3>
          <p className="text-3xl font-bold text-[#26b9c8] mt-2">{data.error_count_24h}</p>
          <p className="text-sm text-[#635b55] mt-1">Last 24 hours</p>
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white/85 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#171717] mb-4">Service Health</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(data.services).map(([service, status]) => (
            <div key={service} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700 capitalize">{service}</span>
              <span className={`text-sm font-semibold ${status === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                {status === 'ok' ? '✓ OK' : '✗ Error'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white/85 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#171717] mb-2">API Usage</h3>
        <p className="text-sm text-[#635b55] mb-4">Monthly AI scoring API consumption</p>
        <div className="flex items-end gap-2 mb-2">
          <span className="text-2xl font-bold text-[#171717]">{data.api_usage.current.toLocaleString()}</span>
          <span className="text-sm text-gray-500 mb-1">/ {data.api_usage.limit.toLocaleString()} calls</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-[#26b9c8] transition-all duration-500"
            style={{ width: `${Math.min(data.api_usage.percentage, 100)}%` }}
          />
        </div>
        <p className="text-sm text-[#635b55]">
          {data.api_usage.percentage}% used — resets on {new Date(data.api_usage.resets_on).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white/85 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#171717]">Error Log</h3>
          {data.sentry.configured && (
            <a
              href={data.sentry.project_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#26b9c8] hover:underline"
            >
              View in Sentry →
            </a>
          )}
        </div>

        {data.recent_errors.length === 0 ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">✓ No errors in the last 24 hours</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {data.recent_errors.map((err) => (
              <a
                key={err.id}
                href={err.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-[#171717]">{err.title}</p>
                    {err.culprit && <p className="text-sm text-gray-600 mt-1 font-mono">{err.culprit}</p>}
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(err.first_seen).toLocaleString()} • {err.count} occurrence{err.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    err.level === 'error' ? 'bg-red-100 text-red-700' :
                    err.level === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
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