'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CHART_COLORS, CHART_STYLES, getStatusColor } from '@/lib/theme';

interface Props {
  data: { status: string; count: number }[];
}

export default function PipelineBreakdown({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[var(--color-chart-bg,#faf8f5)] rounded-lg shadow-md border border-gray-200 p-6 h-full flex items-center justify-center">
        <p className="text-gray-400 text-sm">No pipeline data available</p>
      </div>
    );
  }

  const chartData = data.map(item => {
    const displayName = item.status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    return {
      name: displayName,
      value: item.count,
      color: getStatusColor(item.status),
    };
  });

  return (
    <div 
      data-chart="pipeline" 
      className="bg-[var(--color-chart-bg,#faf8f5)] rounded-lg shadow-md border border-gray-200 p-6 h-full"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Pipeline Breakdown</h3>
      <p className="text-sm text-gray-500 mb-4">Current status of all processed candidates</p>
      
      <ResponsiveContainer width="100%" height={260}>
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
            strokeWidth={0} 
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
  );
}