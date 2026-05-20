// src/components/settings/EditRecruiterModal.tsx
'use client';

import { useState } from 'react';
import { Recruiter } from '@/types/settings';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { updateRecruiter } from '@/app/settings/actions';

export default function EditRecruiterModal({ recruiter, onClose, onUpdated }: { recruiter: Recruiter; onClose: () => void; onUpdated: (r: Recruiter) => void }) {
  const [formData, setFormData] = useState({ department: recruiter.department || '', role: recruiter.role });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await updateRecruiter(recruiter.id, formData);
      if (result.success && result.data) {
        onUpdated(result.data);
        onClose();
      }
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Edit Recruiter">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Department</Label>
          <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[#26b9c8]">
            <option value="Engineering">Engineering</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
            <option value="HR">HR</option>
          </select>
        </div>
        <div>
          <Label>Role</Label>
          <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})} className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[#26b9c8]">
            <option value="Recruiter">Recruiter</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" disabled={isLoading} className="flex-1">{isLoading ? 'Saving...' : 'Save'}</Button>
        </div>
      </form>
    </Modal>
  );
}