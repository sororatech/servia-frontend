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

function errorRedirect(
  context: CandidateContext,
  message: string,
): never {
  redirect(
    `/recruiter/dashboard/interviews/schedule/${context.candidateId}` +
      `?candidateName=${encodeURIComponent(context.candidateName)}` +
      `&candidateEmail=${encodeURIComponent(context.candidateEmail)}` +
      `&candidateRole=${encodeURIComponent(context.candidateRole)}` +
      `&jobId=${context.jobId}` +
      `&error=${encodeURIComponent(message)}`,
  );
}

export async function scheduleInterview(
  context: CandidateContext,
  formData: FormData,
) {
  const jar = await cookies();

  const token = jar.get('auth_token')?.value;

  if (!token) {
    redirect('/login');
  }


  // Validate scheduled time


  const rawTime = formData.get('scheduled_time');

  if (typeof rawTime !== 'string' || !rawTime.trim()) {
    errorRedirect(
      context,
      'Please select a valid interview date and time.',
    );
  }

  const scheduledTime = new Date(rawTime);

  if (isNaN(scheduledTime.getTime())) {
    errorRedirect(
      context,
      'Please select a valid interview date and time.',
    );
  }


  // Validate duration


  const rawDuration = formData.get('duration_minutes');

  const duration = Number(rawDuration);

  if (
    !Number.isFinite(duration) ||
    duration < 15 ||
    duration > 180
  ) {
    errorRedirect(
      context,
      'Duration must be between 15 and 180 minutes.',
    );
  }


  // Validate stage
  

  const stage = formData.get('stage');

  if (typeof stage !== 'string' || !stage.trim()) {
    errorRedirect(
      context,
      'Please select an interview stage.',
    );
  }


  // Create interview


  const response = await fetch(
    getApiUrl('/interviews/interviews/'),
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },

      body: JSON.stringify({
        candidate: context.candidateId,
        job: context.jobId,
        scheduled_time:
          scheduledTime.toISOString(),
        duration_minutes: duration,
        stage,
        status: 'scheduled',
      }),
    },
  );

  const payload = (await response.json()) as {
    id?: string;
    detail?: string;
  };

  if (!response.ok || !payload.id) {
    errorRedirect(
      context,
      payload.detail ??
        'Unable to schedule interview right now.',
    );
  }

  redirect('/recruiter/dashboard/interviews');
}