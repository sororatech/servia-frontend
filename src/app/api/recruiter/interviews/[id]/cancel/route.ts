import { NextResponse } from 'next/server';
import { getRecruiterHeaders } from '@/lib/serverAuth';
import { getApiBaseUrl } from '@/lib/config';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const headers = await getRecruiterHeaders();
  if (!headers) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const res = await fetch(`${getApiBaseUrl()}/interviews/interviews/${id}/cancel/`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      return NextResponse.json(
        { detail: text || 'Failed to cancel interview' },
        { status: res.status || 502 },
      );
    }

    const data = await res.json() as unknown;
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to cancel interview' }, { status: 500 });
  }
}
