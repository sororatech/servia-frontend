'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-[var(--color-background)] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center w-full max-w-md"
      >
        

        <div className="relative mb-8 flex justify-center">
          <div className="absolute inset-0 bg-[var(--color-secondary)]/5 rounded-full blur-2xl scale-75" />
          
          <motion.div
            className="relative bg-[var(--color-background)] p-3 rounded-full shadow-lg border border-gray-100"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
            whileHover={{ scale: 1.05 }}
          >
            <Image
              src="/serviaBot.jpeg"
              alt="ServiaBot"
              width={160}
              height={160}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-inner"
              priority
            />
          </motion.div>

          <motion.div
            className="absolute -top-3 md:-top-8 left-1/2 -translate-x-1/2 bg-[var(--color-primary)] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md border-2 border-white z-10"
            initial={{ scale: 0, y: -15 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 300 }}
          >
            404
          </motion.div>
        </div>

        <h2 className="text-2xl md:text-3xl font-heading font-bold text-[var(--color-secondary)] mb-3">
          Page not found
        </h2>
        <p className="text-[var(--color-foreground)]/70 text-sm md:text-base mb-6 px-2">
          The link you followed might be broken, or the page has been removed. 
          Let&apos;s get you back on track.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-full font-heading font-semibold text-sm text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 transition-all hover:shadow-lg active:scale-95"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}