import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { getExpiring } from '@/lib/repos/inventory';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const tenantId = requireTenant(req);
    const s = req.nextUrl.searchParams;
    const facilityId = s.get('facilityId');
    if (!facilityId) return apiError('facilityId requis');
    const daysAhead = Number(s.get('daysAhead') ?? 30);
    const batches = await getExpiring(tenantId, facilityId, daysAhead);
    return apiOk(batches);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}
