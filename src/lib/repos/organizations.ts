import { query, queryOne, transact } from '@/lib/db';
import type { Organization } from '@/lib/types';

export async function listAllOrganizations(): Promise<(Organization & { facilitiesCount: number; usersCount: number })[]> {
  return query(
    `SELECT o.*,
       (SELECT COUNT(*) FROM facilities f WHERE f.org_id = o.id) AS "facilitiesCount",
       (SELECT COUNT(*) FROM users u WHERE u.org_id = o.id)      AS "usersCount"
     FROM organizations o
     ORDER BY o.created_at DESC`
  );
}

export async function getOrganizationDetail(id: string) {
  const org = await queryOne<Organization>('SELECT * FROM organizations WHERE id = $1', [id]);
  if (!org) return null;
  const facilities = await query('SELECT * FROM facilities WHERE org_id = $1 ORDER BY name', [id]);
  const users = await query(
    `SELECT id, name, email, role, facility_id, status FROM users WHERE org_id = $1 ORDER BY name`,
    [id]
  );
  return { org, facilities, users };
}

export async function updateOrganization(id: string, data: {
  name?: string; type?: string; country_code?: string;
}): Promise<Organization | null> {
  const fields: string[] = [];
  const vals: unknown[]  = [];
  let i = 1;
  if (data.name)         { fields.push(`name = $${i++}`);         vals.push(data.name); }
  if (data.type)         { fields.push(`type = $${i++}`);         vals.push(data.type); }
  if (data.country_code) { fields.push(`country_code = $${i++}`); vals.push(data.country_code); }
  if (fields.length === 0) return queryOne<Organization>('SELECT * FROM organizations WHERE id = $1', [id]);
  vals.push(id);
  return transact(async (client) => {
    const res = await client.query<Organization>(
      `UPDATE organizations SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      vals
    );
    return res.rows[0] ?? null;
  });
}

export async function createOrganization(data: {
  name: string; type: string; country_code: string; regions?: string[];
}): Promise<Organization> {
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 100);
  return transact(async (client) => {
    const res = await client.query<Organization>(
      `INSERT INTO organizations (name, type, country_code, regions, slug)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.name, data.type, data.country_code,
       JSON.stringify(data.regions ?? []), slug]
    );
    return res.rows[0];
  });
}
