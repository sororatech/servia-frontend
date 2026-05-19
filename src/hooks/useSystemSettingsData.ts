// src/hooks/useSystemSettingsData.ts - UPDATED
import { 
  getRecruiterHeaders, 
  fetchAllPagesSafe  // ✅ Use safe version
} from '@/utils/serverFetch';
import { Recruiter, Candidate, UserStats } from '@/types/settings';

export async function getUserManagementData() {
  console.log('🚀 getUserManagementData starting...');
  
  const headers = await getRecruiterHeaders();
  
  if (!headers) {
    console.error('❌ getRecruiterHeaders returned null - no auth');
    return {
      recruiters: [],
      candidates: [],
      stats: { total_recruiters: 0, active_recruiters: 0, total_candidates: 0, users_this_week: 0 }
    };
  }

  try {
    console.log('📡 Fetching recruiters and candidates (soft-fail enabled)...');
    
    // ✅ FRONTEND-ONLY FIX: Use safe fetches that return [] on 403
    const [recruiters, candidates] = await Promise.all([
      fetchAllPagesSafe<Recruiter>('/users/recruiters/', headers),
      fetchAllPagesSafe<Candidate>('/users/candidates/', headers),
    ]);
    
    // ✅ Calculate stats locally (works even with empty arrays)
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats: UserStats = {
      total_recruiters: recruiters.length,
      active_recruiters: recruiters.filter(r => r.is_active).length,
      total_candidates: candidates.length,
      users_this_week: [...recruiters, ...candidates].filter(user => {
        try {
          return new Date(user.date_joined) >= oneWeekAgo;
        } catch {
          return false;
        }
      }).length,
    };
    
    console.log('✅ getUserManagementData complete:', {
      recruitersCount: recruiters.length,
      candidatesCount: candidates.length,
      stats
    });
    
    return { recruiters, candidates, stats };
    
  } catch (error: any) {
    // ✅ This should rarely hit now, but fallback anyway
    console.error('❌ getUserManagementData unexpected error:', error.message);
    return {
      recruiters: [],
      candidates: [],
      stats: { total_recruiters: 0, active_recruiters: 0, total_candidates: 0, users_this_week: 0 }
    };
  }
}