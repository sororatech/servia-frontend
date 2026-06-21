import { NextResponse } from 'next/server';
import { fetchJson } from '@/utils/serverFetch';
import { getRecruiterHeaders } from '@/lib/serverAuth';

export async function GET() {
  const headers = await getRecruiterHeaders();
  if (!headers) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await fetchJson<unknown>('/users/me/', headers);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 502 });
  }
}

export async function PATCH(request: Request) {
  const headers = await getRecruiterHeaders();
  if (!headers) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json() as unknown;
    const data = await fetchJson<unknown>('/users/me/', headers, {
      method: 'PATCH',
      body,
    });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 502 });
  }
}
