import { NextResponse } from 'next/server';
import { getRecruiterHeaders } from '@/lib/serverAuth';
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
export async function PUT(request: Request) {
  const headers = await getRecruiterHeaders();
  if (!headers) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const interviewId = url.searchParams.get('id');
    
    if (!interviewId) {
      return NextResponse.json({ error: 'Interview ID is required' }, { status: 400 });
    }

    const body = await request.json() as unknown;
    const res = await fetch(`${getApiBaseUrl()}/interviews/interviews/${interviewId}/`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json() as unknown;
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to update interview' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const headers = await getRecruiterHeaders();
  if (!headers) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const candidateId = url.searchParams.get('candidate_id');
    
    if (!candidateId) {
      return NextResponse.json({ error: 'candidate_id is required' }, { status: 400 });
    }

    const res = await fetch(
      `${getApiBaseUrl()}/interviews/interviews/resolve-active/?candidate_id=${candidateId}`,
      { headers }
    );
    
    if (res.status === 404) {
      return NextResponse.json({ hasActiveInterview: false }, { status: 200 });
    }

    const data = await res.json() as any;
    return NextResponse.json({ 
      hasActiveInterview: true, 
      interview: data 
    }, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to check existing interview' }, { status: 500 });
  }
}