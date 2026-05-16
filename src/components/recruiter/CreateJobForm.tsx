'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createJob } from '@/utils/createJob';
import { updateJob } from '@/utils/updateJob';
import type { JobFormChoices, BackendJob } from '@/types/job';

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level (0–1 yrs)' },
  { value: '1_2', label: '1–2 Years' },
  { value: '2_4', label: '2–4 Years' },
  { value: '3_5', label: '3–5 Years' },
  { value: '5_7', label: '5–7 Years' },
  { value: '7_plus', label: '7+ Years' },
];

type FieldErrors = Partial<Record<string, string>>;

function validate(fields: {
  title: string;
  department: string;
  category: string;
  location: string;
  employment_type: string;
  shift_type: string;
  description: string;
  requirements: string;
  core_skills: string[];
  openings_count: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!fields.title.trim()) errors.title = 'Job title is required.';
  else if (fields.title.length > 200) errors.title = 'Title must be 200 characters or fewer.';
  if (!fields.department) errors.department = 'Department is required.';
  if (!fields.category) errors.category = 'Category is required.';
  if (!fields.location.trim()) errors.location = 'Location is required.';
  if (!fields.employment_type) errors.employment_type = 'Employment type is required.';
  if (!fields.shift_type) errors.shift_type = 'Shift type is required.';
  if (!fields.description.trim()) errors.description = 'Job description is required.';
  else if (fields.description.trim().length < 50) errors.description = 'Description must be at least 50 characters.';
  if (!fields.requirements.trim()) errors.requirements = 'Requirements are required.';
  if (fields.core_skills.length === 0) errors.core_skills = 'At least one required skill must be added.';
  if (fields.openings_count !== '') {
    const n = Number(fields.openings_count);
    if (!Number.isInteger(n) || n < 1) errors.openings_count = 'Must be a whole number of at least 1.';
  }
  return errors;
}

function findDepartmentGroup(categoryValue: string, departmentCategories: Record<string, { value: string; label: string }[]>): string {
  for (const [group, choices] of Object.entries(departmentCategories)) {
    if (choices.some((c) => c.value === categoryValue)) return group;
  }
  return '';
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));
}

const inputClass =
  'w-full rounded-xl border border-[#ddd5cf] bg-white px-4 py-3 text-sm text-[#201d1b] outline-none transition focus:border-[#26b9c8] focus:ring-2 focus:ring-[#26b9c8]/20';
const errorClass = 'mt-1 text-xs text-[#b13d2f]';
const labelClass = 'block text-sm font-semibold text-[#3a3330] mb-1.5';

type Props = {
  choices: JobFormChoices;
  initialJob?: BackendJob;
};

