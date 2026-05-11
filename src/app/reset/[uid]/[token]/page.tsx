'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui';
import { Footer } from '@/components/ui';

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams<{ uid: string; token: string }>();
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const validatePassword = (password: string): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (password.length < 8) {
      errors.minLength = 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[0-9])/.test(password)) {
      errors.hasNumber = 'Password must include at least one number or symbol';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (name === 'newPassword') {
      validatePassword(value);
    }
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePassword(formData.newPassword)) {
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setValidationErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setLoading(true);

    try {
      await authAPI.confirmPasswordReset(
        params.uid,
        params.token,
        formData.newPassword
      );
      
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password. The link may be expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  const passwordRequirements = {
    minLength: formData.newPassword.length >= 8,
    hasNumber: /[0-9]/.test(formData.newPassword) || /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword),
    passwordsMatch: formData.newPassword === formData.confirmPassword && formData.newPassword !== '',
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h1>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Your password has been successfully reset. Redirecting you to login...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-teal-500 h-2 rounded-full animate-pulse" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        
        {/* Left panel */}
        <div className="flex flex-col justify-center p-2 sm:p-4 lg:p-8">
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-center lg:justify-start mb-4 sm:mb-6">
              <Image
                src="/logo.png"
                alt="ServiaAI Logo"
                width={64}
                height={64}
                className="object-contain w-12 h-12 sm:w-16 sm:h-16"
              />
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-3 text-center lg:text-left">
              <span style={{ color: '#0F2A44' }}>Secure your </span>
              <span style={{ color: '#26B9C8' }}>professional</span>
              <span style={{ color: '#0F2A44' }}> future.</span>
            </h1>
            
            <p className="text-gray-600 leading-relaxed text-center lg:text-left mt-5 sm:mt-7 text-sm sm:text-base">
              We take your privacy seriously. Resetting your password ensures your curated career journey remains exclusively yours.
            </p>
          </div>

          <div className="rounded-xl px-4 sm:px-6 py-2.5 border mx-auto lg:mx-0 mt-4 sm:mt-5 w-full" style={{ backgroundColor: '#F0F4F7', maxWidth: '520px' }}>
            <div className="flex flex-col items-start gap-2 sm:gap-3">
              <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="#26B9C8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h6 className="font-semibold text-sm mb-1 -mt-2" style={{ color: '#0F2A44' }}>Instant</h6>
                <p className="text-sm text-gray-600">
                  Update synced across all devices immediately.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex items-center justify-center p-2 sm:p-4 lg:p-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-8 py-8 sm:py-12">
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold mb-2" style={{ color: '#0F2A44' }}>
                  Reset Password
                </h2>
                <p className="text-sm -mt-3" style={{ color: '#26B9C8' }}>
                  Please choose a strong password you haven&#39;t used before.
                </p>
              </div>

              {error && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <div>
                  <label htmlFor="newPassword" className="block text-xs mb-3 sm:mb-4 font-semibold uppercase tracking-wider mt-8 sm:mt-12" style={{ color: '#0F2A44' }}>
                    NEW PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition text-sm sm:text-base"
                      style={{ backgroundColor: '#D9E4EA', color: '#1a202c' }}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 inset-y-0 focus:outline-none p-1"
                      style={{ color: '#26B9C8' }}
                    >
                      {showPassword
                        ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                        : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block mb-3 sm:mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#0F2A44' }}>
                    CONFIRM NEW PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition text-sm sm:text-base"
                      style={{ backgroundColor: '#D9E4EA', color: '#1a202c' }}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none p-1"
                      style={{ color: '#26B9C8' }}
                    >
                      {showConfirmPassword
                        ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                        : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                  )}
                </div>

                <div className="rounded-lg p-3 sm:p-4 space-y-2" style={{ backgroundColor: '#F9FAFB' }}>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <div className={`w-2 h-2 flex-shrink-0 rounded-full ${passwordRequirements.minLength ? 'bg-teal-500' : 'bg-gray-300'}`} />
                    <span className={passwordRequirements.minLength ? 'font-medium' : ''} style={{ color: passwordRequirements.minLength ? '#26B9C8' : '#0F2A44' }}>
                      At least 8 characters long
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <div className={`w-2 h-2 flex-shrink-0 rounded-full ${passwordRequirements.hasNumber ? 'bg-teal-500' : 'bg-gray-300'}`} />
                    <span className={passwordRequirements.hasNumber ? 'font-medium' : ''} style={{ color: passwordRequirements.hasNumber ? '#26B9C8' : '#0F2A44' }}>
                      Includes a number or symbol
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <div className={`w-2 h-2 flex-shrink-0 rounded-full ${passwordRequirements.passwordsMatch ? 'bg-teal-500' : 'bg-gray-300'}`} />
                    <span className={passwordRequirements.passwordsMatch ? 'font-medium' : ''} style={{ color: passwordRequirements.passwordsMatch ? '#26B9C8' : '#0F2A44' }}>
                      Passwords match
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || Object.keys(validationErrors).length > 0}
                  fullWidth
                  className="custom-button"
                  style={{ height: '48px', minHeight: '48px' }}
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </Button>
              </form>

              <div className="mt-5 sm:mt-6 text-center">
                <Link href="/login" className="text-sm font-medium" style={{ color: '#26B9C8' }}>
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

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