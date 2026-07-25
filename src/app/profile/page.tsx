'use client';

import { useRef, useState, useEffect } from 'react';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useProfile } from '@/hooks/useProfile';
import { getInitials, getFullName, formatRole, formatJoinDate } from '@/utils/profile';
import { 
  User, Mail, MapPin, Shield, Save, Briefcase, 
  Calendar, Edit2, LogOut, Bell, Key, ChevronRight, Phone, X,
  FileText, Users, Clock, Eye, EyeOff, Lock
} from 'lucide-react';

interface PasswordReqs {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

const getPasswordRequirements = (password: string): PasswordReqs => ({
  length: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /[0-9]/.test(password),
  special: /[^A-Za-z0-9]/.test(password),
});

const getPasswordStrength = (password: string) => {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return { message: 'Weak', color: 'text-[var(--color-status-error-text)]' };
  if (score <= 4) return { message: 'Medium', color: 'text-[var(--color-status-warning-text)]' };
  return { message: 'Strong', color: 'text-[var(--color-status-active-text)]' };
};

interface NotificationPrefs {
  shortlisted: boolean;
  statusChange: boolean;
  interview: boolean;
  marketing: boolean;
}

export default function ProfilePage() {
  const { 
    profile, formData, loading, saving, error, isEditing, validationErrors,
    uploadAvatar, uploadingAvatar, avatarError,
    handleSave, handleLogout, toggleEdit, updateFormData, changePassword, refresh
  } = useProfile();

  // Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword1, setNewPassword1] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [touchedPasswords, setTouchedPasswords] = useState({ new: false, confirm: false });

  // Notification modal state
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(() => {
    if (typeof window === 'undefined') {
      return { shortlisted: true, statusChange: true, interview: true, marketing: false };
    }
    try {
      const saved = localStorage.getItem('notification_prefs');
      if (saved) return JSON.parse(saved) as NotificationPrefs;
    } catch (e) {}
    return { shortlisted: true, statusChange: true, interview: true, marketing: false };
  });
  const [savingNotif, setSavingNotif] = useState(false);
  const [notifSaveSuccess, setNotifSaveSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-background)] dark:bg-[var(--color-warm-bg-deep)]">
        <main className="flex-1 max-w-[1440px] mx-auto px-4 py-10 w-full">
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
      <div className="min-h-screen flex flex-col bg-[var(--color-background)] dark:bg-[var(--color-warm-bg-deep)]">
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-[var(--color-status-error-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-[var(--color-status-error-text)] text-2xl font-bold">!</span>
            </div>
            <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-2">Unable to load profile</h3>
            <p className="text-[var(--color-text-muted)] mb-6">{error}</p>
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

  const validateNewPassword = () => {
    const reqs = getPasswordRequirements(newPassword1);
    if (!newPassword1) return 'New password is required';
    if (!reqs.length) return 'Password must be at least 8 characters';
    if (!reqs.uppercase) return 'Password must contain at least one uppercase letter';
    if (!reqs.lowercase) return 'Password must contain at least one lowercase letter';
    if (!reqs.number) return 'Password must contain at least one number';
    if (!reqs.special) return 'Password must contain at least one special character';
    return null;
  };

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
    const pwdError = validateNewPassword();
    if (pwdError) {
      setPasswordError(pwdError);
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
      setTouchedPasswords({ new: false, confirm: false });
    } else {
      setPasswordError(result.error);
    }
  };

  const saveNotificationPrefs = async () => {
    setSavingNotif(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.setItem('notification_prefs', JSON.stringify(notificationPrefs));
    setNotifSaveSuccess(true);
    setTimeout(() => setNotifSaveSuccess(false), 2000);
    setSavingNotif(false);
  };

  const passwordReqs = getPasswordRequirements(newPassword1);
  const passwordStrength = newPassword1 ? getPasswordStrength(newPassword1) : null;

  const profileContent = (
    <>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-[var(--color-foreground)]">
          {isCandidate ? 'My Profile' : 'Recruiter Profile'}
        </h2>
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
      <div className="bg-white dark:bg-[var(--color-warm-surface)] rounded-3xl border border-[var(--color-warm-border)] shadow-sm p-8 mb-6 transition-colors">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border-2 border-[var(--color-primary)] overflow-hidden">
              {profile.avatar ? (
                <Image src={profile.avatar} alt={fullName} fill className="object-cover" priority />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-3xl font-bold text-[var(--color-foreground)]">
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
                  onChange={(e) => { if (e.target.files?.[0]) uploadAvatar(e.target.files[0]); }}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-white dark:bg-[var(--color-warm-surface)] rounded-full shadow-md border border-[var(--color-warm-border)] hover:bg-[var(--color-warm-bg-page)] dark:hover:bg-[var(--color-warm-bg-deep)] transition-colors flex items-center justify-center"
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
            {avatarError && <p className="text-[var(--color-status-error-text)] text-xs mt-2 text-center">{avatarError}</p>}
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
                      className={`w-full px-4 py-2 border ${validationErrors.first_name ? 'border-[var(--color-status-error-text)]' : 'border-[var(--color-warm-border-light)] dark:border-[var(--color-warm-border)]'} bg-white dark:bg-[var(--color-warm-bg-deep)] text-[var(--color-foreground)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition`} 
                      placeholder="First name" 
                    />
                    {validationErrors.first_name && <p className="text-[var(--color-status-error-text)] text-xs mt-1">{validationErrors.first_name}</p>}
                  </div>
                  <div>
                    <input 
                      type="text" 
                      value={formData.last_name} 
                      onChange={(e) => updateFormData('last_name', e.target.value)} 
                      className={`w-full px-4 py-2 border ${validationErrors.last_name ? 'border-[var(--color-status-error-text)]' : 'border-[var(--color-warm-border-light)] dark:border-[var(--color-warm-border)]'} bg-white dark:bg-[var(--color-warm-bg-deep)] text-[var(--color-foreground)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition`} 
                      placeholder="Last name" 
                    />
                    {validationErrors.last_name && <p className="text-[var(--color-status-error-text)] text-xs mt-1">{validationErrors.last_name}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input 
                      type="text" 
                      value={formData.location} 
                      onChange={(e) => updateFormData('location', e.target.value)} 
                      className={`w-full px-4 py-2 border ${validationErrors.location ? 'border-[var(--color-status-error-text)]' : 'border-[var(--color-warm-border-light)] dark:border-[var(--color-warm-border)]'} bg-white dark:bg-[var(--color-warm-bg-deep)] text-[var(--color-foreground)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition`} 
                      placeholder="Location (city, country)" 
                    />
                    {validationErrors.location && <p className="text-[var(--color-status-error-text)] text-xs mt-1">{validationErrors.location}</p>}
                  </div>
                  <div>
                    <input 
                      type="tel" 
                      value={formData.phone} 
                      onChange={(e) => updateFormData('phone', e.target.value)} 
                      className={`w-full px-4 py-2 border ${validationErrors.phone ? 'border-[var(--color-status-error-text)]' : 'border-[var(--color-warm-border-light)] dark:border-[var(--color-warm-border)]'} bg-white dark:bg-[var(--color-warm-bg-deep)] text-[var(--color-foreground)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition`} 
                      placeholder="Phone number" 
                    />
                    {validationErrors.phone && <p className="text-[var(--color-status-error-text)] text-xs mt-1">{validationErrors.phone}</p>}
                  </div>
                </div>
                {!isCandidate && (
                  <input 
                    type="text" 
                    value={formData.department} 
                    onChange={(e) => updateFormData('department', e.target.value)} 
                    className="w-full px-4 py-2 border border-[var(--color-warm-border-light)] dark:border-[var(--color-warm-border)] bg-white dark:bg-[var(--color-warm-bg-deep)] text-[var(--color-foreground)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition" 
                    placeholder="Department" 
                  />
                )}
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-[var(--color-foreground)]">{fullName}</h3>
                <p className="text-[var(--color-text-muted)] mt-1 flex items-center justify-center sm:justify-start gap-2">
                  <Mail className="w-4 h-4" /> {profile.email}
                </p>
                {profile.phone && (
                  <p className="text-[var(--color-text-muted)] mt-1 flex items-center justify-center sm:justify-start gap-2">
                    <Phone className="w-4 h-4" /> {profile.phone}
                  </p>
                )}
                <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-[var(--color-text-muted)] flex-wrap">
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
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[var(--color-status-error-text)] hover:bg-[var(--color-status-error-bg)] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {isCandidate && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-[var(--color-warm-surface)] rounded-2xl border border-[var(--color-warm-border)] p-6 shadow-sm transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[var(--color-status-info-bg)] rounded-xl text-[var(--color-status-info-text)]"><FileText className="w-6 h-6" /></div>
              <h4 className="font-bold text-[var(--color-foreground)]">Total Applications</h4>
            </div>
            <p className="text-3xl font-bold text-[var(--color-primary)]">{profile.applications_count || 0}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Jobs you&apos;ve applied to</p>
          </div>
          <div className="bg-white dark:bg-[var(--color-warm-surface)] rounded-2xl border border-[var(--color-warm-border)] p-6 shadow-sm transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[var(--color-status-active-bg)] rounded-xl text-[var(--color-status-active-text)]"><Users className="w-6 h-6" /></div>
              <h4 className="font-bold text-[var(--color-foreground)]">Pending Actions</h4>
            </div>
            <p className="text-3xl font-bold text-[var(--color-status-active-text)]">{profile.pending_actions || 0}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Actions needed</p>
          </div>
          <div className="bg-white dark:bg-[var(--color-warm-surface)] rounded-2xl border border-[var(--color-warm-border)] p-6 shadow-sm transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[var(--color-status-warning-bg)] rounded-xl text-[var(--color-status-warning-text)]"><Clock className="w-6 h-6" /></div>
              <h4 className="font-bold text-[var(--color-foreground)]">Member Since</h4>
            </div>
            <p className="text-lg font-semibold text-[var(--color-foreground)]">{formatJoinDate(profile.joined_date)}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Active member</p>
          </div>
        </div>
      )}

      {!isCandidate && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-[var(--color-warm-surface)] rounded-2xl border border-[var(--color-warm-border)] p-6 shadow-sm transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[var(--color-status-info-bg)] rounded-xl text-[var(--color-status-info-text)]"><Briefcase className="w-6 h-6" /></div>
              <h4 className="font-bold text-[var(--color-foreground)]">Jobs Posted</h4>
            </div>
            <p className="text-3xl font-bold text-[var(--color-primary)]">{profile.managed_jobs || 0}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Active job postings</p>
          </div>
          <div className="bg-white dark:bg-[var(--color-warm-surface)] rounded-2xl border border-[var(--color-warm-border)] p-6 shadow-sm transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[var(--color-status-active-bg)] rounded-xl text-[var(--color-status-active-text)]"><Users className="w-6 h-6" /></div>
              <h4 className="font-bold text-[var(--color-foreground)]">Total Candidates</h4>
            </div>
            <p className="text-3xl font-bold text-[var(--color-status-active-text)]">{profile.total_candidates || 0}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Applied to your jobs</p>
          </div>
          <div className="bg-white dark:bg-[var(--color-warm-surface)] rounded-2xl border border-[var(--color-warm-border)] p-6 shadow-sm transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[var(--color-status-warning-bg)] rounded-xl text-[var(--color-status-warning-text)]"><Clock className="w-6 h-6" /></div>
              <h4 className="font-bold text-[var(--color-foreground)]">Pending Review</h4>
            </div>
            <p className="text-3xl font-bold text-[var(--color-status-warning-text)]">{profile.pending_review || 0}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Candidates waiting</p>
          </div>
        </div>
      )}

      {/* Account Settings */}
      <div className="bg-white dark:bg-[var(--color-warm-surface)] rounded-2xl border border-[var(--color-warm-border)] shadow-sm overflow-hidden transition-colors">
        <div className="p-6 border-b border-[var(--color-warm-border)]">
          <h3 className="font-bold text-[var(--color-foreground)] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[var(--color-primary)]" /> Account Settings
          </h3>
        </div>
        <div className="divide-y divide-[var(--color-warm-border)]">
          <button 
            onClick={() => setShowNotificationsModal(true)}
            className="w-full flex items-center justify-between p-6 hover:bg-[var(--color-warm-bg-page)] dark:hover:bg-[var(--color-warm-bg-deep)] transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--color-warm-bg-page)] dark:bg-[var(--color-warm-bg-deep)] rounded-xl"><Bell className="w-5 h-5 text-[var(--color-text-muted)]" /></div>
              <div className="text-left">
                <p className="font-medium text-[var(--color-foreground)]">Email Preferences</p>
                <p className="text-sm text-[var(--color-text-muted)]">Manage notification settings</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--color-text-faint)]" />
          </button>
          <button 
            onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center justify-between p-6 hover:bg-[var(--color-warm-bg-page)] dark:hover:bg-[var(--color-warm-bg-deep)] transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--color-warm-bg-page)] dark:bg-[var(--color-warm-bg-deep)] rounded-xl"><Key className="w-5 h-5 text-[var(--color-text-muted)]" /></div>
              <div className="text-left">
                <p className="font-medium text-[var(--color-foreground)]">Security & Password</p>
                <p className="text-sm text-[var(--color-text-muted)]">Update your password</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--color-text-faint)]" />
          </button>
        </div>
      </div>
    </>
  );

  const modals = (
    <>
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[var(--color-warm-surface)] rounded-3xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto border border-[var(--color-warm-border)] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[var(--color-foreground)]">Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="p-1 rounded-full hover:bg-[var(--color-warm-bg-page)] dark:hover:bg-[var(--color-warm-bg-deep)]">
                <X className="w-5 h-5 text-[var(--color-text-muted)]" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-body)] mb-1">Current Password</label>
                <input 
                  type="password" 
                  value={oldPassword} 
                  onChange={(e) => setOldPassword(e.target.value)} 
                  className="w-full px-4 py-2 border border-[var(--color-warm-border-light)] dark:border-[var(--color-warm-border)] bg-white dark:bg-[var(--color-warm-bg-deep)] text-[var(--color-foreground)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-body)] mb-1">New Password</label>
                <div className="relative">
                  <input 
                    type={showNewPassword ? 'text' : 'password'} 
                    value={newPassword1} 
                    onChange={(e) => {
                      setNewPassword1(e.target.value);
                      setTouchedPasswords(prev => ({ ...prev, new: true }));
                    }}
                    className="w-full px-4 py-2 border border-[var(--color-warm-border-light)] dark:border-[var(--color-warm-border)] bg-white dark:bg-[var(--color-warm-bg-deep)] text-[var(--color-foreground)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition pr-10" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)] hover:text-[var(--color-foreground)]"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {touchedPasswords.new && newPassword1 && (
                  <div className="mt-2 space-y-1 animate-fadeIn">
                    <div className={`flex items-center gap-2 text-xs ${passwordReqs.length ? 'text-[var(--color-status-active-text)]' : 'text-[var(--color-text-faint)]'}`}>
                      <span>{passwordReqs.length ? '✓' : '○'}</span> At least 8 characters
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordReqs.uppercase ? 'text-[var(--color-status-active-text)]' : 'text-[var(--color-text-faint)]'}`}>
                      <span>{passwordReqs.uppercase ? '✓' : '○'}</span> One uppercase letter
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordReqs.lowercase ? 'text-[var(--color-status-active-text)]' : 'text-[var(--color-text-faint)]'}`}>
                      <span>{passwordReqs.lowercase ? '✓' : '○'}</span> One lowercase letter
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordReqs.number ? 'text-[var(--color-status-active-text)]' : 'text-[var(--color-text-faint)]'}`}>
                      <span>{passwordReqs.number ? '✓' : '○'}</span> One number
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordReqs.special ? 'text-[var(--color-status-active-text)]' : 'text-[var(--color-text-faint)]'}`}>
                      <span>{passwordReqs.special ? '✓' : '○'}</span> One special character
                    </div>
                    {passwordStrength && (
                      <div className={`text-xs font-medium mt-1 ${passwordStrength.color}`}>
                        Strength: {passwordStrength.message}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-body)] mb-1">Confirm New Password</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    value={newPassword2} 
                    onChange={(e) => {
                      setNewPassword2(e.target.value);
                      setTouchedPasswords(prev => ({ ...prev, confirm: true }));
                    }}
                    className="w-full px-4 py-2 border border-[var(--color-warm-border-light)] dark:border-[var(--color-warm-border)] bg-white dark:bg-[var(--color-warm-bg-deep)] text-[var(--color-foreground)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition pr-10" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)] hover:text-[var(--color-foreground)]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {touchedPasswords.confirm && newPassword2 && newPassword1 !== newPassword2 && (
                  <p className="text-[var(--color-status-error-text)] text-xs mt-1">Passwords do not match</p>
                )}
              </div>
              {passwordError && (
                <div className="text-[var(--color-status-error-text)] text-sm">{passwordError}</div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="ghost" onClick={() => setShowPasswordModal(false)} className="flex-1">Cancel</Button>
              <Button 
                variant="primary" 
                onClick={handlePasswordSubmit} 
                isLoading={changingPassword}
                className="flex-1 min-w-[120px] whitespace-nowrap"
              >
                Update Password
              </Button>
            </div>
          </div>
        </div>
      )}

      {showNotificationsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[var(--color-warm-surface)] rounded-3xl shadow-xl max-w-md w-full p-6 border border-[var(--color-warm-border)] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[var(--color-foreground)]">Email Preferences</h3>
              <button onClick={() => setShowNotificationsModal(false)} className="p-1 rounded-full hover:bg-[var(--color-warm-bg-page)] dark:hover:bg-[var(--color-warm-bg-deep)]">
                <X className="w-5 h-5 text-[var(--color-text-muted)]" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--color-foreground)]">Shortlisted</p>
                  <p className="text-sm text-[var(--color-text-muted)]">Email when you are shortlisted for a job</p>
                </div>
                <button
                  onClick={() => setNotificationPrefs(prev => ({ ...prev, shortlisted: !prev.shortlisted }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    notificationPrefs.shortlisted ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-neutral-border)]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationPrefs.shortlisted ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--color-foreground)]">Status Changes</p>
                  <p className="text-sm text-[var(--color-text-muted)]">Email when your application status changes</p>
                </div>
                <button
                  onClick={() => setNotificationPrefs(prev => ({ ...prev, statusChange: !prev.statusChange }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationPrefs.statusChange ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-neutral-border)]'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationPrefs.statusChange ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--color-foreground)]">Interviews</p>
                  <p className="text-sm text-[var(--color-text-muted)]">Email reminders for upcoming interviews</p>
                </div>
                <button
                  onClick={() => setNotificationPrefs(prev => ({ ...prev, interview: !prev.interview }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationPrefs.interview ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-neutral-border)]'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationPrefs.interview ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--color-foreground)]">Marketing</p>
                  <p className="text-sm text-[var(--color-text-muted)]">Receive job recommendations and company updates</p>
                </div>
                <button
                  onClick={() => setNotificationPrefs(prev => ({ ...prev, marketing: !prev.marketing }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationPrefs.marketing ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-neutral-border)]'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationPrefs.marketing ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
            {notifSaveSuccess && (
              <p className="text-[var(--color-status-active-text)] text-sm mt-4 text-center">Preferences saved!</p>
            )}
            <div className="flex gap-3 mt-6">
              <Button variant="ghost" onClick={() => setShowNotificationsModal(false)} className="flex-1">Cancel</Button>
              <Button 
                variant="primary" 
                onClick={saveNotificationPrefs} 
                isLoading={savingNotif}
                className="flex-1"
              >
                Save Preferences
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (isCandidate) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-background)] dark:bg-[var(--color-warm-bg-deep)] transition-colors">
        <Navbar />
        <main className="flex-1 max-w-[1440px] mx-auto px-4 py-10 w-full">
          {profileContent}
        </main>
        <Footer />
        {modals}
      </div>
    );
  } else {
    return (
      <div className="min-h-screen flex bg-[var(--color-background)] dark:bg-[var(--color-warm-bg-deep)] transition-colors">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 max-w-[1440px] mx-auto px-4 py-10 w-full">
            {profileContent}
          </main>
          <Footer />
        </div>
        {modals}
      </div>
    );
  }
}