import { NextResponse } from 'next/server';
import { getRecruiterHeaders } from '@/utils/serverFetch';
import { getApiBaseUrl } from '@/lib/config';

export async function POST(request: Request) {
  const headers = await getRecruiterHeaders();
  if (!headers) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json() as unknown;
    const res = await fetch(`${getApiBaseUrl()}/interviews/interviews/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json() as unknown;
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to schedule interview' }, { status: 500 });
  }
}
