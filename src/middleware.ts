import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes that require authentication
  const protectedPaths = ['/dashboard', '/kyc', '/admin'];
  const authPaths = ['/auth/login', '/auth/signup'];

  const { pathname } = req.nextUrl;

  // If user is not logged in and tries to access protected route
  if (!session && protectedPaths.some((path) => pathname.startsWith(path))) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/auth/login';
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is logged in and tries to access auth pages
  // Don't auto-redirect - let the login handler route based on KYC status
  // Only block signup page if already logged in
  if (session && pathname.startsWith('/auth/signup')) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/kyc/:path*', '/auth/:path*'],
};
