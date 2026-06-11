import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import type { Role } from '@/lib/types';

// Routes publiques — pas de JWT requis, accessible sans connexion
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/forgot-password',
  '/onboarding',
  '/demo',
  '/register',
  '/api/auth',
  '/api/demo-request',
  '/api/access-requests',
];

// Routes protégées — JWT obligatoire. Tout le reste est public.
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/inventory',
  '/transfers',
  '/alerts',
  '/analytics',
  '/facilities',
  '/admin',
  '/settings',
];

const ROLE_ROUTES: Array<{ pattern: RegExp; roles: Role[] }> = [
  { pattern: /^\/dashboard\/admin/, roles: ['super_admin'] },
  { pattern: /^\/admin\/organizations/, roles: ['super_admin'] },
  { pattern: /^\/admin/,            roles: ['super_admin'] },
  { pattern: /^\/settings/,         roles: ['facility_manager', 'ngo_coordinator', 'auditor', 'super_admin'] },
  { pattern: /^\/dashboard\/ngo/,   roles: ['ngo_coordinator', 'super_admin'] },
  { pattern: /^\/dashboard\/field/, roles: ['field_agent', 'super_admin'] },
  { pattern: /^\/dashboard$/,       roles: ['facility_manager', 'field_agent', 'ngo_coordinator', 'auditor'] },
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

  // Fichiers statiques — laisser passer sans traitement
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Routes publiques — laisser passer sans JWT
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    // Si l'utilisateur est connecté et arrive sur / ou /login → redirect dashboard
    const token = req.cookies.get('vg_access')?.value;
    if (token && (pathname === '/' || pathname === '/login')) {
      const session = await verifyToken(token);
      if (session) {
        const url = req.nextUrl.clone();
        url.pathname = ROLE_DASHBOARDS[session.role as Role] ?? '/dashboard';
        return NextResponse.redirect(url);
      }
    }
    return NextResponse.next();
  }

  // Routes non protégées (ex: /contact, /legal/*) — laisser passer
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) {
    return NextResponse.next();
  }

  // À partir d'ici : route protégée — JWT obligatoire
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

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
