'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_STYLES } from '@/lib/theme';

interface Props {
  data: { day: string; count: number }[];
}

export default function ApplicationsChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-[var(--color-warm-border)] bg-white dark:bg-[var(--color-warm-surface)] p-6">
        <p className="text-sm text-[var(--color-text-subtle)]">No application data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--color-warm-border)] bg-white dark:bg-[var(--color-warm-surface)] p-6 shadow-sm">
      <h3 className="text-lg font-bold text-[var(--color-foreground)]">Applications For Jobs</h3>
      <p className="mb-4 text-sm text-[var(--color-text-muted)]">Amount of applications submitted</p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: CHART_STYLES.fontSize.axis, fill: 'var(--color-chart-text)' }}
              axisLine={{ stroke: 'var(--color-warm-border)', strokeWidth: CHART_STYLES.strokeWidth.axis }}
              tickLine={{ stroke: 'var(--color-warm-border)' }}
            />
            <YAxis
              tick={{ fontSize: CHART_STYLES.fontSize.axis, fill: 'var(--color-chart-text)' }}
              axisLine={{ stroke: 'var(--color-warm-border)', strokeWidth: CHART_STYLES.strokeWidth.axis }}
              tickLine={{ stroke: 'var(--color-warm-border)' }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-warm-surface)',
                border: '1px solid var(--color-warm-border)',
                borderRadius: CHART_STYLES.borderRadius.tooltip,
                fontFamily: CHART_STYLES.fontFamily,
                color: 'var(--color-foreground)',
              }}
              labelStyle={{ color: 'var(--color-text-muted)' }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="var(--color-primary)"
              strokeWidth={CHART_STYLES.strokeWidth.line}
              dot={{ fill: 'var(--color-primary)', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: 'var(--color-primary)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}