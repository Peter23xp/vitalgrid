import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return apiError('Non authentifié', 401);
  if (session.role !== 'super_admin') return apiError('Accès refusé', 403);

  const [orgs]       = await query<{ count: string }>('SELECT COUNT(*) AS count FROM organizations');
  const [facilities] = await query<{ count: string }>('SELECT COUNT(*) AS count FROM facilities');
  const [users]      = await query<{ count: string }>('SELECT COUNT(*) AS count FROM users');
  const recentOrgs   = await query(
    `SELECT id, name, type, country_code,
       (SELECT COUNT(*) FROM facilities f WHERE f.org_id = o.id) AS "facilitiesCount"
     FROM organizations o ORDER BY created_at DESC LIMIT 5`
  );

  return apiOk({
    orgs:       parseInt(orgs?.count ?? '0', 10),
    facilities: parseInt(facilities?.count ?? '0', 10),
    users:      parseInt(users?.count ?? '0', 10),
    recentOrgs,
  });
}
