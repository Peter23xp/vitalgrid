import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { listUsers } from '@/lib/repos/users';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const tenantId = await requireTenant(req);
    const s = req.nextUrl.searchParams;
    const result = await listUsers(tenantId, {
      role:   s.get('role')   ?? undefined,
      status: s.get('status') ?? undefined,
      search: s.get('search') ?? undefined,
      page:   Number(s.get('page')  ?? 1),
      limit:  Number(s.get('limit') ?? 25),
    });
    return apiOk(result);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_UNAUTHENTICATED') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}
