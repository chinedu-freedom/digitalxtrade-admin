import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Always allow Next.js internals, API routes, static files with extensions, and favicon
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const adminToken =
    req.cookies.get('stakelab_admin_token')?.value ||
    req.cookies.get('sec-admin-token')?.value ||
    req.cookies.get('digital_admin_token')?.value;

  // List of public paths that don't require admin authentication
  const isPublicPath =
    pathname === '/' ||
    pathname === '/admin/login' ||
    pathname === '/admin/forgot-password' ||
    pathname === '/admin/reset-password' ||
    pathname === '/admin/verify-otp' ||
    pathname === '/login';

  // Prevent logged-in admin from visiting login/auth pages
  if (isPublicPath && adminToken) {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }

  // Protect all other admin routes
  if (!isPublicPath && !adminToken) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
