import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';

export async function requireTenant(req: NextRequest): Promise<string> {
  const session = await getSession(req);
  if (!session) throw new Error('ERR_UNAUTHENTICATED');
  return session.tenantId as string;
}

export async function requireSession(req: NextRequest) {
  const session = await getSession(req);
  if (!session) throw new Error('ERR_UNAUTHENTICATED');
  return session;
}
