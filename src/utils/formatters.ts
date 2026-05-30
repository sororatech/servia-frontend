export function humanize(value: string): string {
  return value
    .split('_')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

export function formatDate(
  timestamp: string,
  options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' },
): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return new Intl.DateTimeFormat('en-US', options).format(date);
}
