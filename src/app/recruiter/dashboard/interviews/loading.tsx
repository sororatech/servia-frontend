export default function InterviewsLoading() {
  return (
    <main className="min-h-screen bg-page-gradient px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mt-3 h-10 w-72 animate-pulse rounded-2xl bg-[var(--color-warm-border)]" />
            <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded-xl bg-[var(--color-warm-border)]" />
          </div>
          <div className="h-11 w-44 animate-pulse rounded-full bg-[var(--color-warm-border)]" />
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[1.5rem] border border-black/10 bg-white/85 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
            >
              <div className="h-4 w-24 animate-pulse rounded bg-[var(--color-warm-border)]" />
              <div className="mt-3 h-9 w-16 animate-pulse rounded-lg bg-[var(--color-warm-border)]" />
            </div>
          ))}
        </div>

        <div className="mb-6 h-40 animate-pulse rounded-[1.5rem] bg-[var(--color-warm-border)]" />
        <div className="h-80 animate-pulse rounded-[1.5rem] bg-[var(--color-warm-border)]" />
      </div>
    </main>
  );
}
