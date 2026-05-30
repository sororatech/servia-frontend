
import type { UserProfile } from '@/types/profile';

export function getInitials(firstName: string, lastName: string): string {
  const first = firstName?.charAt(0) || '';
  const last = lastName?.charAt(0) || '';
  return `${first}${last}`.toUpperCase();
}

export function getFullName(profile: UserProfile): string {
  return `${profile.first_name} ${profile.last_name}`.trim() || 'User';
}

export function formatRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function formatJoinDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}