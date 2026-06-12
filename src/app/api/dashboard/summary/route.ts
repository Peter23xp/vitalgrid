import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { query } from '@/lib/db';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const tenantId = await requireTenant(req);
    const facilityId = req.nextUrl.searchParams.get('facilityId') || null;

    // Queries scoped by facility when provided, org-wide otherwise
    const [resources] = facilityId
      ? await query<{ count: string }>(
          'SELECT COUNT(*) AS count FROM resources WHERE tenant_id = $1 AND facility_id = $2',
          [tenantId, facilityId]
        )
      : await query<{ count: string }>(
          'SELECT COUNT(*) AS count FROM resources WHERE tenant_id = $1',
          [tenantId]
        );

    const [criticalAlerts] = facilityId
      ? await query<{ count: string }>(
          `SELECT COUNT(*) AS count FROM alerts
           WHERE tenant_id = $1 AND facility_id = $2 AND severity = 'critical' AND is_read = false`,
          [tenantId, facilityId]
        )
      : await query<{ count: string }>(
          `SELECT COUNT(*) AS count FROM alerts
           WHERE tenant_id = $1 AND severity = 'critical' AND is_read = false`,
          [tenantId]
        );

    const [activeTransfers] = facilityId
      ? await query<{ count: string }>(
          `SELECT COUNT(*) AS count FROM transfers
           WHERE tenant_id = $1 AND requesting_facility_id = $2
             AND status IN ('pending','confirmed','in_transit')`,
          [tenantId, facilityId]
        )
      : await query<{ count: string }>(
          `SELECT COUNT(*) AS count FROM transfers
           WHERE tenant_id = $1 AND status IN ('pending','confirmed','in_transit')`,
          [tenantId]
        );

    const [expiring] = facilityId
      ? await query<{ count: string }>(
          `SELECT COUNT(*) AS count FROM batches b
           JOIN resources r ON r.id = b.resource_id
           WHERE b.tenant_id = $1 AND r.facility_id = $2
             AND b.expiry_date <= CURRENT_DATE + INTERVAL '7 days'`,
          [tenantId, facilityId]
        )
      : await query<{ count: string }>(
          `SELECT COUNT(*) AS count FROM batches b
           WHERE b.tenant_id = $1
             AND b.expiry_date <= CURRENT_DATE + INTERVAL '7 days'`,
          [tenantId]
        );

    return apiOk({
      totalResources:  parseInt(resources?.count ?? '0', 10),
      criticalAlerts:  parseInt(criticalAlerts?.count ?? '0', 10),
      activeTransfers: parseInt(activeTransfers?.count ?? '0', 10),
      expiringIn7Days: parseInt(expiring?.count ?? '0', 10),
    });
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_UNAUTHENTICATED') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}
