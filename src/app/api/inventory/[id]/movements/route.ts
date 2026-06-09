import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { getMovements } from '@/lib/repos/inventory';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = await requireTenant(req);
    const { id } = await params;
    const movements = await getMovements(tenantId, id);
    return apiOk(movements);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_UNAUTHENTICATED') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}
