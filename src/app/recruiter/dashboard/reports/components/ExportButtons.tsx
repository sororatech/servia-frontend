'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { AnalyticsData } from '@/types/analytics';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Props {
  data: AnalyticsData;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

function escapeCSV(value: any): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function exportToCSV(data: AnalyticsData, filename: string): void {
  const rows: string[] = [];
  rows.push(`"Exported on: ${new Date().toLocaleString()}"`);
  rows.push('');
  rows.push('Summary Stats');
  rows.push('"Metric","Value"');
  rows.push(`"Total Applications",${escapeCSV(data.total_applications)}`);
  rows.push(`"Total Applicants",${escapeCSV(data.total_applicants)}`);
  rows.push(`"Avg AI Fit Score",${escapeCSV(data.avg_ai_fit_score)}`);
  rows.push(`"Acceptance Rate",${escapeCSV(data.acceptance_rate)}%`);
  rows.push('');

  rows.push('Pipeline Breakdown');
  rows.push('"Status","Count"');
  (data.pipeline_breakdown || []).forEach(item => rows.push(`${escapeCSV(item.status)},${escapeCSV(item.count)}`));
  rows.push('');

  rows.push('Applications by Job');
  rows.push('"Job Title","Applications"');
  (data.applications_by_job || []).forEach(job => rows.push(`${escapeCSV(job.job_title)},${escapeCSV(job.applications)}`));
  rows.push('');

  rows.push('Applications Over Time');
  rows.push('"Date","Count"');
  (data.applications_over_time || []).forEach(item => rows.push(`${escapeCSV(item.day)},${escapeCSV(item.count)}`));

  const csvContent = rows.join('\n');
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
}

async function generatePDFWithScreenshot(
  contentRef: React.RefObject<HTMLDivElement | null>,
  data: AnalyticsData,
  filename: string
) {
  if (!contentRef.current) {
    alert('Dashboard not ready. Please try again.');
    return;
  }

  try {
    const canvas = await html2canvas(contentRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: true,
      useCORS: true,
      ignoreElements: (element) => {
        if (element.classList && element.classList.contains('exclude-from-pdf')) {
          return true;
        }
        return false;
      },
    });
    const imgData = canvas.toDataURL('image/png');

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    let logoData: string | null = null;
    try {
      const response = await fetch(`${window.location.origin}/logo.png`, {
        mode: 'cors',
        cache: 'no-cache',
      });
      if (response.ok) {
        const blob = await response.blob();
        logoData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }
    } catch {
      console.warn('Logo not available, skipping.');
    }

    const startY = 28;
    const logoSize = 10;
    const logoX = 10;
    const titleY = startY;
    const dateY = startY + 8;

    if (logoData) {
      doc.addImage(logoData, 'PNG', logoX, titleY - 6, logoSize, logoSize);
    } else {
      doc.setFontSize(14);
      doc.setTextColor('#26B9C8');
      doc.text('ServiaAI', logoX, titleY);
    }

    doc.setFontSize(16);
    doc.setTextColor('#0F2A44');
    doc.text('Recruitment Analytics Report', pageWidth / 2, titleY, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor('#666');
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, dateY, { align: 'center' });

    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height / canvas.width) * imgWidth;
    const yOffset = 45;

    let remainingHeight = imgHeight;
    let sourceY = 0;
    const pageHeightForImage = pageHeight - yOffset - 20;

    while (remainingHeight > 0) {
      const sliceHeight = Math.min(remainingHeight, pageHeightForImage);
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = (sliceHeight / imgHeight) * canvas.height;
      const ctx = sliceCanvas.getContext('2d')!;
      ctx.drawImage(
        canvas,
        0,
        (sourceY / imgHeight) * canvas.height,
        canvas.width,
        sliceCanvas.height,
        0,
        0,
        sliceCanvas.width,
        sliceCanvas.height
      );
      const sliceData = sliceCanvas.toDataURL('image/png');
      doc.addImage(sliceData, 'PNG', 10, yOffset, imgWidth, sliceHeight);
      remainingHeight -= sliceHeight;
      sourceY += sliceHeight;
      if (remainingHeight > 0) doc.addPage();
    }

    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error('PDF generation failed:', error);
    alert('PDF generation failed. Please try again or use "Print to PDF".');
  }
}

export default function ExportButtons({ data, contentRef }: Props) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleExportCSV = () => exportToCSV(data, 'recruitment-analytics');

  const handleExportPDF = async () => {
    setIsGeneratingPDF(true);
    await generatePDFWithScreenshot(contentRef, data, 'recruitment-analytics');
    setIsGeneratingPDF(false);
  };

  return (
    <div className="flex gap-3">
      <Button variant="ghost" size="md" onClick={handleExportPDF} disabled={isGeneratingPDF}>
        {isGeneratingPDF ? 'Generating...' : 'Export PDF'}
      </Button>
      <Button variant="primary" size="md" onClick={handleExportCSV}>
        Export CSV
      </Button>
    </div>
  );
}