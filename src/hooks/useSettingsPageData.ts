import { fetchJson, fetchAllPages } from '@/utils/serverFetch';
import { Recruiter, Candidate, UserStats } from '@/types/settings';

export async function loadSettingsData(headers: HeadersInit) {
  try {
    const [recruiters, candidates] = await Promise.all([
      fetchAllPages<Recruiter>('/users/recruiters/', headers),
      fetchAllPages<Candidate>('/users/candidates/', headers),
    ]);

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const usersThisWeek = [...recruiters, ...candidates].filter(user => {
      if (!user.date_joined) return false; 
      return new Date(user.date_joined) >= oneWeekAgo;
    }).length;

    const activeRecruiters = recruiters.filter(r => r.is_active === true).length;

    const stats: UserStats = {
      total_recruiters: recruiters.length,
      active_recruiters: activeRecruiters,
      total_candidates: candidates.length,
      users_this_week: usersThisWeek,
    };

    return { recruiters, candidates, stats };
  } catch (error: any) {
    return {
      recruiters: [],
      candidates: [],
      stats: { total_recruiters: 0, active_recruiters: 0, total_candidates: 0, users_this_week: 0 }
    };
  }
}