import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { getResource } from '@/lib/repos/inventory';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = requireTenant(req);
    const { id } = await params;
    const resource = await getResource(tenantId, id);
    if (!resource) return apiError('Ressource introuvable', 404);
    return apiOk(resource);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}
