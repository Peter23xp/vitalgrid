import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import type { Role } from '@/lib/types';

const PUBLIC_PATHS = ['/login', '/forgot-password', '/api/auth', '/onboarding'];

const ROLE_ROUTES: Array<{ pattern: RegExp; roles: Role[] }> = [
  { pattern: /^\/dashboard\/admin/, roles: ['super_admin'] },
  { pattern: /^\/admin\/organizations/, roles: ['super_admin'] },
  { pattern: /^\/admin/,            roles: ['super_admin'] },
  { pattern: /^\/settings/,         roles: ['facility_manager', 'ngo_coordinator', 'auditor', 'super_admin'] },
  { pattern: /^\/dashboard\/ngo/,   roles: ['ngo_coordinator', 'super_admin'] },
  { pattern: /^\/dashboard\/field/, roles: ['field_agent', 'super_admin'] },
  { pattern: /^\/analytics/,        roles: ['facility_manager', 'ngo_coordinator', 'auditor', 'super_admin'] },
  { pattern: /^\/facilities/,       roles: ['ngo_coordinator', 'facility_manager', 'super_admin'] },
];

const ROLE_DASHBOARDS: Record<Role, string> = {
  super_admin:      '/dashboard/admin',
  facility_manager: '/dashboard',
  field_agent:      '/dashboard/field',
  ngo_coordinator:  '/dashboard/ngo',
  auditor:          '/analytics/map',
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const token = req.cookies.get('vg_access')?.value;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  const session = await verifyToken(token);

  if (!session) {
    const refreshToken = req.cookies.get('vg_refresh')?.value;
    if (refreshToken) {
      const url = req.nextUrl.clone();
      url.pathname = '/api/auth/refresh';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Onboarding — facility_manager sans facilityId doit compléter l'onboarding
  if (
    session.role === 'facility_manager' &&
    !session.facilityId &&
    pathname !== '/onboarding' &&
    !pathname.startsWith('/api/')
  ) {
    const url = req.nextUrl.clone();
    url.pathname = '/onboarding';
    return NextResponse.redirect(url);
  }

  for (const { pattern, roles } of ROLE_ROUTES) {
    if (pattern.test(pathname) && !roles.includes(session.role as Role)) {
      const url = req.nextUrl.clone();
      url.pathname = ROLE_DASHBOARDS[session.role as Role] ?? '/dashboard';
      url.searchParams.delete('next');
      return NextResponse.redirect(url);
    }
  }

  if (pathname === '/login' || pathname === '/') {
    const url = req.nextUrl.clone();
    url.pathname = ROLE_DASHBOARDS[session.role as Role] ?? '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
