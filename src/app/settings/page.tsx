// src/app/settings/page.tsx
import { redirect } from 'next/navigation';
import { getRecruiterHeaders } from '@/utils/serverFetch';
import { getUserManagementData } from '@/hooks/useSystemSettingsData';
import UserManagementTab from '@/components/settings/UserManagementTab';
import { api } from '@/lib/api';

export default async function SystemSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const headers = await getRecruiterHeaders();

  if (!headers) {
    redirect('/login');
  }

  // ✅ CHECK IF USER IS SUPERUSER (Admin Only Access)
  try {
    // Import fetch to make server-side request
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const token = headers['Authorization']?.replace('Token ', '');
    
    const profileResponse = await fetch(`${baseUrl}/users/profile/`, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      
      // ✅ Redirect non-superusers to home page
      if (!profileData.is_superuser) {
        console.warn('⚠️ Non-admin user attempted to access settings');
        redirect('/');
      }
    } else {
      // If profile fetch fails, redirect to login
      redirect('/login');
    }
  } catch (error) {
    console.error('❌ Error checking admin status:', error);
    redirect('/login');
  }

  const { tab = 'users' } = await searchParams;
  
  let data = { 
    recruiters: [] as any[], 
    candidates: [] as any[], 
    stats: { 
      total_recruiters: 0, 
      active_recruiters: 0, 
      total_candidates: 0, 
      users_this_week: 0 
    } 
  };
  let loadError: string | null = null;

  if (tab === 'users') {
    try {
      const result = await getUserManagementData();
      data = {
        recruiters: result.recruiters ?? [],
        candidates: result.candidates ?? [],
        stats: result.stats ?? {
          total_recruiters: 0,
          active_recruiters: 0,
          total_candidates: 0,
          users_this_week: 0,
        },
      };
    } catch (err: any) {
      loadError = err.message || 'Failed to load data';
      console.warn('⚠️ Settings page error:', loadError);
      data = {
        recruiters: [],
        candidates: [],
        stats: {
          total_recruiters: 0,
          active_recruiters: 0,
          total_candidates: 0,
          users_this_week: 0,
        },
      };
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(38,185,200,0.12),_transparent_22%),linear-gradient(180deg,#fbfaf8_0%,#f3ece7_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        
        <div className="mb-8">
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#171717] sm:text-5xl">
            System Settings
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-[#635b55]">
            Manage users, AI configuration, and system health.
          </p>
        </div>

        <div className="mb-8 flex gap-2 border-b border-black/10">
          <TabButton active={tab === 'users'} href="/settings?tab=users" icon="users">User Management</TabButton>
          <TabButton active={tab === 'config'} href="/settings?tab=config" icon="config">System Config</TabButton>
          <TabButton active={tab === 'health'} href="/settings?tab=health" icon="health">API & Health</TabButton>
        </div>

        {loadError && tab === 'users' && (
          <div className="mb-6 rounded-xl bg-yellow-50 border border-yellow-200 p-4 text-yellow-800">
            <p className="font-medium">⚠️ {loadError}</p>
            <p className="text-sm mt-1">Showing limited data. Contact your administrator for full access.</p>
          </div>
        )}

        {tab === 'users' && (
          <UserManagementTab 
            initialRecruiters={data.recruiters}
            initialCandidates={data.candidates}
            initialStats={data.stats}
          />
        )}
        
        {tab === 'config' && (
          <div className="rounded-2xl border border-black/10 bg-white/85 p-8 text-center text-gray-500">
            <p className="text-lg font-medium">System Configuration</p>
            <p className="mt-2">AI thresholds, email settings, and feature flags will appear here.</p>
          </div>
        )}
        
        {tab === 'health' && (
          <div className="rounded-2xl border border-black/10 bg-white/85 p-8 text-center text-gray-500">
            <p className="text-lg font-medium">API Health & Monitoring</p>
            <p className="mt-2">System uptime, error logs, and performance metrics will appear here.</p>
          </div>
        )}

      </div>
    </main>
  );
}

function TabButton({ active, href, icon, children }: { active: boolean; href: string; icon: string; children: React.ReactNode }) {
  const icons: Record<string, JSX.Element> = {
    users: <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    config: <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    health: <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  };

  return (
    <a href={href} className={`flex items-center rounded-lg px-6 py-3 text-sm font-medium transition-all ${active ? 'bg-[#26b9c8] text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
      {icons[icon]}
      {children}
    </a>
  );
}