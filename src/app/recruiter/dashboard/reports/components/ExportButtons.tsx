'use client';

import { AnalyticsData } from '@/types/analytics';
import { CHART_COLORS } from '@/lib/theme';

interface Props {
  data: AnalyticsData;
}

const exportToCSV = (data: any[], filename: string): void => {
  if (!data || data.length === 0) {
    alert('No data available to export');
    return;
  }

  const headers = Object.keys(data[0]);
  
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((field) => {
          const value = row[field];
          
          if (value == null) return '""';
          
          const str = String(value);
          
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          
          return str;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.style.position = 'fixed';
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
};

export default function ExportButtons({ data }: Props) {
  const handleExportCSV = (e?: React.MouseEvent<HTMLButtonElement>): void => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const csvData = (data.applications_by_job || []).map((job) => ({
      'Job Title': job.job_title,
      Applications: job.applications,
    }));

    exportToCSV(csvData, 'recruitment-analytics');
  };

  const handleExportPDF = (): void => {
 
    alert('PDF export with charts is coming soon! For now, use CSV export for data.');
  };

  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={handleExportPDF}
        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium disabled:opacity-50"
        title="PDF export with charts coming soon"
      >
        Export PDF
      </button>
      
      <button
        type="button"
        onClick={handleExportCSV}
        className="px-4 py-2 bg-[var(--color-primary,#26B9C8)] text-white rounded-lg hover:bg-[var(--color-primary-dark,#14b8a6)] transition text-sm font-medium shadow-sm hover:shadow"
      >
        Export CSV
      </button>
    </div>
  );
}