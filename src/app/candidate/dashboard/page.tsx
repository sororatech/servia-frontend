'use client';

export default function CandidateDashboard() {
  return (
    <main className="p-4 md:p-8">
      <h1 className="text-2xl font-heading font-bold text-[var(--color-secondary)] mb-4">
        Candidate Dashboard
      </h1>
      <p className="text-[var(--color-foreground)]/70">
        Your applications, AI feedback, and interview status will appear here.
      </p>
    </main>
  );
}