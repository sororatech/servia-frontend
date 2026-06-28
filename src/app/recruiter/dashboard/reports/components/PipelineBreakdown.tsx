'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CHART_COLORS, CHART_STYLES } from '@/lib/theme';

interface Props {
  data: { status: string; count: number }[];
}

function humanizeStatus(status: string): string {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Explicit color map for each status
const STATUS_COLORS: Record<string, string> = {
  'applied': '#26B9C8',         
  'screened': '#F59E0B',       
  'shortlisted': '#10B981',     
  'video_submitted': '#8B5CF6', 
  'interview_scheduled': '#3B82F6', 
  'interviewed': '#6366F1',    
  'offered': '#F472B6',          
  'hired': '#059669',          
  'rejected_cv': '#EF4444',     
  'rejected_interview': '#DC2626',
  'withdrawn': '#6B7280',      
  'hold': '#D97706',           
};

export default function PipelineBreakdown({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-[var(--color-warm-border)] bg-white p-6">
        <p className="text-sm text-[var(--color-text-subtle)]">No pipeline data available</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: humanizeStatus(item.status),
    value: item.count,
    color: STATUS_COLORS[item.status] || 'var(--color-primary)',
  }));

  return (
    <div className="rounded-2xl border border-[var(--color-warm-border)] bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-[var(--color-secondary)]">Pipeline Breakdown</h3>
      <p className="mb-4 text-sm text-[var(--color-text-muted)]">
        Current status of all processed candidates
      </p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: CHART_COLORS.tooltipBg,
                border: `1px solid ${CHART_COLORS.tooltipBorder}`,
                borderRadius: CHART_STYLES.borderRadius.tooltip,
                fontFamily: CHART_STYLES.fontFamily,
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={10}
              wrapperStyle={{
                fontSize: CHART_STYLES.fontSize.legend,
                paddingTop: '10px',
                fontFamily: CHART_STYLES.fontFamily,
              }}
              formatter={(value: string) => (
                <span style={{ color: CHART_COLORS.axisText }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}