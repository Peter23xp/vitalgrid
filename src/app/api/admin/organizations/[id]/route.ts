import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { getOrganizationDetail } from '@/lib/repos/organizations';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(req);
  if (!session) return apiError('Non authentifié', 401);
  if (session.role !== 'super_admin') return apiError('Accès refusé', 403);
  const { id } = await params;
  const detail = await getOrganizationDetail(id);
  if (!detail) return apiError('Organisation introuvable', 404);
  return apiOk(detail);
}
