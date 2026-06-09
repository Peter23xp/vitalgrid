import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { getBatchesForResource, addBatch } from '@/lib/repos/inventory';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = requireTenant(req);
    const { id } = await params;
    const batches = await getBatchesForResource(tenantId, id);
    return apiOk(batches);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = requireTenant(req);
    const { id } = await params;
    const body = await req.json();
    if (!body.batch_number || !body.quantity || !body.expiry_date) {
      return apiError('Champs requis manquants');
    }
    const batch = await addBatch(tenantId, { ...body, resource_id: id });
    return apiOk(batch, 201);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}
