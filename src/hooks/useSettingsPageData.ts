// src/hooks/useSettingsPageData.ts
import { fetchJson, fetchAllPages } from '@/utils/serverFetch';
import { Recruiter, Candidate, UserStats } from '@/types/settings';

export async function loadSettingsData(headers: HeadersInit) {
  try {
    console.log('📡 Fetching data from /users/recruiters/ and /users/candidates/...');

    // 1. Fetch the raw lists from your backend endpoints
    const [recruiters, candidates] = await Promise.all([
      fetchAllPages<Recruiter>('/users/recruiters/', headers),
      fetchAllPages<Candidate>('/users/candidates/', headers),
    ]);

    console.log(`✅ Fetched ${recruiters.length} recruiters and ${candidates.length} candidates.`);

    // 2. CALCULATE STATS (Where & Count)
    // Since your backend doesn't have a specific stats endpoint, we calculate it here.
    
    // Calculate "Users This Week"
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const usersThisWeek = [...recruiters, ...candidates].filter(user => {
      return new Date(user.date_joined) >= oneWeekAgo;
    }).length;

    // Calculate Active Recruiters (Where is_active is true)
    const activeRecruiters = recruiters.filter(r => r.is_active === true).length;

    // Build the stats object
    const stats: UserStats = {
      total_recruiters: recruiters.length,
      active_recruiters: activeRecruiters,
      total_candidates: candidates.length,
      users_this_week: usersThisWeek,
    };

    console.log('📊 Calculated Stats:', stats);

    return { recruiters, candidates, stats };
  } catch (error: any) {
    console.error('❌ Error loading settings data:', error.message);
    // Return empty structure if fetch fails to prevent crashing the page
    return {
      recruiters: [],
      candidates: [],
      stats: { total_recruiters: 0, active_recruiters: 0, total_candidates: 0, users_this_week: 0 }
    };
  }
}