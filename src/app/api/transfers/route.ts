import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { listTransfers, createTransfer } from '@/lib/repos/transfers';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const tenantId = await requireTenant(req);
    const s = req.nextUrl.searchParams;
    const result = await listTransfers(tenantId, {
      facilityId: s.get('facilityId') ?? undefined,
      status:     s.get('status')     ?? undefined,
      page:  Number(s.get('page')  ?? 1),
      limit: Number(s.get('limit') ?? 25),
    });
    return apiOk(result);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_UNAUTHENTICATED') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = await requireTenant(req);
    const body = await req.json();
    if (!body.resource_id || !body.quantity || !body.requesting_facility_id) {
      return apiError('Champs requis manquants');
    }
    const transfer = await createTransfer(tenantId, body);
    return apiOk(transfer, 201);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_UNAUTHENTICATED') return apiError('x-tenant-id header requis', 401);
    if (err.message === 'ERR_RESOURCE_NOT_FOUND') return apiError('Ressource introuvable', 404);
    return apiError('Erreur serveur', 500);
  }
}
