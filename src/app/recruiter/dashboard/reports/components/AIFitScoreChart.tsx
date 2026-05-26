'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS, CHART_STYLES } from '@/lib/theme';

interface Props {
  data: { job_title: string; average_score: number }[];
}

export default function AIFitScoreChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[var(--color-chart-bg,#faf8f5)] rounded-lg shadow-md border border-gray-200 p-6 h-full flex items-center justify-center">
        <p className="text-gray-400 text-sm">No AI score data available</p>
      </div>
    );
  }

  return (
    <div 
      data-chart="ai-fit-score" 
      className="bg-[var(--color-chart-bg,#faf8f5)] rounded-lg shadow-md border border-gray-200 p-6 h-full"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-1">AI Fit Score Distribution</h3>
      <p className="text-sm text-gray-500 mb-4">Average AI score per job</p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridLine} vertical={false} />
          <XAxis 
            dataKey="job_title" 
            tick={{ fontSize: CHART_STYLES.fontSize.axis, fill: CHART_COLORS.axisText }} 
            axisLine={{ stroke: CHART_COLORS.axisLine, strokeWidth: CHART_STYLES.strokeWidth.axis }}
            tickLine={{ stroke: CHART_COLORS.axisLine }}
          />
          <YAxis 
            tick={{ fontSize: CHART_STYLES.fontSize.axis, fill: CHART_COLORS.axisText }} 
            axisLine={{ stroke: CHART_COLORS.axisLine, strokeWidth: CHART_STYLES.strokeWidth.axis }}
            tickLine={{ stroke: CHART_COLORS.axisLine }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: CHART_COLORS.tooltipBg, 
              border: `1px solid ${CHART_COLORS.tooltipBorder}`, 
              borderRadius: CHART_STYLES.borderRadius.tooltip,
              fontFamily: CHART_STYLES.fontFamily,
            }}
          />
          <Bar 
            dataKey="average_score" 
            fill={CHART_COLORS.primary} 
            barSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}