import { NextResponse } from 'next/server';
import { getRecruiterHeaders, fetchAllPages } from '@/utils/serverFetch';

type BackendJob = { id: string; title: string };

export async function GET() {
  const headers = await getRecruiterHeaders();
  if (!headers) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const jobs = await fetchAllPages<BackendJob>('/jobs/jobs/', headers);
    return NextResponse.json(jobs);
  } catch {
    return NextResponse.json({ error: 'Failed to load jobs' }, { status: 500 });
  }
}
