'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getApiUrl } from '@/utils/serverFetch';

export type CandidateContext = {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateRole: string;
  jobId: string;
};

function errorRedirect(context: CandidateContext, message: string): never {
  redirect(
    `/recruiter/dashboard/interviews/schedule/${context.candidateId}` +
      `?candidateName=${encodeURIComponent(context.candidateName)}` +
      `&candidateEmail=${encodeURIComponent(context.candidateEmail)}` +
      `&candidateRole=${encodeURIComponent(context.candidateRole)}` +
      `&jobId=${context.jobId}&error=${encodeURIComponent(message)}`,
  );
}

export async function scheduleInterview(context: CandidateContext, formData: FormData) {
  const jar = await cookies();
  const token = jar.get('auth_token')?.value;
  if (!token) redirect('/login');

  const rawTime = formData.get('scheduled_time') as string;
  const scheduledTime = new Date(rawTime);
  if (!rawTime || isNaN(scheduledTime.getTime())) {
    errorRedirect(context, 'Please select a valid interview date and time.');
  }

  const duration = Number(formData.get('duration_minutes'));
  if (!duration || duration < 15 || duration > 180) {
    errorRedirect(context, 'Duration must be between 15 and 180 minutes.');
  }

  const response = await fetch(getApiUrl('/interviews/interviews/'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({
      candidate: context.candidateId,
      job: context.jobId,
      scheduled_time: scheduledTime.toISOString(),
      duration_minutes: duration,
      stage: formData.get('stage'),
      status: 'scheduled',
    }),
  });

  const payload = (await response.json()) as { id?: string; detail?: string };

  if (!response.ok || !payload.id) {
    errorRedirect(context, payload.detail ?? 'Unable to schedule interview right now.');
  }

  redirect('/recruiter/dashboard/interviews');
}
