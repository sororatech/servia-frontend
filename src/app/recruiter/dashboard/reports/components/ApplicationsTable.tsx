'use client';

import { useState } from 'react';

interface Props {
  data: { job_title: string; applications: number }[];
}

export default function ApplicationsTable({ data }: Props) {
  const [showAll, setShowAll] = useState(false);
  const displayData = showAll ? data : data.slice(0, 5);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Applications Posted</h3>
      <p className="text-sm text-gray-500 mb-4">Amount of jobs by application volume</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600">Job Title</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600">Applications</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((job, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900">{job.job_title}</td>
                <td className="text-right py-3 px-4 font-medium text-gray-700">{job.applications}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-teal-500 text-sm font-medium mt-4 hover:underline"
        >
          {showAll ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}