import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { markRead } from '@/lib/repos/alerts';
import { apiOk, apiError } from '@/lib/types';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = requireTenant(req);
    const { id } = await params;
    const alert = await markRead(tenantId, id);
    if (!alert) return apiError('Alerte introuvable', 404);
    return apiOk(alert);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}
