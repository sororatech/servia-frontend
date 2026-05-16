export default function CreateJobLoading() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(38,185,200,0.12),_transparent_22%),linear-gradient(180deg,#fbfaf8_0%,#f3ece7_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">

        {/* Back link skeleton */}
        <div className="mb-6 h-5 w-32 animate-pulse rounded bg-[#ece4de]" />

        {/* Page title skeleton */}
        <div className="mb-8">
          <div className="h-10 w-56 animate-pulse rounded-2xl bg-[#ece4de]" />
          <div className="mt-2 h-5 w-72 animate-pulse rounded-xl bg-[#ece4de]" />
        </div>

        {/* Form card skeleton */}
        <div className="rounded-[2rem] border border-black/10 bg-white/85 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] flex flex-col gap-6">

          {/* Row: title */}
          <div>
            <div className="mb-2 h-4 w-24 animate-pulse rounded bg-[#ece4de]" />
            <div className="h-12 w-full animate-pulse rounded-2xl bg-[#ece4de]" />
          </div>

          {/* Row: department + employment type */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <div className="mb-2 h-4 w-28 animate-pulse rounded bg-[#ece4de]" />
              <div className="h-12 w-full animate-pulse rounded-2xl bg-[#ece4de]" />
            </div>
            <div>
              <div className="mb-2 h-4 w-28 animate-pulse rounded bg-[#ece4de]" />
              <div className="h-12 w-full animate-pulse rounded-2xl bg-[#ece4de]" />
            </div>
          </div>

          {/* Row: location */}
          <div>
            <div className="mb-2 h-4 w-20 animate-pulse rounded bg-[#ece4de]" />
            <div className="h-12 w-full animate-pulse rounded-2xl bg-[#ece4de]" />
          </div>

          {/* Row: description */}
          <div>
            <div className="mb-2 h-4 w-28 animate-pulse rounded bg-[#ece4de]" />
            <div className="h-32 w-full animate-pulse rounded-2xl bg-[#ece4de]" />
          </div>

          {/* Row: skills tags area */}
          <div>
            <div className="mb-2 h-4 w-32 animate-pulse rounded bg-[#ece4de]" />
            <div className="h-20 w-full animate-pulse rounded-2xl bg-[#ece4de]" />
          </div>

          {/* Buttons row */}
          <div className="flex justify-end gap-3 pt-2">
            <div className="h-11 w-32 animate-pulse rounded-full bg-[#ece4de]" />
            <div className="h-11 w-32 animate-pulse rounded-full bg-[#ece4de]" />
          </div>
        </div>
      </div>
    </main>
  );
}
