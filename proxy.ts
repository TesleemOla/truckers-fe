import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/register'];

// Define API routes that should be handled by the API itself
const apiRoutes = ['/api'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes (let them handle their own auth)
  if (apiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if the current route is public
  const isPublicRoute = publicRoutes.includes(pathname);

  // Get the access token from cookies
  const accessToken = request.cookies.get('access_token');

  // If accessing a protected route without authentication, redirect to login
  if (!isPublicRoute && !accessToken) {
    const loginUrl = new URL('/login', request.url);
    // Preserve the original URL to redirect back after login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing login/register while already authenticated, redirect to dashboard
  if (isPublicRoute && accessToken) {
    const redirectTo = request.nextUrl.searchParams.get('redirect') || '/';
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  // Allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};