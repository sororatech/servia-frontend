'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createJob } from '@/utils/createJob';
import type { JobFormChoices } from '@/types/job';

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
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!fields.title.trim()) errors.title = 'Job title is required.';
  if (!fields.department) errors.department = 'Department is required.';
  if (!fields.category) errors.category = 'Category is required.';
  if (!fields.location.trim()) errors.location = 'Location is required.';
  if (!fields.employment_type) errors.employment_type = 'Employment type is required.';
  if (!fields.shift_type) errors.shift_type = 'Shift type is required.';
  if (!fields.description.trim()) errors.description = 'Job description is required.';
  if (!fields.requirements.trim()) errors.requirements = 'Requirements are required.';
  return errors;
}

const inputClass =
  'w-full rounded-xl border border-[#ddd5cf] bg-white px-4 py-3 text-sm text-[#201d1b] outline-none transition focus:border-[#26b9c8] focus:ring-2 focus:ring-[#26b9c8]/20';
const errorClass = 'mt-1 text-xs text-[#b13d2f]';
const labelClass = 'block text-sm font-semibold text-[#3a3330] mb-1.5';

export default function CreateJobForm({ choices }: { choices: JobFormChoices }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPreview, setShowPreview] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [skillInput, setSkillInput] = useState('');
  const [skillFocused, setSkillFocused] = useState(false);

  const [fields, setFields] = useState({
    title: '',
    department: '',       
    category: '',         
    location: '',
    employment_type: '',
    shift_type: '',
    description: '',
    responsibilities: '',
    requirements: '',
    core_skills: [] as string[],
    experience_level: '', 
    is_active: true,
  });

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

  function handleSubmit() {
    const errors = validate(fields);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setApiError(null);

    startTransition(async () => {
      const result = await createJob({
        title: fields.title.trim(),
        description: fields.description.trim(),
        responsibilities: fields.responsibilities.trim() || undefined,
        requirements: fields.requirements.trim(),
        department: fields.category,  
        shift_type: fields.shift_type,
        employment_type: fields.employment_type,
        location: fields.location.trim(),
        is_active: fields.is_active,
        core_skills: fields.core_skills.length > 0 ? fields.core_skills : undefined,
      });

      if (result.ok) {
        router.push(`/recruiter/dashboard/jobs/${result.jobId}`);
      } else {
        setApiError(result.error);
      }
    });
  }

  const previewDept = fields.department && fields.category
    ? `${fields.department} · ${choices.departments.find((d) => d.value === fields.category)?.label ?? '—'}`
    : '—';
  const previewEmp = choices.employmentTypes.find((e) => e.value === fields.employment_type)?.label ?? '—';
  const previewShift = choices.shiftTypes.find((s) => s.value === fields.shift_type)?.label ?? '—';

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(38,185,200,0.12),_transparent_22%),linear-gradient(180deg,#fbfaf8_0%,#f3ece7_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1400px]">

      
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
            <h1 className="text-2xl font-bold text-[#171717] sm:text-3xl">Create New Job</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="rounded-full border border-[#ddd5cf] bg-white px-5 py-2.5 text-sm font-semibold text-[#3a3330] transition hover:border-[#26b9c8] hover:text-[#0c6c75]"
            >
              {showPreview ? 'Edit Form' : 'Preview Job'}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="rounded-full bg-[#26b9c8] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1fa8b6] disabled:opacity-60"
            >
              {isPending ? 'Posting…' : 'Post Job'}
            </button>
          </div>
        </div>

     
        {apiError && (
          <div className="mb-6 rounded-2xl border border-[#efc7bf] bg-[#fff0ec] px-5 py-4 text-sm font-medium text-[#b13d2f]">
            {apiError}
          </div>
        )}

        {showPreview ? (
          
          <div className="rounded-[2rem] border border-black/10 bg-white/85 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-3xl font-bold text-[#171717]">{fields.title || 'Job Title'}</h2>
                <p className="mt-1 text-base text-[#635b55]">{previewDept}</p>
                <p className="mt-0.5 text-base text-[#635b55]">{fields.location || 'Location'}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-[#ddd7d3] bg-[#f4efeb] px-3 py-1 text-xs font-semibold text-[#7d746d]">
                  {previewEmp || 'Employment Type'}
                </span>
                <span className="rounded-full border border-[#ddd7d3] bg-[#f4efeb] px-3 py-1 text-xs font-semibold text-[#7d746d]">
                  {previewShift || 'Shift Type'}
                </span>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${fields.is_active ? 'border-[#b8ead2] bg-[#ecfff4] text-[#0f7b43]' : 'border-[#ddd7d3] bg-[#f4efeb] text-[#7d746d]'}`}>
                  {fields.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <section className="mt-8">
              <h3 className="text-lg font-semibold text-[#171717]">Description</h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#4a4440]">
                {fields.description || '—'}
              </p>
            </section>

            {fields.responsibilities && (
              <section className="mt-8">
                <h3 className="text-lg font-semibold text-[#171717]">Responsibilities</h3>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#4a4440]">
                  {fields.responsibilities}
                </p>
              </section>
            )}

            <section className="mt-8">
              <h3 className="text-lg font-semibold text-[#171717]">Requirements</h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#4a4440]">
                {fields.requirements || '—'}
              </p>
            </section>

            {fields.core_skills.length > 0 && (
              <section className="mt-8">
                <h3 className="text-lg font-semibold text-[#171717]">Required Skills</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {fields.core_skills.map((s) => (
                    <span key={s} className="rounded-full border border-[#cfecef] bg-[#e8f8fa] px-3 py-1 text-xs font-semibold text-[#0c6c75]">
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
         
          <div className="rounded-[2rem] border border-black/10 bg-white/85 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">

            
            <h2 className="text-base font-bold text-[#171717]">Basic Info</h2>
            <hr className="mt-2 mb-6 border-[#ece4de]" />

            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Job Title <span className="text-[#b13d2f]">*</span></label>
                <input
                  type="text"
                  value={fields.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="e.g. Front Desk Manager"
                  className={inputClass}
                />
                {fieldErrors.title && <p className={errorClass}>{fieldErrors.title}</p>}
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

              <div className="flex items-end pb-1">
                <label className="flex cursor-pointer items-center gap-3">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={fields.is_active}
                      onChange={(e) => set('is_active', e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`relative h-6 w-11 rounded-full transition-colors ${fields.is_active ? 'bg-[#26b9c8]' : 'bg-[#d5cdc8]'}`}>
                      <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${fields.is_active ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-[#3a3330]">Post as Active</span>
                </label>
              </div>
            </div>

          
            <h2 className="mt-10 text-base font-bold text-[#171717]">Job Description</h2>
            <hr className="mt-2 mb-6 border-[#ece4de]" />

            <div>
              <label className={labelClass}>Description <span className="text-[#b13d2f]">*</span></label>
              <textarea
                value={fields.description}
                onChange={(e) => set('description', e.target.value)}
                rows={4}
                placeholder="Describe the role and what makes it great…"
                className={`${inputClass} resize-y`}
              />
              {fieldErrors.description && <p className={errorClass}>{fieldErrors.description}</p>}
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

            
            <h2 className="mt-10 text-base font-bold text-[#171717]">AI Configuration</h2>
            <hr className="mt-2 mb-6 border-[#ece4de]" />

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Required Skills</label>
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
                      onFocus={() => setSkillFocused(true)}
                      onBlur={() => setTimeout(() => setSkillFocused(false), 150)}
                      placeholder={fields.core_skills.length === 0 ? 'Type or pick a skill…' : ''}
                      className="flex-1 min-w-[140px] outline-none bg-transparent text-sm text-[#201d1b] placeholder:text-[#b5aca6]"
                    />
                  </div>

                  
                  {skillFocused && (() => {
                    const q = skillInput.trim().toLowerCase();
                    const suggestions = choices.suggestedSkills.filter(
                      (s) => !fields.core_skills.includes(s) && (!q || s.toLowerCase().includes(q))
                    );
                    return suggestions.length > 0 ? (
                      <ul className="absolute z-20 mt-1 w-full rounded-xl border border-[#ddd5cf] bg-white shadow-lg max-h-48 overflow-y-auto">
                        {suggestions.map((s) => (
                          <li key={s}>
                            <button
                              type="button"
                              onMouseDown={() => {
                                set('core_skills', [...fields.core_skills, s]);
                                setSkillInput('');
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm text-[#201d1b] hover:bg-[#f0fdff] hover:text-[#0c6c75] transition-colors"
                            >
                              {s}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null;
                  })()}
                </div>
                <p className="mt-1 text-xs text-[#9a9088]">Pick from suggestions or type and press Enter to add a custom skill</p>
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

           
            <div className="mt-10 flex justify-end gap-3">
              <Link
                href="/recruiter/dashboard/jobs"
                className="rounded-full border border-[#ddd5cf] bg-white px-6 py-3 text-sm font-semibold text-[#635b55] transition hover:border-[#26b9c8] hover:text-[#0c6c75]"
              >
                Cancel
              </Link>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="rounded-full bg-[#26b9c8] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#1fa8b6] disabled:opacity-60"
              >
                {isPending ? 'Posting…' : 'Post Job'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