export default function CreateJobForm({ choices, initialJob }: Props) {
  const isEditing = !!(initialJob?.id);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingMode, setPendingMode] = useState<'publish' | 'draft' | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [skillInput, setSkillInput] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const initialCategory = initialJob?.department ?? '';
  const initialDepartment = initialCategory
    ? findDepartmentGroup(initialCategory, choices.departmentCategories)
    : '';

  const [fields, setFields] = useState({
    title: initialJob?.title ?? '',
    department: initialDepartment,
    category: initialCategory,
    location: initialJob?.location ?? '',
    employment_type: initialJob?.employment_type ?? '',
    shift_type: initialJob?.shift_type ?? '',
    description: initialJob?.description ?? '',
    responsibilities: initialJob?.responsibilities ?? '',
    requirements: initialJob?.requirements ?? '',
    core_skills: initialJob?.core_skills ?? ([] as string[]),
    experience_level: '',
    openings_count: initialJob?.openings_count != null ? String(initialJob.openings_count) : '',
    is_active: initialJob?.is_active ?? true,
  });

  const isDirty = isEditing
    ? fields.title !== (initialJob?.title ?? '') ||
      fields.description !== (initialJob?.description ?? '') ||
      fields.requirements !== (initialJob?.requirements ?? '')
    : fields.title !== '' || fields.description !== '' || fields.requirements !== '';

  useEffect(() => {
    if (!isDirty || toast) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty, toast]);

  function set<K extends keyof typeof fields>(key: K, value: (typeof fields)[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleDepartmentChange(value: string) {
    setFields((prev) => ({ ...prev, department: value, category: '' }));
    setFieldErrors((prev) => ({ ...prev, department: undefined, category: undefined }));
  }

  function handleSkillKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const val = skillInput.trim().toLowerCase();
    if (val && !fields.core_skills.includes(val)) {
      set('core_skills', [...fields.core_skills, val]);
    }
    setSkillInput('');
  }

  function removeSkill(skill: string) {
    set('core_skills', fields.core_skills.filter((s) => s !== skill));
  }

  function handleSubmit(mode: 'publish' | 'draft') {
    if (pendingMode) return;
    const errors = validate(fields);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setApiError(null);
    setPendingMode(mode);

    const payload = {
      title: fields.title.trim(),
      description: fields.description.trim(),
      responsibilities: fields.responsibilities.trim() || undefined,
      requirements: fields.requirements.trim(),
      department: fields.category,
      shift_type: fields.shift_type,
      employment_type: fields.employment_type,
      location: fields.location.trim(),
      is_active: mode === 'publish',
      core_skills: fields.core_skills.length > 0 ? fields.core_skills : undefined,
      openings_count: fields.openings_count !== '' ? Number(fields.openings_count) : undefined,
    };

    startTransition(async () => {
      const result = isEditing
        ? await updateJob(initialJob!.id, payload)
        : await createJob(payload);

      if (result.ok) {
        const message = mode === 'publish'
          ? (isEditing ? 'Job updated successfully!' : 'Job published successfully!')
          : 'Job saved as draft.';
        setToast(message);
        setTimeout(() => router.push(`/recruiter/dashboard/jobs/${result.jobId}`), 2000);
      } else {
        setApiError(result.error);
        setPendingMode(null);
      }
    });
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(38,185,200,0.12),_transparent_22%),linear-gradient(180deg,#fbfaf8_0%,#f3ece7_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1400px]">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/recruiter/dashboard/jobs"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ddd5cf] bg-white text-[#0c6c75] transition hover:border-[#26b9c8] hover:bg-[#f0fdff]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-[#171717] sm:text-3xl">
              {isEditing ? 'Edit Job' : 'Create New Job'}
            </h1>
          </div>
        </div>

        {/* Edit mode: last updated banner */}
        {isEditing && (
          <div className="mb-5 rounded-2xl border border-[#ddd5cf] bg-white px-5 py-3 text-sm text-[#635b55]">
            Last updated: {formatDate(initialJob!.updated_at)}
            {initialJob!.candidate_count > 0 && (
              <span className="ml-3 font-semibold text-[#c97a1a]">
                ⚠ This job has {initialJob!.candidate_count} application{initialJob!.candidate_count !== 1 ? 's' : ''} — changes may affect existing candidates.
              </span>
            )}
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="mb-6 rounded-2xl border border-[#b8ead2] bg-[#ecfff4] px-5 py-4 text-sm font-semibold text-[#0f7b43]">
            ✓ {toast} Redirecting…
          </div>
        )}

        {/* API error */}
        {apiError && (
          <div className="mb-6 rounded-2xl border border-[#efc7bf] bg-[#fff0ec] px-5 py-4 text-sm font-medium text-[#b13d2f]">
            {apiError}
          </div>
        )}

        <div className="rounded-[2rem] border border-black/10 bg-white/85 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">

            {/* Section: Basic Info */}
            <h2 className="text-base font-bold text-[#171717]">Basic Info</h2>
            <hr className="mt-2 mb-6 border-[#ece4de]" />

            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Job Title <span className="text-[#b13d2f]">*</span></label>
                <input
                  type="text"
                  value={fields.title}
                  maxLength={200}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="e.g. Front Desk Manager"
                  className={inputClass}
                />
                <div className="mt-1 flex justify-between">
                  {fieldErrors.title
                    ? <p className={errorClass}>{fieldErrors.title}</p>
                    : <span />}
                  <span className="text-xs text-[#9a9088]">{fields.title.length}/200</span>
                </div>
              </div>

              <div>
                <label className={labelClass}>Department <span className="text-[#b13d2f]">*</span></label>
                <select
                  value={fields.department}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select department</option>
                  {Object.keys(choices.departmentCategories).map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {fieldErrors.department && <p className={errorClass}>{fieldErrors.department}</p>}
              </div>

              {fields.department && (
                <div>
                  <label className={labelClass}>Category <span className="text-[#b13d2f]">*</span></label>
                  <select
                    value={fields.category}
                    onChange={(e) => set('category', e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select category</option>
                    {(choices.departmentCategories[fields.department] ?? []).map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  {fieldErrors.category && <p className={errorClass}>{fieldErrors.category}</p>}
                </div>
              )}

              <div>
                <label className={labelClass}>Location <span className="text-[#b13d2f]">*</span></label>
                <input
                  type="text"
                  value={fields.location}
                  onChange={(e) => set('location', e.target.value)}
                  placeholder="e.g. Remote, New York, NY"
                  className={inputClass}
                />
                {fieldErrors.location && <p className={errorClass}>{fieldErrors.location}</p>}
              </div>

              <div>
                <label className={labelClass}>Number of Openings</label>
                <input
                  type="number"
                  min={1}
                  value={fields.openings_count}
                  onChange={(e) => set('openings_count', e.target.value)}
                  placeholder="e.g. 3"
                  className={inputClass}
                />
                {fieldErrors.openings_count
                  ? <p className={errorClass}>{fieldErrors.openings_count}</p>
                  : <p className="mt-1 text-xs text-[#9a9088]">Leave blank if unspecified</p>}
              </div>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Employment Type <span className="text-[#b13d2f]">*</span></label>
                <select
                  value={fields.employment_type}
                  onChange={(e) => set('employment_type', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select type</option>
                  {choices.employmentTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {fieldErrors.employment_type && <p className={errorClass}>{fieldErrors.employment_type}</p>}
              </div>

              <div>
                <label className={labelClass}>Shift Type <span className="text-[#b13d2f]">*</span></label>
                <select
                  value={fields.shift_type}
                  onChange={(e) => set('shift_type', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select shift</option>
                  {choices.shiftTypes.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                {fieldErrors.shift_type && <p className={errorClass}>{fieldErrors.shift_type}</p>}
              </div>
            </div>

            {/* Section: Job Description */}
            <h2 className="mt-10 text-base font-bold text-[#171717]">Job Description</h2>
            <hr className="mt-2 mb-6 border-[#ece4de]" />

            <div>
              <label className={labelClass}>
                Description <span className="text-[#b13d2f]">*</span>
                <span className="ml-2 font-normal text-[#9a9088]">(min 50 characters)</span>
              </label>
              <textarea
                value={fields.description}
                onChange={(e) => set('description', e.target.value)}
                rows={4}
                placeholder="Describe the role and what makes it great…"
                className={`${inputClass} resize-y`}
              />
              <div className="mt-1 flex justify-between">
                {fieldErrors.description
                  ? <p className={errorClass}>{fieldErrors.description}</p>
                  : <span />}
                <span className={`text-xs ${fields.description.length < 50 ? 'text-[#9a9088]' : 'text-[#0f7b43]'}`}>
                  {fields.description.length} chars
                </span>
              </div>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <h2 className="text-base font-bold text-[#171717]">Responsibilities</h2>
                <hr className="mt-2 mb-4 border-[#ece4de]" />
                <textarea
                  value={fields.responsibilities}
                  onChange={(e) => set('responsibilities', e.target.value)}
                  rows={6}
                  placeholder={'• Greet and assist guests on arrival\n• Manage check-in and check-out\n• Handle guest enquiries…'}
                  className={`${inputClass} resize-y`}
                />
              </div>

              <div>
                <h2 className="text-base font-bold text-[#171717]">Requirements</h2>
                <hr className="mt-2 mb-4 border-[#ece4de]" />
                <textarea
                  value={fields.requirements}
                  onChange={(e) => set('requirements', e.target.value)}
                  rows={6}
                  placeholder={'• 2+ years of relevant experience\n• Strong communication skills\n• Ability to work in a team…'}
                  className={`${inputClass} resize-y`}
                />
                {fieldErrors.requirements && <p className={errorClass}>{fieldErrors.requirements}</p>}
              </div>
            </div>

            {/* Section: AI Configuration */}
            <h2 className="mt-10 text-base font-bold text-[#171717]">AI Configuration</h2>
            <hr className="mt-2 mb-6 border-[#ece4de]" />

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Required Skills <span className="text-[#b13d2f]">*</span>
                </label>
                <div className="relative">
                  <div className={`${inputClass} flex min-h-[48px] h-auto flex-wrap gap-2 py-2`}>
                    {fields.core_skills.map((skill) => (
                      <span
                        key={skill}
                        className="flex items-center gap-1 rounded-full bg-[#e8f8fa] border border-[#cfecef] px-3 py-0.5 text-xs font-semibold text-[#0c6c75]"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-0.5 text-[#0c6c75]/60 hover:text-[#b13d2f] transition-colors"
                          aria-label={`Remove ${skill}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleSkillKeyDown}
                      placeholder={fields.core_skills.length === 0 ? 'Type a skill and press Enter…' : ''}
                      className="flex-1 min-w-[140px] outline-none bg-transparent text-sm text-[#201d1b] placeholder:text-[#b5aca6]"
                    />
                  </div>
                </div>
                {fieldErrors.core_skills
                  ? <p className={errorClass}>{fieldErrors.core_skills}</p>
                  : <p className="mt-1 text-xs text-[#9a9088]">Pick from suggestions or type and press Enter to add a custom skill</p>}
              </div>

              <div>
                <label className={labelClass}>Experience Level</label>
                <select
                  value={fields.experience_level}
                  onChange={(e) => set('experience_level', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select experience level</option>
                  {EXPERIENCE_LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
              <Link
                href="/recruiter/dashboard/jobs"
                className="rounded-full border border-[#ddd5cf] bg-white px-6 py-3 text-sm font-semibold text-[#635b55] transition hover:border-[#26b9c8] hover:text-[#0c6c75]"
              >
                Cancel
              </Link>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleSubmit('draft')}
                  disabled={!!pendingMode || isPending}
                  className="rounded-full border border-[#ddd5cf] bg-white px-6 py-3 text-sm font-semibold text-[#635b55] transition hover:border-[#26b9c8] hover:text-[#0c6c75] disabled:opacity-60"
                >
                  {pendingMode === 'draft' ? 'Saving…' : 'Save as Draft'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit('publish')}
                  disabled={!!pendingMode || isPending}
                  className="rounded-full bg-[#26b9c8] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#1fa8b6] disabled:opacity-60"
                >
                  {pendingMode === 'publish'
                    ? (isEditing ? 'Saving…' : 'Publishing…')
                    : (isEditing ? 'Save Changes' : 'Publish Job')}
                </button>
              </div>
            </div>
          </div>
      </div>
    </main>
  );
}
