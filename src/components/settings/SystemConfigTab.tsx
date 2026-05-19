'use client';

import { useState } from 'react';
import { SystemConfig } from '@/types/settings';

export default function SystemConfigTab({ initialConfig }: { initialConfig: SystemConfig }) {
  const [config, setConfig] = useState(initialConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (key: keyof SystemConfig, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/system/config/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* AI Score Thresholds */}
      <div className="rounded-2xl border border-black/10 bg-white/85 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm">
        <h3 className="mb-4 text-xl font-semibold text-[#171717]">AI Score Thresholds</h3>
        
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#635b55]">
              Shortlist Threshold *
            </label>
            <input
              type="number"
              value={config.shortlist_threshold}
              onChange={(e) => handleChange('shortlist_threshold', parseInt(e.target.value))}
              className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none ring-2 ring-transparent transition-all focus:border-[#26b9c8] focus:ring-[#26b9c8]/20"
            />
            <p className="mt-1 text-xs text-[#7e756f]">Candidates with AI score ≥ this auto-shortlisted</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#635b55]">
              Reject Threshold *
            </label>
            <input
              type="number"
              value={config.reject_threshold}
              onChange={(e) => handleChange('reject_threshold', parseInt(e.target.value))}
              className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none ring-2 ring-transparent transition-all focus:border-[#26b9c8] focus:ring-[#26b9c8]/20"
            />
            <p className="mt-1 text-xs text-[#7e756f]">Candidates with AI score &lt; this auto-rejected</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#635b55]">
              Interview Recommendation Threshold
            </label>
            <input
              type="number"
              value={config.interview_recommendation_threshold}
              onChange={(e) => handleChange('interview_recommendation_threshold', parseInt(e.target.value))}
              className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none ring-2 ring-transparent transition-all focus:border-[#26b9c8] focus:ring-[#26b9c8]/20"
            />
            <p className="mt-1 text-xs text-[#7e756f]">AI recommends "Hire" if score ≥ this</p>
          </div>
        </div>
      </div>

      {/* Email Settings */}
      <div className="rounded-2xl border border-black/10 bg-white/85 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm">
        <h3 className="mb-4 text-xl font-semibold text-[#171717]">Email Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#635b55]">
              From Email
            </label>
            <input
              type="email"
              value={config.from_email}
              onChange={(e) => handleChange('from_email', e.target.value)}
              className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none ring-2 ring-transparent transition-all focus:border-[#26b9c8] focus:ring-[#26b9c8]/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#635b55]">
              Support Email
            </label>
            <input
              type="email"
              value={config.support_email}
              onChange={(e) => handleChange('support_email', e.target.value)}
              className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none ring-2 ring-transparent transition-all focus:border-[#26b9c8] focus:ring-[#26b9c8]/20"
            />
          </div>

          <button className="rounded-xl bg-[#26b9c8] px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#26b9c8]/25 transition-all hover:bg-[#20a8b5]">
            Test Email
          </button>
        </div>
      </div>

      {/* Application Settings */}
      <div className="rounded-2xl border border-black/10 bg-white/85 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm">
        <h3 className="mb-4 text-xl font-semibold text-[#171717]">Application Settings</h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#635b55]">
              Max CV Size (MB)
            </label>
            <input
              type="number"
              value={config.max_cv_size_mb}
              onChange={(e) => handleChange('max_cv_size_mb', parseInt(e.target.value))}
              className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none ring-2 ring-transparent transition-all focus:border-[#26b9c8] focus:ring-[#26b9c8]/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#635b55]">
              Max Video Size (MB)
            </label>
            <input
              type="number"
              value={config.max_video_size_mb}
              onChange={(e) => handleChange('max_video_size_mb', parseInt(e.target.value))}
              className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none ring-2 ring-transparent transition-all focus:border-[#26b9c8] focus:ring-[#26b9c8]/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#635b55]">
              Video Duration Limit (seconds)
            </label>
            <input
              type="number"
              value={config.video_duration_limit_seconds}
              onChange={(e) => handleChange('video_duration_limit_seconds', parseInt(e.target.value))}
              className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none ring-2 ring-transparent transition-all focus:border-[#26b9c8] focus:ring-[#26b9c8]/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#635b55]">
              Application Deadline Default (days)
            </label>
            <input
              type="number"
              value={config.application_deadline_default_days}
              onChange={(e) => handleChange('application_deadline_default_days', parseInt(e.target.value))}
              className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none ring-2 ring-transparent transition-all focus:border-[#26b9c8] focus:ring-[#26b9c8]/20"
            />
          </div>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="rounded-2xl border border-black/10 bg-white/85 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm">
        <h3 className="mb-4 text-xl font-semibold text-[#171717]">Feature Flags</h3>
        
        <div className="space-y-3">
          {[
            { key: 'ai_screening_enabled', label: 'AI Screening Enabled' },
            { key: 'live_interviews_enabled', label: 'Live Interviews Enabled' },
            { key: 'email_notifications_enabled', label: 'Email Notifications Enabled' },
            { key: 'candidate_self_service_enabled', label: 'Candidate Self-Service Enabled' },
          ].map((flag) => (
            <label key={flag.key} className="flex items-center justify-between rounded-xl border border-black/10 p-4">
              <span className="text-sm font-medium text-[#635b55]">{flag.label}</span>
              <input
                type="checkbox"
                checked={config[flag.key as keyof SystemConfig] as boolean}
                onChange={(e) => handleChange(flag.key as keyof SystemConfig, e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-[#26b9c8] focus:ring-[#26b9c8]"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="rounded-xl bg-[#26b9c8] px-8 py-3 text-sm font-medium text-white shadow-lg shadow-[#26b9c8]/25 transition-all hover:bg-[#20a8b5] disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}