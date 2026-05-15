'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { SearchInput } from '../ui/SearchInput';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted] = useState(true);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleLogin = () => setIsLoggedIn(!isLoggedIn);

  const navLinks = useMemo(() => [
    { href: '/jobs', label: 'Browse Jobs' },
    { href: '/candidate/applications', label: 'My Applications' },
  ], []);

  const isActive = (href: string) => 
    pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-[var(--color-background)] border-b border-gray-100 h-20">
        <div className="w-full max-w-[1440px] mx-auto px-4 h-full">
          <div className="grid grid-cols-[auto_1fr_auto] lg:grid-cols-3 items-center w-full h-full gap-4">
            
            {/* Logo */}
            <div className="flex justify-start">
              <Link href="/" className="flex-shrink-0">
                <Image 
                  src="/logo.png" 
                  alt="ServiaAI" 
                  width={140} 
                  height={45} 
                  className="h-10 w-auto max-w-[140px]" 
                  priority 
                />
              </Link>
            </div>

            {/* Desktop Navigation Links - Only visible on large screens (≥1024px) */}
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
                        ? 'text-[var(--color-primary)]' 
                        : 'text-[var(--color-foreground)]/80 hover:text-[var(--color-primary)]'
                      }
                    `}
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

            <div className="hidden lg:flex items-center justify-end gap-4">
              <div className="w-full max-w-[240px]">
                <SearchInput placeholder="Search roles..." />
              </div>

              <div className="flex items-center gap-3 min-w-[100px] justify-end">
                {!mounted ? (
                  <div className="h-10 w-10 rounded-full bg-gray-50 animate-pulse" />
                ) : isLoggedIn ? (
                  <>
                    <button 
                      className="!bg-transparent !p-0 hover:opacity-70 transition-opacity"
                      aria-label="Notifications"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 18.75h17" />
                      </svg>
                    </button>

                    <button 
                      onClick={toggleLogin}
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold transition-transform hover:scale-105 shrink-0 cursor-pointer"
                      style={{ backgroundColor: '#FAD4C0' }}
                      aria-label="Toggle login state (testing)"
                    >
                      <span className="text-[#CC7D52] text-sm">JD</span>
                    </button>
                  </>
                ) : (
                  <Link 
                    href="/login"
                    className="px-6 py-2 rounded-full font-heading font-bold text-sm transition-all bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 active:scale-95 whitespace-nowrap"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>

            <div className="flex lg:hidden justify-end">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="p-2 text-[var(--color-foreground)] hover:text-[var(--color-primary)] transition-colors" 
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
            className="fixed top-20 left-0 right-0 z-40 bg-[var(--color-background)] border-b border-gray-100 shadow-lg lg:hidden"
          >
            {/* Internal scroll container prevents cutoff on small screens */}
            <div className="px-4 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Nav Links */}
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
                          ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' 
                          : 'text-[var(--color-foreground)]/80 hover:bg-gray-50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              {/* Search */}
              <div className="w-full">
                <SearchInput placeholder="Search roles..." />
              </div>

              {/* Auth State */}
              <div className="pt-2 border-t border-gray-100">
                {!mounted ? (
                  <div className="h-10 w-10 rounded-full bg-gray-50 animate-pulse" />
                ) : isLoggedIn ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: '#FAD4C0' }}>
                        <span className="text-[#CC7D52] text-sm">JD</span>
                      </div>
                      <span className="font-semibold text-sm">Sarah Jenkins</span>
                    </div>
                    <button className="p-2 text-[var(--color-primary)]" aria-label="Notifications">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 18.75h17" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <Link 
                    href="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center px-6 py-3 rounded-full font-heading font-bold text-sm bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 active:scale-95"
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