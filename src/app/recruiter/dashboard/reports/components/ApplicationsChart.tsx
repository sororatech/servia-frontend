'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS, CHART_STYLES } from '@/lib/theme';

interface Props {
  data: { day: string; count: number }[];
}

export default function ApplicationsChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[var(--color-chart-bg,#faf8f5)] rounded-lg shadow-md border border-gray-200 p-6 h-full flex items-center justify-center">
        <p className="text-gray-400 text-sm">No application data available</p>
      </div>
    );
  }

  const chartHeight = typeof window !== 'undefined' && window.innerWidth < 640 ? 200 : 260;

  return (
    <div 
      data-chart="applications-over-time" 
      className="bg-[var(--color-chart-bg,#faf8f5)] rounded-lg shadow-md border border-gray-200 p-6 h-full"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Applications For Jobs</h3>
      <p className="text-sm text-gray-500 mb-4">Amount of applications submitted</p>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridLine} vertical={false} />
          <XAxis 
            dataKey="day" 
            tick={{ fontSize: CHART_STYLES.fontSize.axis, fill: CHART_COLORS.axisText }} 
            axisLine={{ stroke: CHART_COLORS.axisLine, strokeWidth: CHART_STYLES.strokeWidth.axis }}
            tickLine={{ stroke: CHART_COLORS.axisLine }}
          />
          <YAxis 
            tick={{ fontSize: CHART_STYLES.fontSize.axis, fill: CHART_COLORS.axisText }} 
            axisLine={{ stroke: CHART_COLORS.axisLine, strokeWidth: CHART_STYLES.strokeWidth.axis }}
            tickLine={{ stroke: CHART_COLORS.axisLine }}
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: CHART_COLORS.tooltipBg, 
              border: `1px solid ${CHART_COLORS.tooltipBorder}`, 
              borderRadius: CHART_STYLES.borderRadius.tooltip,
              fontFamily: CHART_STYLES.fontFamily,
            }}
          />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke={CHART_COLORS.primary} 
            strokeWidth={CHART_STYLES.strokeWidth.line}
            dot={{ fill: CHART_COLORS.primary, strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: CHART_COLORS.primary }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}