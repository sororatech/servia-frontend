import { NextRequest, NextResponse } from 'next/server';

import {
  getRecruiterHeaders,
  fetchJson,
} from '@/utils/serverFetch';

import type { PaginatedResponse } from '@/utils/serverFetch';

type BackendCandidate = {
  id: string;

  job: string;

  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
};

export async function GET(
  request: NextRequest,
) {
  const headers =
    await getRecruiterHeaders();

  if (!headers) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 },
    );
  }

  const searchParams =
    request.nextUrl.searchParams;

  const page =
    Number(searchParams.get('page')) || 1;

  const pageSize = Math.min(
    Number(
      searchParams.get('page_size'),
    ) || 20,
    100,
  );

  try {
    const candidates =
      await fetchJson<
        PaginatedResponse<BackendCandidate>
      >(
        `/candidates/candidates/?page=${page}&page_size=${pageSize}`,
        headers,
      );

    return NextResponse.json(
      candidates,
    );
  } catch {
    return NextResponse.json(
      {
        error:
          'Failed to load candidates',
      },
      { status: 500 },
    );
  }
}