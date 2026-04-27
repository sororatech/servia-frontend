import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const userType = request.cookies.get('user_role')?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
  ];

  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isPublicRoute && pathname !== '/' && pathname !== '/login') {
    const redirectPath = userType === 'recruiter' 
      ? '/recruiter/dashboard' 
      : '/candidate/dashboard';
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  if (token && userType) {
    const isCandidateRoute = pathname.startsWith('/candidate');
    const isRecruiterRoute = pathname.startsWith('/recruiter');
    
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
    '/verify-email',
  ],
};