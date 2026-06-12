import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { getFacility, getFacilityById } from '@/lib/repos/facilities';
import { getSession } from '@/lib/auth';
import { transact } from '@/lib/db';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession(req);
    if (!session) return apiError('Non authentifié', 401);
    const { id } = await params;
    // Pas de filtre tenant — une facility régionale (autre org) doit être lisible
    const facility = await getFacilityById(id);
    if (!facility) return apiError('Établissement introuvable', 404);
    return apiOk(facility);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_UNAUTHENTICATED') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = await requireTenant(req);
    const { id } = await params;
    const body = await req.json();

    const allowed = ['name', 'type', 'region', 'address', 'lat', 'lng',
                     'contact_name', 'contact_phone', 'contact_email',
                     'bed_capacity', 'status'] as const;

    const sets: string[] = [];
    const vals: unknown[] = [tenantId, id];
    let i = 3;
    for (const key of allowed) {
      if (key in body) {
        sets.push(`${key} = $${i++}`);
        vals.push(body[key] ?? null);
      }
    }
    if (sets.length === 0) return apiError('Aucun champ à mettre à jour');

    sets.push(`updated_at = NOW()`);

    const updated = await transact(async (client) => {
      const res = await client.query(
        `UPDATE facilities SET ${sets.join(', ')}
         WHERE tenant_id = $1 AND id = $2
         RETURNING *`,
        vals
      );
      return res.rows[0] ?? null;
    });

    if (!updated) return apiError('Établissement introuvable', 404);
    return apiOk(updated);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_UNAUTHENTICATED') return apiError('Non authentifié', 401);
    return apiError('Erreur serveur', 500);
  }
}
