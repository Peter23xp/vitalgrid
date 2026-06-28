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

    // Enrich with facility/resource names when requested
    if (s.get('enrich') === '1' && result.data.length > 0) {
      const { query } = await import('@/lib/db');
      const facilityIds = [...new Set([
        ...result.data.map((t) => t.requesting_facility_id),
        ...result.data.map((t) => t.source_facility_id).filter(Boolean) as string[],
      ])];
      const resourceIds = [...new Set(result.data.map((t) => t.resource_id).filter(Boolean))];

      const [facilities, resources] = await Promise.all([
        facilityIds.length
          ? query<{ id: string; name: string }>(`SELECT id, name FROM facilities WHERE id = ANY($1::uuid[])`, [facilityIds])
          : [],
        resourceIds.length
          ? query<{ id: string; name: string }>(`SELECT id, name FROM resources WHERE id = ANY($1::uuid[])`, [resourceIds])
          : [],
      ]);

      const facMap = Object.fromEntries(facilities.map((f) => [f.id, f.name]));
      const resMap = Object.fromEntries(resources.map((r) => [r.id, r.name]));

      const enriched = result.data.map((t) => ({
        ...t,
        requesting_facility_name: facMap[t.requesting_facility_id] ?? null,
        source_facility_name:     t.source_facility_id ? (facMap[t.source_facility_id] ?? null) : null,
        resource_name:            resMap[t.resource_id] ?? null,
      }));
      return apiOk({ ...result, data: enriched });
    }

    return apiOk(result);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_UNAUTHENTICATED') return apiError('x-tenant-id header requis', 401);
    console.error('[api/transfers GET]', err.message);
    return apiError(err.message || 'Erreur serveur', 500);
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
