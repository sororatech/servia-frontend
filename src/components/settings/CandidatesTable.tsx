// src/components/settings/CandidatesTable.tsx
'use client';

import { Candidate } from '@/types/settings';

export default function CandidatesTable({ candidates = [] }: { candidates?: Candidate[] }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/85 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/10">
              <th className="px-4 py-3 text-left text-sm font-medium text-[#7e756f]">Candidate</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#7e756f]">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#7e756f]">Applied Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {candidates.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">No candidates found</td>
              </tr>
            ) : (
              candidates.map((c) => (
                <tr key={c.id} className="hover:bg-black/[0.02]">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-white flex items-center justify-center text-sm font-semibold">
                        {/* ✅ FIXED: Access nested user fields safely */}
                        {c.user?.first_name?.[0] || ''}{c.user?.last_name?.[0] || ''}
                      </div>
                      <p className="font-medium text-[#171717]">
                        {/* ✅ FIXED: Use nested user name */}
                        {c.user?.first_name || ''} {c.user?.last_name || ''}
                      </p>
                    </div>
                  </td>
                  {/* ✅ FIXED: Use nested user email */}
                  <td className="px-4 py-4 text-sm text-[#635b55]">{c.user?.email || ''}</td>
                  <td className="px-4 py-4 text-sm text-[#635b55]">
                    {c.applied_date ? new Date(c.applied_date).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}