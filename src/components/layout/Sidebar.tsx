'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { AUTH_STORAGE } from '@/lib/auth';
import { authAPI } from '@/lib/api';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';

const Icons = {
  Overview: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Candidates: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Jobs: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Interviews: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Reports: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Settings: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  ChevronLeft: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>,
  ChevronRight: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { name, role, isAdmin, avatar, isLoading } = useProfile();
  const { profile, loading } = useProfile(); // use loading, not isLoading
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await authAPI.logout();
    } catch {
      // ignore — clear local state regardless
    }
    AUTH_STORAGE.clear();
    router.push('/login');
  }

  const name = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}`.trim() 
    : 'User';
  const role = profile?.isAdmin ? 'Admin' : (profile?.role === 'candidate' ? 'Candidate' : 'Recruiter');  const isAdmin = profile?.isAdmin || false;
  const avatarUrl = profile?.avatar || null;

  const menuItems = [
    { name: 'Overview', href: '/recruiter/dashboard/overview', icon: Icons.Overview },
    { name: 'Candidates', href: '/recruiter/dashboard/candidates', icon: Icons.Candidates },
    { name: 'Jobs', href: '/recruiter/dashboard/jobs', icon: Icons.Jobs },
    { name: 'Interviews', href: '/recruiter/dashboard/interviews', icon: Icons.Interviews },
    { name: 'Reports', href: '/recruiter/dashboard/reports', icon: Icons.Reports },
    ...(isAdmin ? [{ name: 'Settings', href: '/recruiter/dashboard/settings', icon: Icons.Settings }] : []),
  ];

  if (loading) {
    return <aside className="w-64 bg-[var(--color-secondary)] h-screen sticky top-0 animate-pulse" />;
  }

  const isMenuItemActive = (href: string) => {
    if (href === '/recruiter/dashboard') {
      return pathname === href || pathname === href + '/';
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile hamburger trigger */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-secondary)] text-white shadow-lg"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

    <aside
      className={`
        fixed md:sticky top-0 left-0 z-50 md:z-auto
        flex flex-col bg-[var(--color-secondary)] h-screen
        transition-all duration-300 ease-in-out overflow-hidden
        w-72 md:w-auto
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'md:w-20' : 'md:w-64'}
      `}
    >
      <div className="relative flex items-center h-30 px-4 border-b border-white/10">
        <div className={`flex items-center gap-3 transition-all duration-300 ${isCollapsed ? 'md:opacity-0 md:-translate-x-4 md:pointer-events-none' : 'opacity-100 translate-x-0'}`}>
          <Image
            src="/logo.png"
            alt="Servia AI"
            width={40}
            height={40}
            className="h-auto w-10 shrink-0 object-contain"
          />
          <h3 className="text-lg mt-5 font-bold text-[var(--color-primary)] whitespace-nowrap">
            ServiaAI
          </h3>
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute right-4 p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors md:hidden"
          aria-label="Close menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Desktop collapse button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute right-4 p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors hidden md:block"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <Icons.ChevronRight /> : <Icons.ChevronLeft />}
        </button>
      </div>

      <nav className="flex-1 flex flex-col gap-5 px-3 pt-10 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/');
          const active = isMenuItemActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              onClick={() => setIsMobileOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-full transition-all duration-200 relative
                ${active 
                  ? 'bg-[var(--color-primary)] text-[var(--color-secondary)] font-semibold shadow-md' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
                }
                ${isCollapsed ? 'justify-center px-0' : ''}
              `}
              title={isCollapsed ? item.name : undefined}
            >
              <span className="shrink-0 flex items-center justify-center w-5 h-5">{item.icon()}</span>
              <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10 flex flex-col gap-3">
      <Link
        href="/profile"
        className="block px-3 py-4 border-t border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
      >
        <div className={`flex items-center gap-3 transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-full bg-[var(--color-primary)]/30 border border-white/20 flex items-center justify-center text-white font-semibold text-sm shrink-0 overflow-hidden">
            {avatarUrl ? (
              <Image 
                src={avatarUrl} 
                alt={name} 
                width={36} 
                height={36} 
                className="rounded-full object-cover w-full h-full"
              />
            ) : (
              name?.charAt(0)?.toUpperCase() || 'U'
            )}
          </div>

          <div className={`flex flex-col min-w-0 transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
            <span className="text-white font-semibold text-sm truncate">
              {name}
            </span>
            <span className="text-white/60 text-xs truncate">
              {role}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200 ${isCollapsed ? 'justify-center px-0' : ''}`}
          title={isCollapsed ? 'Log out' : undefined}
        >
          <span className="shrink-0 flex items-center justify-center w-5 h-5"><Icons.Logout /></span>
          <span className={`whitespace-nowrap text-sm transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
            {loggingOut ? 'Logging out…' : 'Log out'}
          </span>
        </button>
      </div>
      </Link>
    </aside>
    </>
  );
}