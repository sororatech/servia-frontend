const ALLOWED_HOSTS = new Set(['meet.google.com', 'calendar.app.google']);

export const MEETING_LINK_INPUT_PATTERN =
  'https\\://(meet\\.google\\.com|calendar\\.app\\.google)/.+';

export const MEETING_LINK_PLACEHOLDER = 'https://meet.google.com/abc-defg-hij';

export const MEETING_LINK_HELP =
  'Use a direct Google Meet link (meet.google.com/...) for the bot. Calendar appointment links (calendar.app.google/...) may not join reliably.';

export function isValidMeetingLink(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === 'https:' && ALLOWED_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}
