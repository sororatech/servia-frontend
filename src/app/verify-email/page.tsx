import { Suspense } from 'react';
import VerifyEmailForm from './verifyEmailForm';
import { Footer } from '@/components/ui';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading verification...</p>
          </div>
        </div>
      }>
        <VerifyEmailForm />
      </Suspense>
      <Footer />
    </div>
  );
}