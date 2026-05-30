'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AUTH_STORAGE } from '@/lib/auth';
import type { UserProfile, ProfileFormData } from '@/types/profile';
import { CanceledError } from 'axios';

export function useProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: '',
    last_name: '',
    email: '',
    location: '',
    department: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\+\d\s\-\(\)]{8,20}$/;
    return phoneRegex.test(phone);
  };
  const validateLocation = (location: string): boolean => {
    return location.trim().length >= 2;
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!formData.first_name.trim()) errors.first_name = 'First name required';
    if (!formData.last_name.trim()) errors.last_name = 'Last name required';
    if (formData.phone && !validatePhone(formData.phone)) errors.phone = 'Invalid phone number (use +, digits, spaces, -, parentheses)';
    if (formData.location && !validateLocation(formData.location)) errors.location = 'Location must be at least 2 characters';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const mapApiResponse = useCallback((data: any): UserProfile => ({
    id: data.id?.toString() || '',
    email: data.email || '',
    first_name: data.first_name || '',
    last_name: data.last_name || '',
    role: (data.user_type || AUTH_STORAGE.getUserRole() || 'candidate') as UserProfile['role'],
    avatar: data.avatar_url || null,
    location: data.location,
    department: data.department,
    phone: data.phone,
    joined_date: data.date_joined,
    applications_count: 0,
    pending_actions: 0,
    managed_jobs: 0,
    total_candidates: 0,
    pending_review: 0,
    isAdmin: data.is_admin === true,
  }), []);

  const fetchProfile = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/users/me/', { signal });
      const mappedProfile = mapApiResponse(response.data);
      
      let finalProfile = { ...mappedProfile };

      if (mappedProfile.role === 'candidate') {
        try {
          const statsRes = await api.get('/candidates/my-applications-stats/', { signal });
          const stats = statsRes.data;
          finalProfile = {
            ...mappedProfile,
            applications_count: stats.total_applications ?? 0,
            pending_actions: stats.pending_actions ?? 0,
          };
        } catch (e) {
          if (e instanceof CanceledError) return;
          console.warn('Failed to fetch candidate stats', e);
        }
      } else if (mappedProfile.role === 'recruiter') {
        try {
          const statsRes = await api.get('/users/recruiters/stats/', { signal });
          const recruiterStats = statsRes.data;
          finalProfile = {
            ...mappedProfile,
            managed_jobs: recruiterStats.total_jobs ?? 0,
            total_candidates: recruiterStats.total_candidates ?? 0,
            pending_review: recruiterStats.pending_review ?? 0,
          };
        } catch (e) {
          if (e instanceof CanceledError) return;
          console.warn('Failed to fetch recruiter stats', e);
        }
      }

      setProfile(finalProfile);
      setFormData({
        first_name: finalProfile.first_name,
        last_name: finalProfile.last_name,
        email: finalProfile.email,
        location: finalProfile.location || '',
        department: finalProfile.department || '',
        phone: finalProfile.phone || '',
      });

      if (finalProfile.avatar) {
        AUTH_STORAGE.setAvatarUrl(finalProfile.avatar);
      } else {
        AUTH_STORAGE.setAvatarUrl(null);
      }
    } catch (err: any) {
      if (err instanceof CanceledError) return;
      console.error('Failed to fetch profile:', err);
      let errorMsg = 'Unable to load profile from server. ';
      if (err.code === 'ERR_NETWORK') errorMsg += 'Check your internet connection.';
      else if (err.response?.status === 401) errorMsg += 'Please log in again.';
      else errorMsg += 'Using local data, but some features may be limited.';
      setError(errorMsg);
      AUTH_STORAGE.setAvatarUrl(null);
      
      const firstName = AUTH_STORAGE.getFirstName() || '';
      const lastName = AUTH_STORAGE.getLastName() || '';
      const email = localStorage.getItem('user_email') || '';
      const role = (AUTH_STORAGE.getUserRole() || 'candidate') as UserProfile['role'];
      setProfile({
        id: localStorage.getItem('user_id') || '',
        email,
        first_name: firstName,
        last_name: lastName,
        role,
        location: '',
        joined_date: new Date().toISOString(),
        applications_count: 0,
        pending_actions: 0,
        managed_jobs: 0,
        total_candidates: 0,
        pending_review: 0,
      });
      setFormData({
        first_name: firstName,
        last_name: lastName,
        email,
        location: '',
        department: '',
        phone: '',
      });
    } finally {
      setLoading(false);
    }
  }, [mapApiResponse]);

  useEffect(() => {
    const abortController = new AbortController();
    fetchProfile(abortController.signal);
    return () => abortController.abort();
  }, [fetchProfile]);

  const handleSave = useCallback(async () => {
    if (!profile) return;
    if (!validateForm()) {
      setError('Please fix the validation errors above.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload: Partial<ProfileFormData> = {};
      if (formData.first_name !== profile.first_name) payload.first_name = formData.first_name;
      if (formData.last_name !== profile.last_name) payload.last_name = formData.last_name;
      if (formData.location !== (profile.location || '')) payload.location = formData.location;
      if (formData.department !== (profile.department || '')) payload.department = formData.department;
      if (formData.phone !== (profile.phone || '')) payload.phone = formData.phone;

      if (Object.keys(payload).length > 0) {
        await api.patch('/users/me/', payload);
      }
      await fetchProfile();
      setIsEditing(false);
      setValidationErrors({});
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Failed to save changes.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }, [formData, profile, fetchProfile]);

  const changePassword = useCallback(async (oldPassword: string, newPassword1: string, newPassword2: string) => {
    try {
      await api.post('/users/change-password/', {
        old_password: oldPassword,
        new_password1: newPassword1,
        new_password2: newPassword2,
      });
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Failed to change password';
      return { success: false, error: msg };
    }
  }, []);

  const uploadAvatar = useCallback(async (file: File) => {
    setUploadingAvatar(true);
    setAvatarError(null);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const { data: urlData } = await api.post('/users/avatar/upload-url/', { file_extension: ext });
      await fetch(urlData.upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': urlData.content_type },
        body: file,
      });
      await api.post('/users/avatar/confirm/', { file_key: urlData.file_key });
      await fetchProfile();
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setAvatarError('Failed to upload avatar. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  }, [fetchProfile]);

  const handleLogout = useCallback(() => {
    AUTH_STORAGE.clear();
    router.push('/login');
    router.refresh();
  }, [router]);

  const toggleEdit = useCallback(() => {
    if (isEditing && profile) {
      setFormData({
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        location: profile.location || '',
        department: profile.department || '',
        phone: profile.phone || '',
      });
      setValidationErrors({});
    }
    setIsEditing(prev => !prev);
  }, [isEditing, profile]);

  const updateFormData = useCallback((field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [validationErrors]);

  return {
    profile,
    formData,
    loading,
    saving,
    error,
    isEditing,
    validationErrors,
    uploadAvatar,
    uploadingAvatar,
    avatarError,
    handleSave,
    handleLogout,
    toggleEdit,
    updateFormData,
    changePassword,
    refresh: fetchProfile,
  };
}