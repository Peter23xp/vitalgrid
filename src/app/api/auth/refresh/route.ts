import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, signAccessToken } from '@/lib/auth';
import { queryOne } from '@/lib/db';
import type { Role } from '@/lib/types';

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('vg_refresh')?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: 'Refresh token manquant' }, { status: 401 });
  }

  const payload = await verifyToken(refreshToken);
  if (!payload || !payload.userId) {
    return NextResponse.json({ error: 'Refresh token invalide' }, { status: 401 });
  }

  const user = await queryOne<{
    id: string; email: string; name: string; role: Role;
    tenant_id: string; org_id: string; facility_id: string | null; status: string;
  }>(
    `SELECT id, email, name, role, tenant_id, org_id, facility_id, status
     FROM users WHERE id = $1`,
    [payload.userId as string]
  );

  if (!user || user.status !== 'active') {
    return NextResponse.json({ error: 'Utilisateur inactif' }, { status: 401 });
  }

  const accessToken = await signAccessToken({
    userId:     user.id,
    tenantId:   user.tenant_id,
    orgId:      user.org_id,
    facilityId: user.facility_id,
    role:       user.role,
    email:      user.email,
    name:       user.name,
  });

  const res = NextResponse.json({ success: true });
  res.cookies.set('vg_access', accessToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path:     '/',
    maxAge:   3600,
  });
  return res;
}
