import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { getOrganizationDetail, updateOrganization } from '@/lib/repos/organizations';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(req);
  if (!session) return apiError('Non authentifié', 401);
  const { id } = await params;
  if (session.orgId !== id && session.role !== 'super_admin') return apiError('Accès refusé', 403);
  const detail = await getOrganizationDetail(id);
  if (!detail) return apiError('Organisation introuvable', 404);
  return apiOk(detail.org);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(req);
  if (!session) return apiError('Non authentifié', 401);
  const { id } = await params;
  if (session.orgId !== id && session.role !== 'super_admin') return apiError('Accès refusé', 403);
  try {
    const body = await req.json();
    const org = await updateOrganization(id, { name: body.name, type: body.type, country_code: body.country_code });
    if (!org) return apiError('Organisation introuvable', 404);
    return apiOk(org);
  } catch (e: unknown) {
    return apiError((e as Error).message, 500);
  }
}
