import { NextRequest } from 'next/server';
import { requireSession } from '@/lib/tenant';
import { getTransfer, updateTransferStatus } from '@/lib/repos/transfers';
import { query } from '@/lib/db';
import { apiOk, apiError } from '@/lib/types';

// Actions réservées à l'établissement SOURCE (celui qui détient le stock)
const SOURCE_ONLY = ['confirmed', 'in_transit', 'delivered', 'incident'];
// Actions réservées à l'établissement DEMANDEUR (celui qui a initié)
const REQUESTER_ONLY = ['cancelled'];

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['in_transit', 'cancelled'],
  in_transit: ['delivered', 'incident'],
  delivered:  ['completed'],
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession(req);
    const { id } = await params;
    const transfer = await getTransfer(session.tenantId, id);
    if (!transfer) return apiError('Transfert introuvable', 404);

    // Enrich with facility and resource names
    const [facRows, resRow] = await Promise.all([
      query<{ id: string; name: string }>(
        `SELECT id, name FROM facilities WHERE id = ANY($1::uuid[])`,
        [[transfer.requesting_facility_id, transfer.source_facility_id].filter(Boolean)]
      ),
      query<{ id: string; name: string; unit_of_measure: string; category: string }>(
        `SELECT id, name, unit_of_measure, category FROM resources WHERE id = $1`,
        [transfer.resource_id]
      ),
    ]);

    const facMap = Object.fromEntries(facRows.map(f => [f.id, f.name]));

    return apiOk({
      ...transfer,
      requesting_facility_name: facMap[transfer.requesting_facility_id] ?? null,
      source_facility_name:     transfer.source_facility_id ? (facMap[transfer.source_facility_id] ?? null) : null,
      resource_name:            resRow[0]?.name ?? null,
      resource_unit:            resRow[0]?.unit_of_measure ?? null,
      resource_category:        resRow[0]?.category ?? null,
    });
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_UNAUTHENTICATED') return apiError('Non authentifié', 401);
    return apiError('Erreur serveur', 500);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession(req);
    const tenantId = session.tenantId;
    const { id } = await params;
    const body = await req.json();
    const { status, driver_name, driver_phone, vehicle_ref } = body;

    if (!status) return apiError('status requis');

    const current = await getTransfer(tenantId, id);
    if (!current) return apiError('Transfert introuvable', 404);

    const allowed = ALLOWED_TRANSITIONS[current.status] ?? [];
    if (!allowed.includes(status)) {
      return apiError(`Transition ${current.status} → ${status} non autorisée`, 400);
    }

    // Contrôle métier : seul l'établissement SOURCE peut approuver/expédier
    // Les rôles sans facility fixe (ngo_coordinator, super_admin) peuvent tout faire
    const userFacilityId = session.facilityId;
    if (userFacilityId) {
      if (SOURCE_ONLY.includes(status) && current.source_facility_id) {
        if (userFacilityId !== current.source_facility_id) {
          return apiError('Seul l\'établissement source peut approuver ou expédier ce transfert', 403);
        }
      }
      if (REQUESTER_ONLY.includes(status)) {
        if (userFacilityId !== current.requesting_facility_id) {
          return apiError('Seul l\'établissement demandeur peut annuler ce transfert', 403);
        }
      }
    }

    // Persist logistic info when moving to in_transit
    if (status === 'in_transit') {
      await query(
        `UPDATE transfers SET driver_name=$1, driver_phone=$2, vehicle_ref=$3, updated_at=NOW()
         WHERE tenant_id=$4 AND id=$5`,
        [driver_name ?? null, driver_phone ?? null, vehicle_ref ?? null, tenantId, id]
      );
    }

    const updated = await updateTransferStatus(tenantId, id, status);
    return apiOk(updated);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_UNAUTHENTICATED') return apiError('Non authentifié', 401);
    console.error('[api/transfers/[id] PATCH]', err.message);
    return apiError(err.message || 'Erreur serveur', 500);
  }
}
