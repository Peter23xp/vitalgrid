import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { confirmReceipt } from '@/lib/repos/transfers';
import { logAction } from '@/lib/repos/audit';
import { apiOk, apiError } from '@/lib/types';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = requireTenant(req);
    const { id } = await params;
    const body = await req.json();
    if (!body.received_qty || body.packaging_ok === undefined || !body.condition) {
      return apiError('Champs requis manquants');
    }
    const transfer = await confirmReceipt(tenantId, id, body);
    await logAction(tenantId, {
      action: 'confirm_receipt',
      detail: `Transfert ${transfer.ref} confirmé reçu (${body.received_qty} unités)`,
    });
    return apiOk(transfer);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    if (err.message === 'ERR_ALREADY_CONFIRMED') return apiError('Déjà confirmé', 409);
    if (err.message === 'ERR_TRANSFER_NOT_FOUND') return apiError('Transfert introuvable', 404);
    return apiError('Erreur serveur', 500);
  }
}
