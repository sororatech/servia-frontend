import { NextResponse } from 'next/server';
import { getRecruiterHeaders, fetchAllPages } from '@/utils/serverFetch';

type BackendCandidate = {
  id: string;
  job: string;
  user: { first_name: string; last_name: string; email: string };
};

export async function GET() {
  const headers = await getRecruiterHeaders();
  if (!headers) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const candidates = await fetchAllPages<BackendCandidate>('/candidates/candidates/', headers);
    return NextResponse.json(candidates);
  } catch {
    return NextResponse.json({ error: 'Failed to load candidates' }, { status: 500 });
  }
}
