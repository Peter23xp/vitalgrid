import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { getTransfer, updateTransferStatus } from '@/lib/repos/transfers';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = requireTenant(req);
    const { id } = await params;
    const transfer = await getTransfer(tenantId, id);
    if (!transfer) return apiError('Transfert introuvable', 404);
    return apiOk(transfer);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = requireTenant(req);
    const { id } = await params;
    const { status } = await req.json();
    if (!status) return apiError('status requis');
    const transfer = await updateTransferStatus(tenantId, id, status);
    if (!transfer) return apiError('Transfert introuvable', 404);
    return apiOk(transfer);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}
