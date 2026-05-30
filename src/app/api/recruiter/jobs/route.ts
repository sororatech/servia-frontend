import { NextRequest, NextResponse } from 'next/server';
import {
  getRecruiterHeaders,
  fetchJson,
} from '@/utils/serverFetch';
import type { PaginatedResponse } from '@/utils/serverFetch';

type BackendJob = {
  id: string;
  title: string;
};

export async function GET(request: NextRequest) {
  const headers = await getRecruiterHeaders();

  if (!headers) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 },
    );
  }

  const searchParams = request.nextUrl.searchParams;

  const page =
    Number(searchParams.get('page')) || 1;

  const pageSize = Math.min(
    Number(searchParams.get('page_size')) || 20,
    100,
  );

  try {
    const jobs =
      await fetchJson<PaginatedResponse<BackendJob>>(
        `/jobs/jobs/?page=${page}&page_size=${pageSize}`,
        headers,
      );

    return NextResponse.json(jobs);
  } catch {
    return NextResponse.json(
      { error: 'Failed to load jobs' },
      { status: 500 },
    );
  }
}