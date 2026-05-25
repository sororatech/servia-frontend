import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { scheduleInterview } from '@/utils/scheduleInterviewAction';
import type { ScheduleInterviewPageProps } from '@/types/interview';

export async function getScheduleInterviewPageData(
  params: ScheduleInterviewPageProps['params'],
  searchParams: ScheduleInterviewPageProps['searchParams'],
) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const userRole = cookieStore.get('user_role')?.value;

  if (!token || userRole !== 'recruiter') {
    redirect('/login');
  }

  const { candidateId } = await params;
  const {
    candidateName = 'Candidate',
    candidateEmail = '',
    candidateRole = 'Open Role',
    jobId = '',
    error,
  } = await searchParams;

  const action = scheduleInterview.bind(null, {
    candidateId,
    candidateName,
    candidateEmail,
    candidateRole,
    jobId,
  });

  return { candidateName, candidateEmail, candidateRole, error, action };
}
