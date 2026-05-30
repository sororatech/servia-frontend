'use client';

import { useState } from 'react';

interface Props {
  data: { job_title: string; applications: number }[];
}

export default function ApplicationsTable({ data }: Props) {
  const [showAll, setShowAll] = useState(false);
  const displayData = showAll ? data : data.slice(0, 5);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 h-full flex items-center justify-center">
        <p className="text-gray-400 text-sm">No job application data available</p>
      </div>
    );
  }

  return (
    <div 
      data-chart="applications-by-job" 
      className="bg-white rounded-lg shadow-md border border-gray-200 p-6 h-full"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Applications Posted</h3>
      <p className="text-sm text-gray-500 mb-4">Amount of jobs by application volume</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse border border-black">
          <thead>
            <tr className="bg-white">
              <th className="border border-black py-2 px-4 text-left font-semibold text-gray-900">Job Title</th>
              <th className="border border-black py-2 px-4 text-left font-semibold text-gray-900">Number of applications</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((job, i) => (
              <tr key={i} className="bg-white hover:bg-gray-50">
                <td className="border border-black py-2 px-4 text-gray-800">{job.job_title}</td>
                <td className="border border-black py-2 px-4 text-gray-800 text-center">{job.applications}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 5 && (
        <div className="mt-3 text-right">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-gray-600 hover:text-[var(--color-primary,#26B9C8)] transition font-medium"
          >
            {showAll ? 'Show less' : 'Show more'}
          </button>
        </div>
      )}
    </div>
  );
}