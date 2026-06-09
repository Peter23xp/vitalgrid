import { query, queryOne, transact } from '@/lib/db';
import type { Facility, Organization } from '@/lib/types';

export async function listFacilities(
  tenantId: string,
  opts: { type?: string; region?: string; status?: string; search?: string; page?: number; limit?: number }
): Promise<{ data: Facility[]; total: number }> {
  const conditions = ['tenant_id = $1'];
  const params: unknown[] = [tenantId];
  let i = 2;

  if (opts.type)   { conditions.push(`type = $${i++}`);     params.push(opts.type); }
  if (opts.region) { conditions.push(`region = $${i++}`);   params.push(opts.region); }
  if (opts.status) { conditions.push(`status = $${i++}`);   params.push(opts.status); }
  if (opts.search) { conditions.push(`name ILIKE $${i++}`); params.push(`%${opts.search}%`); }

  const where = conditions.join(' AND ');
  const limit = opts.limit ?? 25;
  const offset = ((opts.page ?? 1) - 1) * limit;

  const [countRow] = await query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM facilities WHERE ${where}`, params
  );
  const total = parseInt(countRow?.count ?? '0', 10);

  params.push(limit, offset);
  const data = await query<Facility>(
    `SELECT * FROM facilities WHERE ${where} ORDER BY name LIMIT $${i} OFFSET $${i + 1}`,
    params
  );
  return { data, total };
}

export async function getFacility(tenantId: string, id: string): Promise<Facility | null> {
  return queryOne<Facility>(
    'SELECT * FROM facilities WHERE tenant_id = $1 AND id = $2',
    [tenantId, id]
  );
}

export async function createFacility(
  tenantId: string, orgId: string,
  data: { name: string; type: string; country_code: string; region?: string; address?: string; lat?: number; lng?: number; contact_name?: string; contact_phone?: string; contact_email?: string; storage_zones?: string[]; bed_capacity?: number }
): Promise<Facility> {
  return transact(async (client) => {
    const res = await client.query<Facility>(
      `INSERT INTO facilities
         (tenant_id, org_id, name, type, country_code, region, address, lat, lng,
          contact_name, contact_phone, contact_email, storage_zones, bed_capacity)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [tenantId, orgId, data.name, data.type, data.country_code, data.region ?? null,
       data.address ?? null, data.lat ?? null, data.lng ?? null,
       data.contact_name ?? null, data.contact_phone ?? null, data.contact_email ?? null,
       JSON.stringify(data.storage_zones ?? []), data.bed_capacity ?? null]
    );
    return res.rows[0];
  });
}

export async function getOrganization(id: string): Promise<Organization | null> {
  return queryOne<Organization>('SELECT * FROM organizations WHERE id = $1', [id]);
}

export async function createOrganization(
  data: { name: string; type: string; country_code: string; regions?: string[]; logo_url?: string }
): Promise<Organization> {
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 100);
  return transact(async (client) => {
    const res = await client.query<Organization>(
      `INSERT INTO organizations (name, type, country_code, regions, logo_url, slug)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [data.name, data.type, data.country_code,
       JSON.stringify(data.regions ?? []), data.logo_url ?? null, slug]
    );
    return res.rows[0];
  });
}
