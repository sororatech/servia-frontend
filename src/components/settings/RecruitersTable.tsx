'use client';

import { useState } from 'react';
import { Recruiter } from '@/types/settings';
import EditRecruiterModal from './EditRecruiterModal';
import { SearchInput } from '@/components/ui/SearchInput';
import { Badge } from '@/components/ui/budge';
import { deleteRecruiter, toggleRecruiterStatus } from '@/app/settings/actions';

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
  const [editingRecruiter, setEditingRecruiter] = useState<Recruiter | null>(null);

  const filteredRecruiters = recruiters.filter(r => {
    const firstName = r.user?.first_name?.toLowerCase() || '';
    const lastName = r.user?.last_name?.toLowerCase() || '';
    const email = r.user?.email?.toLowerCase() || '';
    const role = r.role?.toLowerCase() || '';
    
    const searchLower = search.toLowerCase().trim();
    
    const matchesSearch = !searchLower || 
      firstName.includes(searchLower) ||
      lastName.includes(searchLower) ||
      email.includes(searchLower);
    
    const matchesRole = !filterRole || role === filterRole.toLowerCase();
    
    const matchesStatus = !filterStatus || 
      (filterStatus === 'active' && r.is_active) ||
      (filterStatus === 'disabled' && !r.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleToggleStatus = async (recruiter: Recruiter) => {
    const name = recruiter.user?.first_name || 'Recruiter';
    if (!confirm(`Are you sure you want to ${recruiter.is_active ? 'disable' : 'enable'} ${name}?`)) return;
    
    const result = await toggleRecruiterStatus(recruiter.id, !recruiter.is_active);
    if (result.success && result.data) {
      onUpdated(result.data);
    }
  };

  const handleDelete = async (recruiter: Recruiter) => {
    const name = recruiter.user?.first_name || 'Recruiter';
    if (!confirm(`Delete ${name}?`)) return;
    
    const result = await deleteRecruiter(recruiter.id);
    if (result.success) {
      onDeleted(recruiter.id);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setFilterRole('');
    setFilterStatus('');
  };

  const hasActiveFilters = search || filterRole || filterStatus;

  return (
    <div className="rounded-2xl border border-black/10 bg-white/85 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <SearchInput 
          placeholder="Search by name or email..." 
          onSearch={(value) => setSearch(value)}
          className="sm:col-span-1" 
        />
        <select 
          value={filterRole} 
          onChange={(e) => setFilterRole(e.target.value)} 
          className="rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[#26b9c8]"
        >
          <option value="">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Recruiter">Recruiter</option>
        </select>
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)} 
          className="rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[#26b9c8]"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button 
          onClick={clearFilters}
          className="mb-4 text-sm text-[#26b9c8] hover:underline"
        >
          Clear all filters
        </button>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/10">
              <th className="px-4 py-3 text-left text-sm font-medium text-[#7e756f]">Recruiter</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#7e756f]">Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#7e756f]">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#7e756f]">Last Login</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#7e756f]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {filteredRecruiters.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  {hasActiveFilters 
                    ? 'No recruiters match your filters. Try clearing them.' 
                    : 'No recruiters found'}
                </td>
              </tr>
            ) : (
              filteredRecruiters.map((r) => {
                const firstName = r.user?.first_name || '';
                const lastName = r.user?.last_name || '';
                const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'R';
                
                return (
                  <tr key={r.id} className="hover:bg-black/[0.02]">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#26b9c8] to-[#1a9aa8] text-white flex items-center justify-center text-sm font-semibold">
                          {initials}
                        </div>
                        <div>
                          <p className="font-medium text-[#171717]">{firstName} {lastName}</p>
                          <p className="text-sm text-[#7e756f]">{r.user?.email || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={r.role?.toLowerCase() === 'admin' ? 'secondary' : 'default'}>
                        {r.role || 'Recruiter'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={r.is_active ? 'success' : 'destructive'}>
                        {r.is_active ? 'Active' : 'Disabled'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#635b55]">
                      {r.last_login ? new Date(r.last_login).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setEditingRecruiter(r)} 
                          className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(r)} 
                          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                            r.is_active 
                              ? 'text-amber-600 hover:bg-amber-50' 
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {r.is_active ? 'Disable' : 'Enable'}
                        </button>
                        <button 
                          onClick={() => handleDelete(r)} 
                          className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {editingRecruiter && (
        <EditRecruiterModal 
          recruiter={editingRecruiter} 
          onClose={() => setEditingRecruiter(null)} 
          onUpdated={(u) => { 
            onUpdated(u); 
            setEditingRecruiter(null); 
          }} 
        />
      )}
    </div>
  );
}