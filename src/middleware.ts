import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-do-not-use-in-prod';
const secret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value || request.cookies.get('auth-token')?.value || request.cookies.get('next-auth.session-token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Institutional Security for API
  if (pathname.startsWith('/api')) {
    // Exclude auth routes from verification
    if (pathname.includes('/auth')) {
      return NextResponse.next();
    }

    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const finalToken = token || bearerToken;

    if (!finalToken) {
      return new NextResponse(
        JSON.stringify({ error: 'Institutional Authorization Required :: Access Denied' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }

    try {
      // Verify token
      await jwtVerify(finalToken, secret);
      return NextResponse.next();
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid or Expired Institutional Token :: Access Denied' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }
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
