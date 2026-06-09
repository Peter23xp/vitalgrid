import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { listFacilities, createFacility } from '@/lib/repos/facilities';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const tenantId = requireTenant(req);
    const s = req.nextUrl.searchParams;
    const result = await listFacilities(tenantId, {
      type:   s.get('type')   ?? undefined,
      region: s.get('region') ?? undefined,
      status: s.get('status') ?? undefined,
      search: s.get('search') ?? undefined,
      page:   Number(s.get('page')  ?? 1),
      limit:  Number(s.get('limit') ?? 25),
    });
    return apiOk(result);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = requireTenant(req);
    const body = await req.json();
    if (!body.name || !body.type || !body.country_code || !body.org_id) {
      return apiError('Champs requis manquants');
    }
    const facility = await createFacility(tenantId, body.org_id, body);
    return apiOk(facility, 201);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}
