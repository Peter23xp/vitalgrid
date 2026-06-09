import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { listResources, createResource } from '@/lib/repos/inventory';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const tenantId = await requireTenant(req);
    const s = req.nextUrl.searchParams;
    const result = await listResources(tenantId, {
      category: s.get('category') ?? undefined,
      status:   s.get('status')   ?? undefined,
      zone:     s.get('zone')     ?? undefined,
      search:   s.get('search')   ?? undefined,
      page:     Number(s.get('page')  ?? 1),
      limit:    Number(s.get('limit') ?? 25),
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
    if (!body.facility_id || !body.name || !body.category || !body.unit_of_measure) {
      return apiError('Champs requis manquants');
    }
    const resource = await createResource(tenantId, body);
    return apiOk(resource, 201);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_UNAUTHENTICATED') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}
