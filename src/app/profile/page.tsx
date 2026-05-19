'use client';

import { useRef, useState } from 'react';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useProfile } from '@/hooks/useProfile';
import { getInitials, getFullName, formatRole, formatJoinDate } from '@/utils/profile';
import { 
  User, Mail, MapPin, Shield, Save, Briefcase, 
  Calendar, Edit2, LogOut, Bell, Key, ChevronRight, Phone, X,
  FileText, Users, Clock
} from 'lucide-react';


export default function ProfilePage() {
  const { 
    profile, formData, loading, saving, error, isEditing, validationErrors,
    uploadAvatar, uploadingAvatar, avatarError,
    handleSave, handleLogout, toggleEdit, updateFormData, changePassword, refresh
  } = useProfile();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword1, setNewPassword1] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <main className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full">
          <div className="space-y-4">
            <LoadingSkeleton variant="card" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LoadingSkeleton variant="card" />
              <LoadingSkeleton variant="card" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-2xl font-bold">!</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to load profile</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => refresh()} variant="secondary">Retry</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) return null;

  const isCandidate = profile.role === 'candidate';
  const fullName = getFullName(profile);
  const initials = getInitials(profile.first_name, profile.last_name);

  const handlePasswordSubmit = async () => {
    setPasswordError(null);
    if (!oldPassword || !newPassword1 || !newPassword2) {
      setPasswordError('All fields are required');
      return;
    }
    if (newPassword1 !== newPassword2) {
      setPasswordError('New passwords do not match');
      return;
    }
    setChangingPassword(true);
    const result = await changePassword(oldPassword, newPassword1, newPassword2);
    setChangingPassword(false);
    if (result.success) {
      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword1('');
      setNewPassword2('');
    } else {
      setPasswordError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      
      <main className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-secondary)]">
            {isCandidate ? 'My Profile' : 'Recruiter Profile'}
          </h1>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <Button variant="ghost" onClick={toggleEdit}>Cancel</Button>
                <Button variant="primary" onClick={handleSave} isLoading={saving}>
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
              </>
            ) : (
              <Button variant="secondary" onClick={toggleEdit}>
                <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border-2 border-[var(--color-primary)] overflow-hidden">
                {profile.avatar ? (
                  <Image
                    src={profile.avatar}
                    alt={fullName}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-3xl font-bold text-[var(--color-secondary)]">
                    {initials}
                  </div>
                )}
              </div>
              {isEditing && (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={(e) => {
                      if (e.target.files?.[0]) uploadAvatar(e.target.files[0]);
                    }}
                    className="hidden"
                  />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center"
            disabled={uploadingAvatar}
          >
            {uploadingAvatar ? (
              <div className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Edit2 className="w-4 h-4 text-[var(--color-primary)]" />
            )}
          </button>
                          </>
              )}
              {avatarError && <p className="text-red-500 text-xs mt-2 text-center">{avatarError}</p>}
            </div>

            <div className="text-center sm:text-left flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input 
                        type="text" 
                        value={formData.first_name} 
                        onChange={(e) => updateFormData('first_name', e.target.value)} 
                        className={`w-full px-4 py-2 border ${validationErrors.first_name ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]`} 
                        placeholder="First name" 
                      />
                      {validationErrors.first_name && <p className="text-red-500 text-xs mt-1">{validationErrors.first_name}</p>}
                    </div>
                    <div>
                      <input 
                        type="text" 
                        value={formData.last_name} 
                        onChange={(e) => updateFormData('last_name', e.target.value)} 
                        className={`w-full px-4 py-2 border ${validationErrors.last_name ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]`} 
                        placeholder="Last name" 
                      />
                      {validationErrors.last_name && <p className="text-red-500 text-xs mt-1">{validationErrors.last_name}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input 
                        type="text" 
                        value={formData.location} 
                        onChange={(e) => updateFormData('location', e.target.value)} 
                        className={`w-full px-4 py-2 border ${validationErrors.location ? 'border-red-500' : 'border-gray-200'} rounded-lg`} 
                        placeholder="Location (city, country)" 
                      />
                      {validationErrors.location && <p className="text-red-500 text-xs mt-1">{validationErrors.location}</p>}
                    </div>
                    <div>
                      <input 
                        type="tel" 
                        value={formData.phone} 
                        onChange={(e) => updateFormData('phone', e.target.value)} 
                        className={`w-full px-4 py-2 border ${validationErrors.phone ? 'border-red-500' : 'border-gray-200'} rounded-lg`} 
                        placeholder="Phone number" 
                      />
                      {validationErrors.phone && <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>}
                    </div>
                  </div>
                  {!isCandidate && (
                    <input 
                      type="text" 
                      value={formData.department} 
                      onChange={(e) => updateFormData('department', e.target.value)} 
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg" 
                      placeholder="Department" 
                    />
                  )}
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900">{fullName}</h2>
                  <p className="text-gray-500 mt-1 flex items-center justify-center sm:justify-start gap-2">
                    <Mail className="w-4 h-4" /> {profile.email}
                  </p>
                  {profile.phone && (
                    <p className="text-gray-500 mt-1 flex items-center justify-center sm:justify-start gap-2">
                      <Phone className="w-4 h-4" /> {profile.phone}
                    </p>
                  )}
                  <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> {profile.isAdmin ? 'Admin' : formatRole(profile.role)}</span>
                    {profile.department && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {profile.department}</span>
                      </>
                    )}
                    {profile.location && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.location}</span>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {isCandidate && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><FileText className="w-6 h-6" /></div>
                <h4 className="font-bold text-gray-900">Total Applications</h4>
              </div>
              <p className="text-3xl font-bold text-[var(--color-primary)]">{profile.applications_count || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Jobs youve applied to</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-50 rounded-xl text-green-600"><Users className="w-6 h-6" /></div>
                <h4 className="font-bold text-gray-900">Pending Actions</h4>
              </div>
              <p className="text-3xl font-bold text-green-600">
                  {profile.pending_actions || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">CV upload pending</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><Clock className="w-6 h-6" /></div>
                <h4 className="font-bold text-gray-900">Member Since</h4>
              </div>
              <p className="text-lg font-semibold text-gray-900">{formatJoinDate(profile.joined_date)}</p>
              <p className="text-xs text-gray-500 mt-1">Active member</p>
            </div>
          </div>
        )}

      {!isCandidate && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Briefcase className="w-6 h-6" /></div>
              <h4 className="font-bold text-gray-900">Jobs Posted</h4>
            </div>
            <p className="text-3xl font-bold text-[var(--color-primary)]">{profile.managed_jobs || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Active job postings</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-50 rounded-xl text-green-600"><Users className="w-6 h-6" /></div>
              <h4 className="font-bold text-gray-900">Total Candidates</h4>
            </div>
            <p className="text-3xl font-bold text-green-600">{profile.total_candidates || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Applied to your jobs</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><Clock className="w-6 h-6" /></div>
              <h4 className="font-bold text-gray-900">Pending Review</h4>
            </div>
            <p className="text-3xl font-bold text-purple-600">{profile.pending_review || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Candidates waiting for action</p>
          </div>
        </div>
      )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[var(--color-primary)]" /> Account Settings
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            <button className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-xl"><Bell className="w-5 h-5 text-gray-600" /></div>
                <div className="text-left"><p className="font-medium text-gray-900">Email Preferences</p><p className="text-sm text-gray-500">Manage notification settings</p></div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-xl"><Key className="w-5 h-5 text-gray-600" /></div>
                <div className="text-left"><p className="font-medium text-gray-900">Security & Password</p><p className="text-sm text-gray-500">Update your password</p></div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </main>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input 
                  type="password" 
                  value={oldPassword} 
                  onChange={(e) => setOldPassword(e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input 
                  type="password" 
                  value={newPassword1} 
                  onChange={(e) => setNewPassword1(e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input 
                  type="password" 
                  value={newPassword2} 
                  onChange={(e) => setNewPassword2(e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]" 
                />
              </div>
              {passwordError && (
                <div className="text-red-600 text-sm">{passwordError}</div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="ghost" onClick={() => setShowPasswordModal(false)} className="flex-1">Cancel</Button>
              <Button 
                variant="primary" 
                onClick={handlePasswordSubmit} 
                isLoading={changingPassword}
                className="flex-1"
              >
                Update Password
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}