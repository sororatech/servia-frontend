'use client';

import { SystemHealth, ApiUsage, ErrorLog } from '@/types/settings';

export default function ApiHealthTab({
  initialHealth,
  initialUsage,
  initialErrors,
}: {
  initialHealth: SystemHealth;
  initialUsage: ApiUsage[];
  initialErrors: ErrorLog[];
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return '🟢';
      case 'degraded': return '🟡';
      case 'down': return '🔴';
      default: return '⚪';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'error': return 'bg-orange-100 text-orange-700';
      case 'warning': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* System Uptime Card */}
      <div className="rounded-2xl border border-black/10 bg-white/85 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm">
        <h3 className="mb-4 text-xl font-semibold text-[#171717]">System Status</h3>
        
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-gradient-to-br from-[#26b9c8] to-[#1a9aa8] p-5 text-white">
            <p className="text-sm opacity-90">Current Uptime</p>
            <p className="mt-2 text-3xl font-semibold">{initialHealth.uptime_percentage}%</p>
            <p className="text-xs opacity-75">Last 30 days</p>
          </div>

          <div className="rounded-xl border border-black/10 bg-white p-5">
            <p className="text-sm text-[#7e756f]">Status</p>
            <p className={`mt-2 flex items-center gap-2 text-2xl font-semibold ${getStatusColor(initialHealth.status)}`}>
              <span>{getStatusIcon(initialHealth.status)}</span>
              <span className="capitalize">{initialHealth.status}</span>
            </p>
          </div>

          <div className="rounded-xl border border-black/10 bg-white p-5">
            <p className="text-sm text-[#7e756f]">Last Incident</p>
            <p className="mt-2 text-lg font-medium text-[#171717]">
              {initialHealth.last_incident || 'None'}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="rounded-2xl border border-black/10 bg-white/85 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm">
        <h3 className="mb-4 text-xl font-semibold text-[#171717]">Performance Metrics</h3>
        
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-black/10 bg-white p-5">
            <p className="text-sm text-[#7e756f]">Avg Response Time</p>
            <p className="mt-2 text-3xl font-semibold text-[#26b9c8]">
              {initialHealth.avg_response_time_ms}ms
            </p>
            <p className="text-xs text-[#7e756f]">Last 24h</p>
          </div>

          <div className="rounded-xl border border-black/10 bg-white p-5">
            <p className="text-sm text-[#7e756f]">P95 Latency</p>
            <p className="mt-2 text-3xl font-semibold text-[#26b9c8]">
              {initialHealth.p95_latency_ms}ms
            </p>
          </div>

          <div className="rounded-xl border border-black/10 bg-white p-5">
            <p className="text-sm text-[#7e756f]">Total API Calls</p>
            <p className="mt-2 text-3xl font-semibold text-[#26b9c8]">
              {initialUsage.reduce((acc, u) => acc + u.requests, 0).toLocaleString()}
            </p>
            <p className="text-xs text-[#7e756f]">Last 7 days</p>
          </div>
        </div>
      </div>

      {/* Error Logs Table */}
      <div className="rounded-2xl border border-black/10 bg-white/85 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-[#171717]">Recent Errors</h3>
          <button className="rounded-xl bg-[#26b9c8] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[#26b9c8]/25 transition-all hover:bg-[#20a8b5]">
            View in Sentry
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/10">
                <th className="px-4 py-3 text-left text-sm font-medium text-[#7e756f]">Timestamp</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#7e756f]">Error Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#7e756f]">Endpoint</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#7e756f]">Severity</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#7e756f]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {initialErrors.slice(0, 10).map((error) => (
                <tr key={error.id} className="hover:bg-black/[0.02]">
                  <td className="px-4 py-4 text-sm text-[#635b55]">
                    {new Date(error.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-[#171717]">
                    {error.error_type}
                  </td>
                  <td className="px-4 py-4 text-sm text-[#635b55]">{error.endpoint}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getSeverityColor(error.severity)}`}>
                      {error.severity}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      error.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {error.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}