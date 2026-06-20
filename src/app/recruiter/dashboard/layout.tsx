import DevPerformanceMeasureFix from '@/components/dev/DevPerformanceMeasureFix';

export default function RecruiterDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-[var(--color-background)] overflow-x-hidden">
      <DevPerformanceMeasureFix />
      <main className="min-w-0 flex-1 overflow-x-auto">{children}</main>
    </div>
  );
}