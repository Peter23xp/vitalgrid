import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { listAuditLog } from '@/lib/repos/audit';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return apiError('Non authentifié', 401);
  if (session.role !== 'super_admin' && session.role !== 'auditor') {
    return apiError('Accès refusé', 403);
  }

  try {
    const s = req.nextUrl.searchParams;
    const result = await listAuditLog(session.tenantId, {
      page:   Number(s.get('page')  ?? 1),
      limit:  Number(s.get('limit') ?? 50),
      userId: s.get('userId') ?? undefined,
    });
    return apiOk(result);
  } catch {
    return apiError('Erreur serveur', 500);
  }
}
