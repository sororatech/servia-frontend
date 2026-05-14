import { getApiUrl, fetchAllPages } from '@/utils/serverFetch';
import type { Choice, JobFormChoices } from '@/types/job';

type DRFChoice = { value: string; display_name: string };
type DRFChoiceField = { choices?: DRFChoice[] };
type DRFOptionsBody = {
  actions?: {
    POST?: {
      employment_type?: DRFChoiceField;
      shift_type?: DRFChoiceField;
    };
  };
};

function mapChoices(field: DRFChoiceField | undefined): Choice[] {
  return (field?.choices ?? []).map((c) => ({ value: c.value, label: c.display_name }));
}

export async function fetchJobFormChoices(headers: HeadersInit): Promise<JobFormChoices> {
  const [optionsRes, categoriesRes, allJobs] = await Promise.all([
    fetch(getApiUrl('/jobs/jobs/'), { method: 'OPTIONS', headers, cache: 'no-store' }),
    fetch(getApiUrl('/jobs/departments/categories/'), { headers, cache: 'no-store' }),
    fetchAllPages<{ core_skills: string[] }>('/jobs/jobs/', headers),
  ]);

  if (!optionsRes.ok) throw new Error(`Failed to fetch job options (${optionsRes.status})`);
  if (!categoriesRes.ok) throw new Error(`Failed to fetch department categories (${categoriesRes.status})`);

  const options = (await optionsRes.json()) as DRFOptionsBody;
  const post = options.actions?.POST ?? {};

  const departmentCategories = (await categoriesRes.json()) as Record<string, Choice[]>;
  const departments = Object.values(departmentCategories).flat();

  const suggestedSkills = Array.from(
    new Set(allJobs.flatMap((job) => job.core_skills ?? []))
  ).sort();

  return {
    departmentCategories,
    departments,
    employmentTypes: mapChoices(post.employment_type),
    shiftTypes: mapChoices(post.shift_type),
    suggestedSkills,
  };
}
