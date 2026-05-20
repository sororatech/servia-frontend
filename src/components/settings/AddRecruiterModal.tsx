// src/components/settings/AddRecruiterModal.tsx
'use client';

import { useState } from 'react';
import { Recruiter } from '@/types/settings';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { createRecruiter } from '@/app/settings/actions';

export default function AddRecruiterModal({ onClose, onAdded }: { onClose: () => void; onAdded: (recruiter: Recruiter) => void }) {
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', password: '', department: '', role: 'Recruiter' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.first_name) e.first_name = 'Required';
    if (!formData.last_name) e.last_name = 'Required';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Invalid email';
    if (!formData.password || formData.password.length < 6) e.password = 'Min 6 chars';
    if (!formData.department) e.department = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const result = await createRecruiter(formData);
      if (result.success && result.data) {
        onAdded(result.data);
      } else {
        setErrors({ api: result.error || 'Failed to create' });
      }
    } catch (error) {
      setErrors({ api: 'An error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Add New Recruiter">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>First Name *</Label>
            <input type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[#26b9c8]" />
            {errors.first_name && <p className="text-xs text-red-500">{errors.first_name}</p>}
          </div>
          <div>
            <Label>Last Name *</Label>
            <input type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[#26b9c8]" />
            {errors.last_name && <p className="text-xs text-red-500">{errors.last_name}</p>}
          </div>
        </div>
        <div>
          <Label>Email *</Label>
          <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[#26b9c8]" />
          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
        </div>
        <div>
          <Label>Password *</Label>
          <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[#26b9c8]" />
          {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
        </div>
        <div>
          <Label>Department *</Label>
          <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[#26b9c8]">
            <option value="">Select...</option>
            <option value="Engineering">Engineering</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
          </select>
          {errors.department && <p className="text-xs text-red-500">{errors.department}</p>}
        </div>
        {errors.api && <p className="text-sm text-red-500">{errors.api}</p>}
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" disabled={isLoading} className="flex-1">{isLoading ? 'Creating...' : 'Add Recruiter'}</Button>
        </div>
      </form>
    </Modal>
  );
}