import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  return NextResponse.json({
    id:         session.userId,
    email:      session.email,
    name:       session.name,
    role:       session.role,
    tenantId:   session.tenantId,
    orgId:      session.orgId,
    facilityId: session.facilityId,
  });
}
