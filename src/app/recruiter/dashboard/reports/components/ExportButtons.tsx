'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalyticsData } from '@/types/analytics';

interface Props {
  data: AnalyticsData;
}

const exportToCSV = (data: any[], filename: string): void => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
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
  const handleExportPDF = (): void => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Analytics & Reports', 14, 20);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [['Metric', 'Value']],
      body: [
        ['Total Applications', data.total_applications],
        ['Total Applicants', data.total_applicants],
        ['Avg AI Fit Score', `${data.avg_ai_fit_score}%`],
        ['Acceptance Rate', `${data.acceptance_rate}%`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [20, 184, 166] },
    });

    doc.save('recruitment-analytics.pdf');
  };

  const handleExportCSV = (e?: React.MouseEvent<HTMLButtonElement>): void => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const csvData = (data.applications_by_job || []).map(
      (j: { job_title: string; applications: number }) => ({
        'Job Title': j.job_title,
        Applications: j.applications,
      })
    );

    exportToCSV(csvData, 'recruitment-analytics');
  };

  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={handleExportPDF}
        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
      >
        Export PDF
      </button>
      <button
        type="button"
        onClick={handleExportCSV}
        className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition text-sm font-medium"
      >
        Export CSV
      </button>
    </div>
  );
}