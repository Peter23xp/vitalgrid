import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { getTransfer, updateTransferStatus } from '@/lib/repos/transfers';
import { query } from '@/lib/db';
import { apiOk, apiError } from '@/lib/types';

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['in_transit', 'cancelled'],
  in_transit: ['delivered', 'incident'],
  delivered:  ['completed'],
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = await requireTenant(req);
    const { id } = await params;
    const transfer = await getTransfer(tenantId, id);
    if (!transfer) return apiError('Transfert introuvable', 404);
    return apiOk(transfer);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_UNAUTHENTICATED') return apiError('Non authentifié', 401);
    return apiError('Erreur serveur', 500);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = await requireTenant(req);
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
