'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SearchInput } from '../ui/SearchInput';
import { motion, AnimatePresence } from 'framer-motion';
import { AUTH_STORAGE } from '@/lib/auth';

const SEARCH_VISIBLE_PATHS = ['/']; 

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<{ name: string; role: string | null } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Theme state: defaults to false (light mode)
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const token = AUTH_STORAGE.getToken();
    if (token) {
      const firstName = AUTH_STORAGE.getFirstName() || '';
      const lastName = AUTH_STORAGE.getLastName() || '';
      const name = [firstName, lastName].filter(Boolean).join(' ').trim() || 'User';
      const role = AUTH_STORAGE.getUserRole();
      const storedAvatar = AUTH_STORAGE.getAvatarUrl();
      setUser({ name, role });
      setAvatarUrl(storedAvatar);
    }

    // Initialize theme from localStorage, defaulting to light mode
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleLogout = () => {
    AUTH_STORAGE.clear();
    router.push('/login');
    router.refresh();
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const getInitials = (name: string) => {
    if (!name || name === 'User') return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const profileHref = '/profile';

  const navLinks = useMemo(() => [
    { href: '/', label: 'Browse Jobs' },
    { href: '/candidate/applications', label: 'My Applications' },
  ], []);

  const isActive = (href: string) => {
    if (href === '/jobs') {
      const jobRelatedPaths = ['/', '/jobs', '/jobs/', '/candidate/dashboard/cv', '/candidate/application-success'];
      if (jobRelatedPaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
        return true;
      }
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const showSearch = SEARCH_VISIBLE_PATHS.some((path) => {
    return pathname === path;
  });

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-[var(--color-background)] border-b border-[var(--color-warm-border)] h-20 transition-colors duration-300">
        <div className="w-full max-w-[1440px] mx-auto px-4 h-full">
          <div className="grid grid-cols-[auto_1fr_auto] lg:grid-cols-3 items-center w-full h-full gap-4">
            <div className="flex justify-start">
              <Link href="/" className="flex-shrink-0">
                <Image src="/logo.png" alt="ServiaAI" width={50} height={40} className="max-w-[125px]" priority />
              </Link>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex justify-center items-center gap-8 xl:gap-12 h-full">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                const showUnderline = active || hoveredHref === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onMouseEnter={() => setHoveredHref(link.href)}
                    onMouseLeave={() => setHoveredHref(null)}
                    className={`relative h-full flex items-center px-1 text-base font-heading font-semibold transition-all duration-300 ${
                      active ? 'text-[var(--color-primary)]' : 'text-[var(--color-foreground)]/80 hover:text-[var(--color-primary)]'
                    }`}
                  >
                    {link.label}
                    <AnimatePresence>
                      {showUnderline && (
                        <motion.div
                          layoutId="nav-underline"
                          className="absolute bottom-[-2px] left-0 right-0 h-[3px] bg-[var(--color-primary)] z-[70] rounded-full"
                          initial={{ opacity: 0, scaleX: 0 }}
                          animate={{ opacity: 1, scaleX: 1 }}
                          exit={{ opacity: 0, scaleX: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
            </div>

            {/* Right side: Search, Theme Toggle & Auth */}
            <div className="hidden lg:flex items-center justify-end gap-4">
              {showSearch && (
                <div className="w-full max-w-[240px]">
                  <div className="dark:[&>div>input]:text-[var(--color-foreground)] dark:[&>div>input]:bg-[var(--color-warm-bg-deep)] dark:[&>div>input]:border-[var(--color-warm-border)]">
                    <SearchInput placeholder="Search roles..." onSearch={handleSearch} />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 min-w-[100px] justify-end">
                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full text-[var(--color-foreground)] hover:bg-[var(--color-warm-surface)] dark:hover:bg-[var(--color-warm-border)] transition-colors"
                  aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDarkMode ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>

                {user ? (
                  <>
                    <Link
                      href={profileHref}
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold transition-transform hover:scale-105 shrink-0 cursor-pointer bg-white dark:bg-[var(--color-warm-surface)] border-2 border-[var(--color-primary)] ring-2 ring-transparent hover:ring-[var(--color-primary)]/20 overflow-hidden"
                      title={`View ${user.name}'s Profile`}
                    >
                      {avatarUrl ? (
                        <Image src={avatarUrl} alt={user.name} width={40} height={40} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        /* FIX: Changed from color-secondary to color-foreground for visibility in dark mode */
                        <span className="text-[var(--color-foreground)] dark:text-[var(--color-teal-dark)] text-sm font-semibold">
                          {getInitials(user.name)}
                        </span>
                      )}
                    </Link>
                    <button 
                      onClick={handleLogout} 
                      className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-status-error-text)] transition-colors" 
                      title="Logout"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="px-6 py-2 rounded-full font-heading font-bold text-sm transition-all bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] active:scale-95 whitespace-nowrap"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden justify-end items-center gap-2">
              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-[var(--color-foreground)] hover:text-[var(--color-primary)] transition-colors"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-[var(--color-foreground)] hover:text-[var(--color-primary)] transition-colors" aria-label="Toggle menu">
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-20 left-0 right-0 z-40 bg-[var(--color-background)] dark:bg-[var(--color-warm-bg-page)] border-b border-[var(--color-warm-border)] shadow-lg lg:hidden transition-colors duration-300"
          >
            <div className="px-4 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex flex-col space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg font-heading font-semibold transition-colors ${
                      isActive(link.href) ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-[var(--color-foreground)]/80 hover:bg-[var(--color-warm-bg-page)] dark:hover:bg-[var(--color-warm-surface)]'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              {showSearch && (
                <div className="w-full">
                  {/* FIX: Wrapper to force dark mode styles on the mobile SearchInput component */}
                  <div className="dark:[&>div>input]:text-[var(--color-foreground)] dark:[&>div>input]:bg-[var(--color-warm-bg-deep)] dark:[&>div>input]:border-[var(--color-warm-border)]">
                    <SearchInput placeholder="Search roles..." onSearch={handleSearch} />
                  </div>
                </div>
              )}
              <div className="pt-2 border-t border-[var(--color-warm-border)]">
                {user ? (
                  <div className="flex items-center justify-between">
                    <Link href={profileHref} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold bg-white dark:bg-[var(--color-warm-surface)] border-2 border-[var(--color-primary)] overflow-hidden">
                        {avatarUrl ? (
                          <Image src={avatarUrl} alt={user.name} width={40} height={40} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          /* FIX: Mobile profile initials visibility */
                          <span className="text-[var(--color-foreground)] dark:text-[var(--color-teal-dark)] text-sm font-semibold">
                            {getInitials(user.name)}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-[var(--color-foreground)]">{user.name}</span>
                        <span className="text-xs text-[var(--color-foreground)]/60 capitalize">{user.role}</span>
                      </div>
                    </Link>
                    <button 
                      onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} 
                      className="text-sm font-medium text-[var(--color-status-error-text)] hover:text-[var(--color-status-error-text)]/80 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link 
                    href="/login" 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="block w-full text-center px-6 py-3 rounded-full font-heading font-bold text-sm bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] active:scale-95"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}