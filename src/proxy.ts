import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessTokenEdge } from '@/lib/auth-edge';

// Define route permissions
const routeConfig = {
  admin: ['/admin', '/api/admin'],
  user: ['/dashboard', '/profile'],
  publicOnly: ['/login', '/register', '/forgot-password', '/reset-password'],
};

export async function proxy(req: NextRequest) {
  const accessToken = req.cookies.get('accessToken')?.value;
  const { pathname } = req.nextUrl;

  const isPublicOnlyRoute = routeConfig.publicOnly.some((route) => pathname.startsWith(route));
  const isAdminRoute = routeConfig.admin.some((route) => pathname.startsWith(route));
  const isUserRoute = routeConfig.user.some((route) => pathname.startsWith(route));

  // Handle API Admin Routes separately for response consistency
  if (isAdminRoute && pathname.startsWith('/api/admin')) {
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const payload = await verifyAccessTokenEdge(accessToken);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.next();
  }

  // If logged in, don't allow access to public-only routes (login/register)
  if (isPublicOnlyRoute && accessToken) {
    const payload = await verifyAccessTokenEdge(accessToken);
    if (payload) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Protect Admin Routes
  if (isAdminRoute) {
    if (!accessToken) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    const payload = await verifyAccessTokenEdge(accessToken);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  // Protect User/Dashboard Routes
  if (isUserRoute) {
    if (!accessToken) {
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    const payload = await verifyAccessTokenEdge(accessToken);
    if (!payload) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/ (all API routes except custom ones you want to protect)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
