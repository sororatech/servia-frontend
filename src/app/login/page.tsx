'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AUTH_STORAGE, getDashboardUrl } from '@/lib/auth';

type LoginResponse = {
  token: string;
  user_id: number;
  user_type: 'candidate' | 'recruiter';
  email: string;
  first_name: string;
  last_name: string;
};

function getApiUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = AUTH_STORAGE.getToken();
    const userType = AUTH_STORAGE.getUserType();

    if (token && userType) {
      // Re-set cookies in case they were cleared while localStorage still has the token
      AUTH_STORAGE.setToken(token);
      AUTH_STORAGE.setUserType(userType);
      const returnUrl = searchParams.get('returnUrl');
      router.replace(returnUrl ?? getDashboardUrl(userType));
    }
  }, [router, searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(getApiUrl('/users/login/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const payload = (await response.json()) as Partial<LoginResponse> & {
        error?: string;
      };

      if (!response.ok || !payload.token || !payload.user_type) {
        throw new Error(payload.error ?? 'Unable to sign in right now.');
      }

      AUTH_STORAGE.setToken(payload.token);
      AUTH_STORAGE.setUserType(payload.user_type);
      AUTH_STORAGE.setUserId(String(payload.user_id ?? ''));
      const returnUrl = searchParams.get('returnUrl');
      router.replace(returnUrl ?? getDashboardUrl(payload.user_type));
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to sign in right now.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(38,185,200,0.12),_transparent_25%),linear-gradient(180deg,#f9f7f4_0%,#efe6df_100%)] p-4">
      <div className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-[-0.04em] text-[#164e63]">
            Welcome Back
          </h1>
          <p className="mt-3 text-sm text-[#5f5a55]">
            Sign in to access your dashboard.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#4f4a45]">
              Email Address
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-[1rem] border border-[#ddd5cf] bg-[#fcfbfa] px-4 py-3 text-sm text-[#1f1c19] outline-none transition focus:border-[#26b9c8]"
              placeholder="sarah@grandhotel.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#4f4a45]">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-[1rem] border border-[#ddd5cf] bg-[#fcfbfa] px-4 py-3 text-sm text-[#1f1c19] outline-none transition focus:border-[#26b9c8]"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </label>

          {error ? (
            <div className="rounded-[1rem] border border-[#efc7bf] bg-[#fff0ec] px-4 py-3 text-sm text-[#b13d2f]">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-[#26b9c8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1598a6] disabled:cursor-not-allowed disabled:bg-[#8fd7de]"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  );
}
