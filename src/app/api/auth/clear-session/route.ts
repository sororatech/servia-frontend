import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL('/login', request.url));

  // Explicitly clear with Path=/ to match how the cookies were originally set.
  // cookies().delete() without a path option may not clear Path=/ cookies,
  // leaving a stale token that causes a redirect loop.
  for (const name of ['auth_token', 'user_role']) {
    response.cookies.set(name, '', { path: '/', maxAge: 0, sameSite: 'lax' });
  }

  return response;
}
