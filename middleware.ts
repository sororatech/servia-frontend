import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const userType = request.cookies.get('user_type')?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ];

  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  const isCandidateRoute = pathname.startsWith('/candidate');
  const isRecruiterRoute = pathname.startsWith('/recruiter');

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isPublicRoute && pathname !== '/') {
    if (userType === 'recruiter') {
      return NextResponse.redirect(new URL('/recruiter/dashboard', request.url));
    }
    if (userType === 'candidate') {
      return NextResponse.redirect(new URL('/candidate/dashboard', request.url));
    }
  }

  if (token && userType) {
    if (isCandidateRoute && userType !== 'candidate') {
      return NextResponse.redirect(new URL('/recruiter/dashboard', request.url));
    }
    if (isRecruiterRoute && userType !== 'recruiter') {
      return NextResponse.redirect(new URL('/candidate/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/candidate/:path*',
    '/recruiter/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password/:path*',
  ],
};