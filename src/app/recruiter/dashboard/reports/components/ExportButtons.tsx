'use client';

import { Button } from '@/components/ui/Button';
import { AnalyticsData } from '@/types/analytics';

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

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
};

export default function ExportButtons({ data }: Props) {
  const handleExportCSV = () => {
    const csvData = (data.applications_by_job || []).map((job) => ({
      'Job Title': job.job_title,
      Applications: job.applications,
    }));
    exportToCSV(csvData, 'recruitment-analytics');
  };

  const handleExportPDF = () => {
    alert('PDF export with charts is coming soon! For now, use CSV export for data.');
  };

  return (
    <div className="flex gap-3">
      <Button variant="ghost" size="md" onClick={handleExportPDF}>
        Export PDF
      </Button>
      <Button variant="primary" size="md" onClick={handleExportCSV}>
        Export CSV
      </Button>
    </div>
  );
}