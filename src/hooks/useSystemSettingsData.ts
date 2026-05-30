import { 
  getRecruiterHeaders, 
  fetchAllPagesSafe
} from '@/utils/serverFetch';
import { Recruiter, Candidate, UserStats } from '@/types/settings';

export async function getUserManagementData() {
  const headers = await getRecruiterHeaders();
  
  if (!headers) {
    return {
      recruiters: [],
      candidates: [],
      stats: { total_recruiters: 0, active_recruiters: 0, total_candidates: 0, users_this_week: 0 }
    };
  }

  try {
    const [recruiters, candidates] = await Promise.all([
      fetchAllPagesSafe<Recruiter>('/users/recruiters/', headers),
      fetchAllPagesSafe<Candidate>('/users/candidates/', headers),
    ]);
    
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
    
    return { recruiters, candidates, stats };
    
  } catch (error: any) {
    return {
      recruiters: [],
      candidates: [],
      stats: { total_recruiters: 0, active_recruiters: 0, total_candidates: 0, users_this_week: 0 }
    };
  }
}