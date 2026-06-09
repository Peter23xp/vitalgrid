import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import type { Role } from '@/lib/types';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export interface SessionPayload extends JWTPayload {
  userId:     string;
  tenantId:   string;
  orgId:      string;
  facilityId: string | null;
  role:       Role;
  email:      string;
  name:       string;
}

export async function signAccessToken(payload: Omit<SessionPayload, keyof JWTPayload>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);
}

export async function signRefreshToken(
  userId: string,
  rememberMe: boolean
): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(rememberMe ? '30d' : '24h')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get('vg_access')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function setAuthCookies(
  res: NextResponse,
  accessToken: string,
  refreshToken: string,
  rememberMe: boolean
): void {
  const secure  = process.env.NODE_ENV === 'production';
  const base    = { httpOnly: true, secure, sameSite: 'strict' as const, path: '/' };

  res.cookies.set('vg_access',  accessToken,  { ...base, maxAge: 3600 });
  res.cookies.set('vg_refresh', refreshToken, {
    ...base,
    path:   '/api/auth/refresh',
    maxAge: rememberMe ? 30 * 24 * 3600 : 24 * 3600,
  });
}

export function clearAuthCookies(res: NextResponse): void {
  res.cookies.set('vg_access',  '', { httpOnly: true, maxAge: 0, path: '/' });
  res.cookies.set('vg_refresh', '', { httpOnly: true, maxAge: 0, path: '/api/auth/refresh' });
}

export function roleRedirect(role: Role): string {
  const map: Record<Role, string> = {
    super_admin:       '/dashboard/admin',
    facility_manager:  '/dashboard',
    field_agent:       '/dashboard/field',
    ngo_coordinator:   '/dashboard/ngo',
    auditor:           '/analytics/map',
  };
  return map[role] ?? '/dashboard';
}
