import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { listAlerts, createAlert } from '@/lib/repos/alerts';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const tenantId = await requireTenant(req);
    const s = req.nextUrl.searchParams;
    const readParam = s.get('read');
    const result = await listAlerts(tenantId, {
      facilityId: s.get('facilityId') ?? undefined,
      read:       readParam !== null ? readParam === 'true' : undefined,
      severity:   s.get('severity')   ?? undefined,
      limit:      Number(s.get('limit') ?? 50),
    });
    return apiOk(result);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_UNAUTHENTICATED') return apiError('Non authentifié', 401);
    console.error('[api/alerts GET]', err.message, err);
    return apiError(err.message || 'Erreur serveur', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = await requireTenant(req);
    const body = await req.json();
    if (!body.facility_id || !body.alert_type || !body.severity || !body.title) {
      return apiError('Champs requis manquants');
    }
    const alert = await createAlert(tenantId, body);
    return apiOk(alert, 201);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_UNAUTHENTICATED') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}
