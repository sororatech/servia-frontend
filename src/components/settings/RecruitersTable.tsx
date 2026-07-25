'use client';

import { useState, useRef, useEffect } from 'react';
import { Recruiter } from '@/types/settings';
import { SearchInput } from '@/components/ui/SearchInput';
import { updateRecruiter, deleteRecruiter } from '@/app/settings/actions';

function EditableCell({
  value,
  options,
  onSave,
  variant = 'default'
}: {
  value: string;
  options: { label: string; value: string; danger?: boolean }[];
  onSave: (newValue: string) => void;
  variant?: 'default' | 'status' | 'role';
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const availableOptions = options.filter(o => o.value !== value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newValue: string) => {
    onSave(newValue);
    setIsOpen(false);
  };

  const getBadgeStyles = () => {
    if (variant === 'role') {
      return value.toLowerCase() === 'admin'
        ? 'bg-[var(--color-status-info-bg)] text-[var(--color-status-info-text)] border-[var(--color-status-info-border)]'
        : 'bg-[var(--color-warm-surface)] dark:bg-[var(--color-warm-bg-deep)] text-[var(--color-text-muted)] border-[var(--color-warm-border)]';
    }
    if (variant === 'status') {
      return value === 'active'
        ? 'bg-[var(--color-status-active-bg)] text-[var(--color-status-active-text)] border-[var(--color-status-active-border)]'
        : value === 'disabled'
          ? 'bg-[var(--color-status-error-bg)] text-[var(--color-status-error-text)] border-[var(--color-status-error-border)]'
          : 'bg-[var(--color-warm-surface)] dark:bg-[var(--color-warm-bg-deep)] text-[var(--color-text-muted)] border-[var(--color-warm-border)]';
    }
    return 'bg-[var(--color-warm-surface)] dark:bg-[var(--color-warm-bg-deep)] text-[var(--color-text-muted)] border-[var(--color-warm-border)]';
  };

  return (
    <div className="relative inline-block min-w-[80px]" ref={dropdownRef}>
      <span
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex cursor-pointer items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all hover:shadow-md active:scale-95 ${getBadgeStyles()}`}
      >
        {value === 'active' ? 'Active' : value === 'disabled' ? 'Disabled' : value}
        <svg className="ml-1.5 h-3.5 w-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </span>

      {isOpen && availableOptions.length > 0 && (
        <div className="absolute left-0 top-full mt-1 z-50 min-w-[120px] rounded-lg border border-[var(--color-warm-border)] bg-white dark:bg-[var(--color-warm-surface)] py-1 shadow-lg">
          {availableOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`w-full px-4 py-2 text-left text-xs font-medium transition-colors hover:bg-[var(--color-warm-bg-page)] dark:hover:bg-[var(--color-warm-bg-deep)] ${
                opt.danger ? 'text-[var(--color-status-error-text)]' : 'text-[var(--color-foreground)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const normalizeRole = (role: string | undefined): string => {
  if (!role) return 'Recruiter';
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};

export default function RecruitersTable({
  recruiters = [],
  onUpdated,
  onDeleted,
}: {
  recruiters?: Recruiter[];
  onUpdated: (recruiter: Recruiter) => void;
  onDeleted: (id: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const filteredRecruiters = recruiters.filter(r => {
    const firstName = r.user?.first_name?.toLowerCase() || '';
    const lastName = r.user?.last_name?.toLowerCase() || '';
    const email = r.user?.email?.toLowerCase() || '';
    const role = r.role?.toLowerCase() || '';
    
    const searchLower = search.toLowerCase().trim();
    const matchesSearch = !searchLower || firstName.includes(searchLower) || lastName.includes(searchLower) || email.includes(searchLower);
    const matchesRole = !filterRole || role === filterRole.toLowerCase();
    const matchesStatus = !filterStatus || (filterStatus === 'active' && r.is_active) || (filterStatus === 'disabled' && !r.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleRoleUpdate = async (id: string, newRole: string) => {
    setIsLoading(id);
    try {
      const result = await updateRecruiter(id, { role: newRole.toLowerCase() });
      if (result.success && result.data) onUpdated(result.data);
    } finally {
      setIsLoading(null);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    if (newStatus === 'delete') {
      if (!confirm('Are you sure you want to delete this recruiter?')) return;
      setIsLoading(id);
      try {
        const result = await deleteRecruiter(id);
        if (result.success) onDeleted(id);
      } finally {
        setIsLoading(null);
      }
    } else {
      setIsLoading(id);
      try {
        const result = await updateRecruiter(id, { is_active: newStatus === 'active' });
        if (result.success && result.data) onUpdated(result.data);
      } finally {
        setIsLoading(null);
      }
    }
  };

  const clearFilters = () => { setSearch(''); setFilterRole(''); setFilterStatus(''); };
  const hasActiveFilters = search || filterRole || filterStatus;

  return (
    <div className="rounded-2xl border border-[var(--color-warm-border)] bg-white dark:bg-[var(--color-warm-surface)] p-6 shadow-sm">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <SearchInput placeholder="Search by name or email..." onSearch={(value) => setSearch(value)} className="sm:col-span-1" />
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="rounded-xl border border-[var(--color-warm-border)] bg-white dark:bg-[var(--color-warm-bg-deep)] text-[var(--color-foreground)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]">
          <option value="">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Recruiter">Recruiter</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-xl border border-[var(--color-warm-border)] bg-white dark:bg-[var(--color-warm-bg-deep)] text-[var(--color-foreground)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button onClick={clearFilters} className="mb-4 text-sm text-[var(--color-primary)] hover:underline">Clear all filters</button>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-warm-border)]">
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-muted)]">Recruiter</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-muted)]">Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-muted)]">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-muted)]">Last Login</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-warm-border)]">
            {filteredRecruiters.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[var(--color-text-muted)]">
                  {hasActiveFilters ? 'No recruiters match your filters. Try clearing them.' : 'No recruiters found'}
                </td>
              </tr>
            ) : (
              filteredRecruiters.map((r) => {
                const firstName = r.user?.first_name || '';
                const lastName = r.user?.last_name || '';
                const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'R';
                const isRowLoading = isLoading === r.id;

                return (
                  <tr key={r.id} className="hover:bg-[var(--color-warm-bg-page)] dark:hover:bg-[var(--color-warm-bg-deep)] transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-5">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] text-white flex items-center justify-center text-xl font-bold shadow-sm">
                          {initials}
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--color-foreground)] text-base">{firstName} {lastName}</p>
                          <p className="text-sm text-[var(--color-text-muted)]">{r.user?.email || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className={isRowLoading ? 'opacity-50 pointer-events-none' : ''}>
                        <EditableCell value={normalizeRole(r.role)} variant="role" options={[{ label: 'Admin', value: 'Admin' }, { label: 'Recruiter', value: 'Recruiter' }]} onSave={(newRole) => handleRoleUpdate(r.id, newRole)} />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className={isRowLoading ? 'opacity-50 pointer-events-none' : ''}>
                        <EditableCell value={r.is_active ? 'active' : 'disabled'} variant="status" options={[{ label: 'Active', value: 'active' }, { label: 'Disabled', value: 'disabled' }, { label: 'Delete', value: 'delete', danger: true }]} onSave={(newStatus) => handleStatusUpdate(r.id, newStatus)} />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[var(--color-text-muted)]">
                      {r.last_login ? new Date(r.last_login).toLocaleDateString() : 'Never'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}