'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button, Footer } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [persistentError, setPersistentError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setPersistentError('');

    try {
      await login(formData.email, formData.password, rememberMe);
    } catch (err: any) {
      const errorCode = err.response?.data?.code;

      if (errorCode === 'EMAIL_NOT_VERIFIED') {
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
        return;
      }
      const message = err.response?.data?.error || 'Login failed';
      setPersistentError(message);
      setTimeout(() => setPersistentError(''), 5000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <div className="hidden lg:flex lg:w-[45%] relative items-center justify-center overflow-hidden">
          <Image
            src="/images/registerimg.png"
            alt="ServiaAI background"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 45vw"
            priority
          />
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(32, 94, 101, 0.5)' }} />
          
          <div className="relative z-10 w-[85%] xl:w-auto xl:max-w-[460px] px-8 xl:px-14 py-10 xl:py-14 bg-white shadow-2xl rounded-[2px]">
            <div className="mb-8">
              <div className="mb-6">
                <Image src="/logo.png" alt="ServiaAI Logo" width={64} height={64} className="object-contain w-12 h-12 xl:w-16 xl:h-16" />
              </div>
              <h2 className="text-xl xl:text-2xl mb-3 leading-tight" style={{ color: '#0F2A44' }}>
                The Ultimate Career Experience.
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                Access high-stakes professional introductions and premium career opportunities designed for the ambitious.
              </p>
            </div>

            <div className="mt-16 xl:mt-44 p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E6F7FB' }}>
                  <ShieldCheck className="w-5 h-5" style={{ color: '#26B9C8' }} />
                </div>
                <div>
                  <h6 className="text-sm leading-none" style={{ color: '#0F2A44' }}>Verified Identity</h6>
                  <p className="text-xs text-gray-500 leading-tight -mt-2" style={{ color: '#26B9C8' }}>Your professional data is encrypted</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[55%] flex items-center justify-center p-5 sm:p-8 bg-white overflow-y-auto">
          <div className="w-full max-w-md">
            <div className="mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: '#0F2A44' }}>Welcome back</h2>
              <p className="-mt-2 text-sm" style={{ color: '#26B9C8' }}>Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-7">
              {(persistentError || error) && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{persistentError || error}</div>
              )}

              <div className="space-y-2 mt-8 sm:mt-16">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                <input
                  type="email" id="email" name="email" value={formData.email} onChange={handleChange}
                  placeholder="name@company.com"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition text-sm sm:text-base ${validationErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#D9E4EA', color: '#1a202c' }}
                />
                {validationErrors.email && <p className="text-sm text-red-600">{validationErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <Link href="/forgot-password" className="text-sm font-medium" style={{ color: '#26B9C8' }}>Forgot Password?</Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 pr-11 rounded-lg border focus:outline-none focus:ring-2 transition text-sm sm:text-base ${validationErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                    style={{ backgroundColor: '#D9E4EA', color: '#1a202c' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none p-0.5"
                    style={{ color: '#26B9C8' }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
                {validationErrors.password && <p className="text-sm text-red-600">{validationErrors.password}</p>}
              </div>

              <div className="flex items-center">
                <input id="rememberMe" name="rememberMe" type="checkbox" checked={rememberMe} onChange={handleCheckboxChange} className="w-4 h-4 flex-shrink-0 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500" />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">Remember me</label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                size="lg"
                fullWidth
                className="custom-button"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <p className="mt-5 sm:mt-6 text-center text-sm text-gray-600">
              Don&#39;t have an account?{' '}
              <Link href="/register" className="font-medium" style={{ color: '#26B9C8' }}>Create Account</Link>
            </p>
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
