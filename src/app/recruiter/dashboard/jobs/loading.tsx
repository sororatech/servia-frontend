export default function JobsLoading() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(38,185,200,0.12),_transparent_22%),linear-gradient(180deg,#fbfaf8_0%,#f3ece7_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1400px]">

        {/* Header skeleton */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="h-10 w-64 animate-pulse rounded-2xl bg-[#ece4de]" />
            <div className="mt-3 h-5 w-80 animate-pulse rounded-xl bg-[#ece4de]" />
          </div>
          <div className="h-11 w-32 animate-pulse rounded-full bg-[#ece4de]" />
        </div>

        {/* Filter row skeleton */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-[1.1rem] bg-[#ece4de]" />
          ))}
        </div>

        {/* Cards skeleton */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col rounded-[2rem] border border-black/10 bg-white/85 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
            >
              <div className="h-6 w-3/4 animate-pulse rounded-lg bg-[#ece4de]" />
              <div className="mt-2 h-4 w-1/2 animate-pulse rounded-lg bg-[#ece4de]" />
              <div className="mt-1 h-4 w-1/3 animate-pulse rounded-lg bg-[#ece4de]" />
              <div className="mt-4 flex gap-2">
                <div className="h-6 w-20 animate-pulse rounded-full bg-[#ece4de]" />
                <div className="h-6 w-16 animate-pulse rounded-full bg-[#ece4de]" />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 rounded-2xl bg-[#f4efeb] px-4 py-3">
                <div>
                  <div className="h-3 w-16 animate-pulse rounded bg-[#ece4de]" />
                  <div className="mt-2 h-8 w-10 animate-pulse rounded-lg bg-[#ece4de]" />
                </div>
                <div>
                  <div className="h-3 w-16 animate-pulse rounded bg-[#ece4de]" />
                  <div className="mt-2 h-8 w-10 animate-pulse rounded-lg bg-[#ece4de]" />
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <div className="h-3 w-28 animate-pulse rounded bg-[#ece4de]" />
                <div className="h-4 w-16 animate-pulse rounded bg-[#ece4de]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
