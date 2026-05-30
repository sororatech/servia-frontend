import { Sidebar } from "@/components/layout/Sidebar";

export default function RecruiterDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-[var(--color-background)] overflow-x-hidden">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-x-auto pt-16 md:pt-0">{children}</main>
    </div>
  );
}
