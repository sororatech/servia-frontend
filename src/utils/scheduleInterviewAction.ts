'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

function getApiUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export type CandidateContext = {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateRole: string;
  jobId: string;
};

export async function scheduleInterview(context: CandidateContext, formData: FormData) {
  const jar = await cookies();
  const token = jar.get('auth_token')?.value;
  if (!token) redirect('/login');

  const response = await fetch(getApiUrl('/interviews/interviews/'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({
      candidate: context.candidateId,
      job: context.jobId,
      scheduled_time: new Date(formData.get('scheduled_time') as string).toISOString(),
      duration_minutes: Number(formData.get('duration_minutes')),
      stage: formData.get('stage'),
      status: 'scheduled',
    }),
  });

  const payload = (await response.json()) as { id?: string; detail?: string };

  if (!response.ok || !payload.id) {
    const msg = encodeURIComponent(payload.detail ?? 'Unable to schedule interview right now.');
    redirect(
      `/recruiter/dashboard/interviews/schedule/${context.candidateId}` +
        `?candidateName=${encodeURIComponent(context.candidateName)}` +
        `&candidateEmail=${encodeURIComponent(context.candidateEmail)}` +
        `&candidateRole=${encodeURIComponent(context.candidateRole)}` +
        `&jobId=${context.jobId}&error=${msg}`,
    );
  }

  redirect('/recruiter/dashboard/interviews');
}
