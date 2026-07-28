import { NextResponse } from 'next/server';
import { fetchJson } from '@/utils/serverFetch';
import { getRecruiterHeaders } from '@/lib/serverAuth';

export async function GET() {
  const headers = await getRecruiterHeaders();
  if (!headers) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await fetchJson<unknown>('/candidates/my-applications-stats/', headers);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to load application stats' }, { status: 502 });
  }
}
