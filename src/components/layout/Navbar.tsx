'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { SearchInput } from '../ui/SearchInput';

const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('auth_token');
};

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState('');
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsLoggedIn(isAuthenticated());
    
    const handleStorageChange = () => {
      setIsLoggedIn(isAuthenticated());
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    const checkAuth = setInterval(() => {
      setIsLoggedIn(isAuthenticated());
    }, 1000);
    
    setTimeout(() => clearInterval(checkAuth), 3000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkAuth);
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      api.get('/users/profile/')
        .then(res => {
          const name = `${res.data.first_name || ''} ${res.data.last_name || ''}`.trim();
          setUserName(name || 'User');
        })
        .catch(() => setUserName('User'));
    } else {
      setUserName('');
    }
  }, [isLoggedIn]);

  const navLinks = useMemo(() => [
    { href: '/', label: 'Browse Jobs' },
    { href: '/candidate/applications', label: 'My Applications' },
    { href: '/candidate/profile', label: 'Profile' },
  ], []);

  const isActive = (href: string) => {
    if (pathname === href || pathname.startsWith(href + '/')) {
      return true;
    }
    if (href === '/') {
      const extraJobPaths = [
        '/candidate/dashboard/cv',
        '/candidate/application-success',
      ];
      if (extraJobPaths.some(path => pathname.startsWith(path))) {
        return true;
      }
    }
    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsLoggedIn(false);
    setUserName('');
    router.push('/');
  };

  const getInitial = () => {
    if (!userName) return 'U';
    return userName.charAt(0).toUpperCase();
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 h-20">
        <div className="w-full max-w-[1440px] mx-auto px-4 h-full">
          <div className="grid grid-cols-[auto_1fr_auto] lg:grid-cols-3 items-center w-full h-full gap-4">
            
            <div className="flex justify-start">
              <Link href="/" className="flex-shrink-0">
                <Image 
                  src="/logo.png" 
                  alt="Servia Logo" 
                  width={140} 
                  height={45} 
                  className="h-10 w-auto max-w-[140px] ml-20" 
                  priority 
                />
              </Link>
            </div>

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
                    className={`
                      relative h-full flex items-center px-1 text-base font-heading font-semibold transition-all duration-300
                      ${active 
                        ? 'text-[#26B9C8]' 
                        : 'text-gray-600/80 hover:text-[#26B9C8]'
                      }
                    `}
                  >
                    {link.label}
                    <AnimatePresence>
                      {showUnderline && (
                        <motion.div 
                          layoutId="nav-underline"
                          className="absolute bottom-[-2px] left-0 right-0 h-[3px] bg-[#26B9C8] z-[70] rounded-full"
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

            <div className="hidden lg:flex items-center justify-end gap-4">
              <div className="w-full max-w-[240px]">
                <SearchInput placeholder="Search roles..." />
              </div>

              <div className="flex items-center gap-3">
                {!mounted ? (
                  <div className="h-10 w-10 rounded-full bg-gray-50 animate-pulse" />
                ) : isLoggedIn ? (
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#26B9C8]/10 text-[#26B9C8] hover:bg-[#26B9C8]/20 transition-colors"
                    title="Click to logout"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#26B9C8] text-gray-900 flex items-center justify-center font-bold text-sm">
                      {getInitial()}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 hidden xl:block">
                      {userName}
                    </span>
                  </button>
                ) : (
                  <Link 
                    href="/login"
                    className="px-6 py-2 rounded-full font-heading font-bold text-sm transition-all bg-[#26B9C8] text-gray-900 hover:bg-[#20a8b6] active:scale-95 whitespace-nowrap"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>

            <div className="flex lg:hidden justify-end">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="p-2 text-gray-600 hover:text-[#26B9C8] transition-colors" 
                aria-label="Toggle menu"
              >
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

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-20 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-lg lg:hidden"
          >
            <div className="px-4 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex flex-col space-y-2">
                {navLinks.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link 
                      key={link.href} 
                      href={link.href} 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-4 py-3 rounded-lg font-heading font-semibold transition-colors ${
                        active 
                          ? 'bg-[#26B9C8]/10 text-[#26B9C8]' 
                          : 'text-gray-600/80 hover:bg-gray-50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-gray-100">
                {!mounted ? (
                  <div className="h-10 w-10 rounded-full bg-gray-50 animate-pulse" />
                ) : isLoggedIn ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#26B9C8] text-gray-900 flex items-center justify-center font-bold">
                        {getInitial()}
                      </div>
                      <span className="font-semibold text-sm">{userName}</span>
                    </div>
                    <button 
                      onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link 
                    href="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center px-6 py-3 rounded-full font-heading font-bold text-sm bg-[#26B9C8] text-gray-900 hover:bg-[#20a8b6] active:scale-95"
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