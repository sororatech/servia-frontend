'use client';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-background)] p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <h1 className="text-3xl font-heading font-bold text-[var(--color-secondary)]">
          Welcome Back
        </h1>
        <p className="text-[var(--color-foreground)]/70">
          Sign in to access your dashboard.
        </p>
        
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-gray-500">Login form coming soon.</p>
        </div>
      </div>
    </main>
  );
}