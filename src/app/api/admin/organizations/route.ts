import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { listAllOrganizations } from '@/lib/repos/organizations';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return apiError('Non authentifié', 401);
  if (session.role !== 'super_admin') return apiError('Accès refusé', 403);
  const orgs = await listAllOrganizations();
  return apiOk(orgs);
}
