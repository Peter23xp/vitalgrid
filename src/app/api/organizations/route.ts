import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createOrganization, listAllOrganizations } from '@/lib/repos/organizations';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return apiError('Non authentifié', 401);
  if (session.role !== 'super_admin') return apiError('Accès refusé', 403);
  const orgs = await listAllOrganizations();
  return apiOk(orgs);
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return apiError('Non authentifié', 401);
  const body = await req.json();
  if (!body.name || !body.type || !body.country_code) {
    return apiError('name, type et country_code sont requis');
  }
  try {
    const org = await createOrganization(body);
    return NextResponse.json(org, { status: 201 });
  } catch (e: unknown) {
    return apiError((e as Error).message, 500);
  }
}
