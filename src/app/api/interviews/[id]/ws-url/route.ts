import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

type RouteContext = { params: Promise<{ id: string }> };

function getWebSocketBaseUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_WS_URL ?? process.env.NEXT_PUBLIC_WS_BASE_URL;

  if (configured) {
    return configured.replace(/\/$/, '');
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';
  return `${apiUrl.replace(/^http/, 'ws').replace(/\/$/, '')}/ws/interview`;
}

export async function GET(_request: Request, context: RouteContext) {
  const jar = await cookies();
  const token =
    jar.get('auth_token')?.value ??
    jar.get('token')?.value ??
    jar.get('access_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const url = `${getWebSocketBaseUrl()}/${id}/?token=${encodeURIComponent(token)}`;

  return NextResponse.json({ url });
}
