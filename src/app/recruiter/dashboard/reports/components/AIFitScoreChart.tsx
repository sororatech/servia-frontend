'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS, CHART_STYLES } from '@/lib/theme';

interface Props {
  data: { job_title: string; average_score: number }[];
}

export default function AIFitScoreChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-[var(--color-warm-border)] bg-white p-6">
        <p className="text-sm text-[var(--color-text-subtle)]">No AI score data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--color-warm-border)] bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-[var(--color-secondary)]">AI Fit Score Distribution</h3>
      <p className="mb-4 text-sm text-[var(--color-text-muted)]">Average AI score per job</p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: CHART_COLORS.tooltipBg,
                border: `1px solid ${CHART_COLORS.tooltipBorder}`,
                borderRadius: CHART_STYLES.borderRadius.tooltip,
                fontFamily: CHART_STYLES.fontFamily,
              }}
            />
            <Bar dataKey="average_score" fill="var(--color-primary)" barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}