import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { listUsers } from '@/lib/repos/users';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return apiError('Non authentifié', 401);
  if (session.role !== 'super_admin') return apiError('Accès refusé', 403);

  try {
    const s = req.nextUrl.searchParams;
    const result = await listUsers(session.tenantId, {
      role:   s.get('role')   ?? undefined,
      status: s.get('status') ?? undefined,
      search: s.get('search') ?? undefined,
      page:   Number(s.get('page')  ?? 1),
      limit:  Number(s.get('limit') ?? 25),
    });
    return apiOk(result);
  } catch {
    return apiError('Erreur serveur', 500);
  }
}
