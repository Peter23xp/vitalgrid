import { NextRequest } from 'next/server';

export function getTenantId(req: NextRequest): string | null {
  return req.headers.get('x-tenant-id');
}

export function requireTenant(req: NextRequest): string {
  const id = getTenantId(req);
  if (!id) throw new Error('ERR_NO_TENANT');
  return id;
}
