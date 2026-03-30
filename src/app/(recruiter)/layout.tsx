import React from "react";

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-200 p-4">
        <h2 className="text-xl font-bold mb-4">Recruiter Menu</h2>
        <ul>
          <li>Overview</li>
          <li>Candidates</li>
          <li>Jobs</li>
          <li>Interviews</li>
          <li>Reports</li>
          <li>Settings (Admin)</li>
        </ul>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}