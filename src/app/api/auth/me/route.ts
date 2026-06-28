import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { queryOne } from '@/lib/db';

// Always read facility_id from DB — JWT may be stale after reassignment
export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const fresh = await queryOne<{ facility_id: string | null }>(
    'SELECT facility_id FROM users WHERE id = $1',
    [session.userId]
  );

  return NextResponse.json({
    id:         session.userId,
    email:      session.email,
    name:       session.name,
    role:       session.role,
    tenantId:   session.tenantId,
    orgId:      session.orgId,
    facilityId: fresh?.facility_id ?? session.facilityId,
  });
}
