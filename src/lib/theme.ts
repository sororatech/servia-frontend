// src/lib/theme.ts - Centralized design tokens for charts and UI

export const CHART_COLORS = {
  // Primary brand colors (match globals.css)
  primary: '#26B9C8',      // Teal - main accent
  primaryDark: '#14b8a6',  // Darker teal for hover/states
  secondary: '#3b82f6',    // Blue - secondary accent
  
  // Status colors (pipeline)
  shortlisted: '#26B9C8',  // Teal
  interviewed: '#1e3a8a',  // Dark blue
  hired: '#d97706',        // Amber/orange
  rejected: '#dc2626',     // Red
  applied: '#6b7280',      // Gray
  
  // Chart utilities
  gridLine: '#e5e7eb',     // Light gray grid
  axisText: '#374151',     // Dark gray text
  axisLine: '#1a1a1a',     // Black axes
  tooltipBg: '#ffffff',    // White tooltip
  tooltipBorder: '#d1d5db',// Gray tooltip border
  
  // Backgrounds
  chartBg: '#faf8f5',      // Cream chart background
  cardBg: '#ffffff',       // White card background
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
    card: '0.75rem', // rounded-xl
    tooltip: '0.25rem',
  },
};

// Helper to get status color dynamically
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
  if (lower.includes('complet') || lower.includes('done') || lower.includes('finished')) return '#10b981'; // Green
  if (lower.includes('schedul') || lower.includes('pending') || lower.includes('upcoming')) return '#f59e0b'; // Amber
  if (lower.includes('process') || lower.includes('review')) return '#8b5cf6'; // Purple
  if (lower.includes('wait') || lower.includes('hold')) return '#6b7280'; // Gray
  return CHART_COLORS.primary;
};