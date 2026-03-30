import React from "react";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 p-4">
        <h2 className="text-xl font-bold mb-4">Candidate Menu</h2>
        <ul>
          <li>Dashboard</li>
          <li>Profile</li>
          <li>CV Upload</li>
          <li>Video Intro</li>
        </ul>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}