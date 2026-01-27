import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value || request.cookies.get('next-auth.session-token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Institutional Security for API
  if (pathname.startsWith('/api')) {
    const authHeader = request.headers.get('authorization');

    // If no token/header and not an auth route, block strictly
    if (!token && !authHeader && !pathname.includes('/auth')) {
      return new NextResponse(
        JSON.stringify({ error: 'Institutional Authorization Required :: Access Denied' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }
    return NextResponse.next();
  }

  // 2. Authentication for Pages
  // Allow requests to /login and public assets
  if (pathname.startsWith('/login') || pathname === '/favicon.ico') {
    if (token && pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
