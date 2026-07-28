import { NextResponse } from 'next/server';
import { getRecruiterHeaders } from '@/lib/serverAuth';
import { getApiBaseUrl } from '@/lib/config';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const headers = await getRecruiterHeaders();
  if (!headers) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json() as unknown;
    const res = await fetch(`${getApiBaseUrl()}/interviews/interviews/${id}/`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });

    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      return NextResponse.json(
        { detail: text || 'Failed to update interview' },
        { status: res.status || 502 },
      );
    }

    const data = await res.json() as unknown;
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to update interview' }, { status: 500 });
  }
}
