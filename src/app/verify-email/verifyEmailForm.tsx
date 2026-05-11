'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui';

export default function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(120);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (resendDisabled && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setResendDisabled(false);
      setCountdown(120);
    }
  }, [resendDisabled, countdown]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split('');
    while (newCode.length < 6) newCode.push('');
    setCode(newCode);
    
    const nextEmptyIndex = newCode.findIndex(digit => !digit);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6 || !email) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authAPI.verifyEmail({ email, code: verificationCode });
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Invalid verification code. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    
    setResendDisabled(true);
    setCountdown(120);
    setError('');

    try {
      await authAPI.resendVerificationCode({ email });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend code. Please try again.');
      setResendDisabled(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Your email has been successfully verified. Redirecting you to login...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-teal-500 h-2 rounded-full animate-pulse" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
        
        <div className="space-y-5 sm:space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
              <span style={{ color: '#0F2A44' }}>Confirm it&apos;s </span>
              <span style={{ color: '#26B9C8' }}>really </span>
              <span style={{ color: '#0F2A44' }}>you.</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              We&#39;ve sent a 6-digit verification code to{' '}
              <span className="font-semibold text-gray-900 break-all">{email || 'your email'}</span>. 
              To keep your curated workspace secure, please enter it below.
            </p>
          </div>

          <div className="rounded-xl px-4 sm:px-5 py-4 border" style={{ backgroundColor: '#F0F4F7', borderColor: '#E0EFFF' }}>
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#DAE2FF' }}>
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#26B9C8' }} />
              </div>
              <div>
                <h5 className="font-semibold text-sm mb-1" style={{ color: '#0F2A44' }}>Check your inbox</h5>
                <p className="-mt-3 text-sm text-gray-600 leading-relaxed">
                  Don&#39;t see it? Check your spam folder or try resending the code in{' '}
                  <span className="font-mono font-semibold" style={{ color: '#26B9C8' }}>
                    {resendDisabled ? formatTime(countdown) : '00:00'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-8 lg:p-10">
            <div className="mb-6">
              <h5 className="text-sm font-semibold uppercase tracking-wider mb-5 sm:mb-6" style={{ color: '#26B9C8' }}>
                Verification Code
              </h5>
              
              <div className="flex gap-2 sm:gap-3 justify-between mb-6 sm:mb-8">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { if (el) inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="flex-1 min-w-0 aspect-square text-center text-xl sm:text-2xl font-bold border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition bg-gray-50"
                    disabled={loading}
                  />
                ))}
              </div>

              {error && (
                <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="button"
                onClick={handleVerify}
                disabled={loading || code.join('').length !== 6}
                fullWidth
                className="custom-button mb-6 sm:mb-8 mt-3"
                style={{ height: '48px', minHeight: '48px', fontWeight: '700', opacity: '1' }}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <Link href="/login" className="inline-flex items-center gap-1 font-medium transition-colors" style={{ color: '#26B9C8' }}>
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
                <button
                  onClick={handleResend}
                  disabled={resendDisabled || !email}
                  className={`font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    resendDisabled 
                      ? 'text-gray-400' 
                      : 'text-teal-600 hover:text-teal-700 font-semibold'
                  }`}
                >
                  Resend Code
                </button>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Issues receiving the code?{' '}
              <Link href="/support" className="font-medium" style={{ color: '#26B9C8' }}>
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-button {
          background-color: #26B9C8 !important;
          height: 48px !important;
          min-height: 48px !important;
          padding: 0 1.5rem !important;
          border-radius: 9999px !important;
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