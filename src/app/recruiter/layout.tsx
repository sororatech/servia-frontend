// app/dashboard/layout.tsx
import { Sidebar } from "@/components/layout/Sidebar";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar stays fixed on the left */}
      <Sidebar />
      
      {/* Main content area scrolls independently */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}