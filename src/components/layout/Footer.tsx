'use client';

import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800 bg-[var(--color-background)]">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
          

          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2 mb-1">
              <Image
                src="/logo.png"
                alt="ServiaAI"
                width={83}
                height={24}
                priority
              />
              <span className="text-lg font-bold tracking-tight">
                <span style={{ color: 'var(--color-foreground)' }}>Servia</span>
                <span style={{ color: 'var(--color-primary)' }}>AI</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--color-foreground)]/60">
              © 2026 ServiaAI. The Ultimate Career Experience.
            </p>
          </div>


          <nav className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2">
            <Link
              href="/terms-of-service"
              className="text-sm text-[var(--color-foreground)]/70 hover:text-[var(--color-primary)] transition-colors duration-200 cursor-pointer"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy-policy"
              className="text-sm text-[var(--color-foreground)]/70 hover:text-[var(--color-primary)] transition-colors duration-200 cursor-pointer"
            >
              Privacy Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
