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
    <div className="min-h-screen flex flex-col bg-[var(--color-background)] dark:bg-[var(--color-warm-bg-deep)] transition-colors">
      <div className="flex flex-1">
        {/* Left Panel (Desktop) */}
        <div className="hidden lg:flex lg:w-[45%] relative items-center justify-center overflow-hidden bg-[var(--color-warm-bg-page)] dark:bg-[var(--color-warm-bg-deep)]">
          <Image
            src="/images/registerimg.png"
            alt="ServiaAI background"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 45vw"
            priority
          />
          {/* Slightly darker overlay for better contrast in both modes */}
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(15, 42, 68, 0.65)' }} />

          <div className="relative z-10 w-[85%] xl:w-auto xl:max-w-[460px] px-8 xl:px-14 py-10 xl:py-14 bg-white dark:bg-[var(--color-warm-surface)] shadow-2xl rounded-2xl border border-[var(--color-warm-border)] transition-colors">
            <div className="mb-8">
              <div className="mb-6">
                <Image src="/logo.png" alt="ServiaAI Logo" width={64} height={64} className="object-contain w-12 h-12 xl:w-16 xl:h-16" />
              </div>
              <h2 className="text-xl xl:text-2xl mb-3 leading-tight text-[var(--color-foreground)] font-bold">
                The Ultimate Career Experience.
              </h2>
              <p className="text-[var(--color-text-muted)] leading-relaxed text-sm">
                Access high-stakes professional introductions and premium career opportunities designed for the ambitious.
              </p>
            </div>

            <div className="mt-16 xl:mt-44 p-4 rounded-xl border border-[var(--color-warm-border)] bg-[var(--color-warm-bg-page)] dark:bg-[var(--color-warm-bg-deep)] shadow-sm transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-teal-light)]">
                  <ShieldCheck className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h6 className="text-sm leading-none text-[var(--color-foreground)] font-semibold">Verified Identity</h6>
                  <p className="text-xs text-[var(--color-text-muted)] leading-tight -mt-2">Your professional data is encrypted</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel (Form) */}
        <div className="w-full lg:w-[55%] flex items-center justify-center p-5 sm:p-8 bg-[var(--color-background)] dark:bg-[var(--color-warm-bg-deep)] overflow-y-auto transition-colors">
          <div className="w-full max-w-md">
            <div className="mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-foreground)]">Welcome back</h2>
              <p className="-mt-2 text-sm text-[var(--color-text-muted)]">Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-7">
              {(persistentError || error) && (
                <div className="p-3 bg-[var(--color-status-error-bg)] border border-[var(--color-status-error-border)] rounded-lg text-[var(--color-status-error-text)] text-sm">
                  {persistentError || error}
                </div>
              )}

              <div className="space-y-2 mt-8 sm:mt-16">
                <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text-dark)] dark:text-[var(--color-foreground)]">Email address</label>
                <input
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition text-sm sm:text-base bg-[var(--color-input-bg)] dark:bg-[var(--color-input-bg-light)] text-[var(--color-text-darkest)] dark:text-[var(--color-foreground)] placeholder-[var(--color-text-faint)] ${
                    validationErrors.email 
                      ? 'border-[var(--color-status-error-text)] focus:ring-[var(--color-status-error-text)]/20' 
                      : 'border-[var(--color-warm-border)] dark:border-[var(--color-warm-border)] focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]'
                  }`}
                />
                {validationErrors.email && <p className="text-sm text-[var(--color-status-error-text)]">{validationErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text-dark)] dark:text-[var(--color-foreground)]">Password</label>
                  <Link href="/forgot-password" className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors">Forgot Password?</Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} 
                    id="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 pr-11 rounded-lg border focus:outline-none focus:ring-2 transition text-sm sm:text-base bg-[var(--color-input-bg)] dark:bg-[var(--color-input-bg-light)] text-[var(--color-text-darkest)] dark:text-[var(--color-foreground)] placeholder-[var(--color-text-faint)] ${
                      validationErrors.password 
                        ? 'border-[var(--color-status-error-text)] focus:ring-[var(--color-status-error-text)]/20' 
                        : 'border-[var(--color-warm-border)] dark:border-[var(--color-warm-border)] focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none p-0.5 text-[var(--color-text-faint)] hover:text-[var(--color-foreground)] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
                {validationErrors.password && <p className="text-sm text-[var(--color-status-error-text)]">{validationErrors.password}</p>}
              </div>

              <div className="flex items-center">
                <input 
                  id="rememberMe" 
                  name="rememberMe" 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={handleCheckboxChange} 
                  className="w-4 h-4 flex-shrink-0 border-[var(--color-warm-border)] rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]/20 bg-[var(--color-input-bg)] dark:bg-[var(--color-input-bg-light)]" 
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-[var(--color-text-muted)] dark:text-[var(--color-foreground)]">Remember me</label>
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

            <p className="mt-5 sm:mt-6 text-center text-sm text-[var(--color-text-muted)] dark:text-[var(--color-foreground)]">
              Don&#39;t have an account?{' '}
              <Link href="/register" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />

      <style jsx>{`
        .custom-button {
          background-color: var(--color-primary) !important;
          height: 48px !important;
          min-height: 48px !important;
          padding: 0 1.5rem !important;
          border-radius: 9999px !important;
          color: white !important;
          font-weight: 600 !important;
        }
        .custom-button:hover:not(:disabled) {
          background-color: var(--color-primary-hover) !important;
        }
        .custom-button:disabled {
          opacity: 0.6 !important;
          cursor: not-allowed !important;
        }
      `}</style>
    </div>
  );
}