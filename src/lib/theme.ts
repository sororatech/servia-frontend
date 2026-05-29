
export const CHART_COLORS = {
  primary: '#26B9C8',      
  primaryDark: '#14b8a6',  
  secondary: '#3b82f6',    
  
  shortlisted: '#26B9C8',  
  interviewed: '#1e3a8a',  
  hired: '#d97706',        
  rejected: '#dc2626',     
  applied: '#6b7280',      
  
  gridLine: '#e5e7eb',     
  axisText: '#374151',     
  axisLine: '#1a1a1a',     
  tooltipBg: '#ffffff',    
  tooltipBorder: '#d1d5db',
  
  chartBg: '#faf8f5',      
  cardBg: '#ffffff',       
};

export const CHART_STYLES = {
  fontFamily: 'var(--font-lexend), system-ui, sans-serif',
  fontSize: {
    axis: 11,
    tooltip: 12,
    legend: 12,
  },
  strokeWidth: {
    axis: 1.5,
    line: 2,
    bar: 0,
  },
  borderRadius: {
    card: '0.75rem', 
    tooltip: '0.25rem',
  },
};

export const getStatusColor = (status: string): string => {
  const lower = status.toLowerCase();
  if (lower.includes('short')) return CHART_COLORS.shortlisted;
  if (lower.includes('interview')) return CHART_COLORS.interviewed;
  if (lower.includes('hire') || lower.includes('offer')) return CHART_COLORS.hired;
  if (lower.includes('reject')) return CHART_COLORS.rejected;
  if (lower.includes('applied')) return CHART_COLORS.applied;
   if (lower.includes('short') || lower.includes('selected')) return CHART_COLORS.shortlisted;
  if (lower.includes('interview') || lower.includes('screening')) return CHART_COLORS.interviewed;
  if (lower.includes('hire') || lower.includes('offer') || lower.includes('accepted')) return CHART_COLORS.hired;
  if (lower.includes('reject') || lower.includes('declined')) return CHART_COLORS.rejected;
  if (lower.includes('applied') || lower.includes('new')) return CHART_COLORS.applied;
  if (lower.includes('complet') || lower.includes('done') || lower.includes('finished')) return '#10b981'; 
  if (lower.includes('schedul') || lower.includes('pending') || lower.includes('upcoming')) return '#f59e0b';
  if (lower.includes('process') || lower.includes('review')) return '#8b5cf6'; 
  if (lower.includes('wait') || lower.includes('hold')) return '#6b7280'; 
  return CHART_COLORS.primary;
};