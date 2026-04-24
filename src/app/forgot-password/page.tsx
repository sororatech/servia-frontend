'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RefreshCw, Mail, Check, ArrowLeft } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui';
import { Footer } from '@/components/ui';
import { color } from 'framer-motion';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setValidationError('Email address is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) return;
    
    setLoading(true);
    setError('');

    try {
      await authAPI.requestPasswordReset(email.trim().toLowerCase());
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/forgot-password-bg.png"
          alt="Forgot Password Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(32, 94, 101, 0.5)' }} />
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded shadow-2xl p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F0F4F7' }}>
                <RefreshCw size={32} style={{ color: '#26B9C8' }} />
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2 -mt-4" style={{ color: '#0F2A44' }}>
                Forgot password?
              </h2>
              <p className="text-sm" style={{ color: '#26B9C8' }}>
                No worries, it happens to the best of us. Enter your email and we&#39;ll send you a recovery link.
              </p>
            </div>

            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-3.5 mt-12" style={{ color: '#0F2A44' }}>
                    Work Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none pb-2.5">
                      <Mail className="h-5 w-5" style={{ color: '#26B9C8' }} />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (validationError) setValidationError('');
                      }}
                      placeholder="name@company.com"
                      className={`w-full pl-10 pr-4 py-3.5 mb-3 rounded-lg border focus:outline-none focus:ring-2 transition ${
                        validationError ? 'border-red-500' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: '#D9E4EA', color: '#1a202c' }}
                    />
                  </div>
                  {validationError && (
                    <p className="mt-1 text-sm text-red-600">{validationError}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  fullWidth
                  className="custom-button mb-12"
                  style={{ height: '54px', minHeight: '54px' }}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0F2A44' }}>
                    Check your email!
                  </h3>
                  <p className="text-sm text-gray-600">
                    We&#39;ve sent a password reset link to <span className="font-medium" style={{ color: '#0F2A44' }}>{email}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Didn&#39;t receive the email? Check your spam folder or try again.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  className="font-medium text-sm"
                  style={{ color: '#26B9C8' }}
                >
                  Send another email
                </button>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link href="/login" className="inline-flex items-center text-sm font-medium" style={{ color: '#26B9C8' }}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .custom-button {
          background-color: #26B9C8 !important;
          height: 56px !important;
          min-height: 56px !important;
          padding: 0 1.5rem !important;
          border-radius: 9999px !important;
          font-weight: 600 !important;
          font-size: 1rem !important;
        }
        .custom-button:hover {
          background-color: #20a8b6 !important;
          opacity: 0.95 !important;
        }
        .custom-button:disabled {
          opacity: 0.6 !important;
        }
      `}</style>
    </div>
  );
}