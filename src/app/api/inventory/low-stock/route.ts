import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { getLowStock } from '@/lib/repos/inventory';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const tenantId = await requireTenant(req);
    const facilityId = req.nextUrl.searchParams.get('facilityId');
    if (!facilityId) return apiError('facilityId requis');
    const resources = await getLowStock(tenantId, facilityId);
    return apiOk(resources);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_UNAUTHENTICATED') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}
