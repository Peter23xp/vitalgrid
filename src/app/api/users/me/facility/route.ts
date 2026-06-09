import { NextRequest, NextResponse } from 'next/server';
import { getSession, signAccessToken } from '@/lib/auth';
import { transact } from '@/lib/db';
import { apiError } from '@/lib/types';

export async function PATCH(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return apiError('Non authentifié', 401);

  const { facilityId } = await req.json();
  if (!facilityId) return apiError('facilityId requis');

  await transact(async (client) => {
    await client.query(
      `UPDATE users SET facility_id = $1, updated_at = NOW() WHERE id = $2`,
      [facilityId, session.userId]
    );
  });

  const accessToken = await signAccessToken({
    userId:     session.userId,
    tenantId:   session.tenantId,
    orgId:      session.orgId,
    facilityId,
    role:       session.role,
    email:      session.email,
    name:       session.name,
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
