import { query, queryOne, transact } from '@/lib/db';
import type { Resource, Batch, InventoryMovement, PaginatedResponse } from '@/lib/types';

export async function listResources(
  tenantId: string,
  opts: { category?: string; status?: string; zone?: string; search?: string; page?: number; limit?: number }
): Promise<PaginatedResponse<Resource>> {
  const page = opts.page ?? 1;
  const limit = opts.limit ?? 25;
  const offset = (page - 1) * limit;

  const conditions: string[] = ['tenant_id = $1'];
  const params: unknown[] = [tenantId];
  let i = 2;

  if (opts.category) { conditions.push(`category = $${i++}`); params.push(opts.category); }
  if (opts.zone)     { conditions.push(`zone = $${i++}`);     params.push(opts.zone); }
  if (opts.search)   { conditions.push(`(name ILIKE $${i++} OR dci ILIKE $${i++})`); params.push(`%${opts.search}%`, `%${opts.search}%`); }
  if (opts.status === 'critical') { conditions.push(`total_quantity <= alert_threshold`); }
  if (opts.status === 'ok')       { conditions.push(`total_quantity > alert_threshold`); }

  const where = conditions.join(' AND ');

  const [countRow] = await query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM resources WHERE ${where}`, params
  );
  const total = parseInt(countRow?.count ?? '0', 10);

  params.push(limit, offset);
  const data = await query<Resource>(
    `SELECT * FROM resources WHERE ${where}
     ORDER BY CASE WHEN total_quantity <= alert_threshold THEN 0 ELSE 1 END, name
     LIMIT $${i} OFFSET $${i + 1}`,
    params
  );

  return { data, total, page, limit };
}

export async function getResource(tenantId: string, id: string): Promise<Resource | null> {
  return queryOne<Resource>(
    'SELECT * FROM resources WHERE tenant_id = $1 AND id = $2',
    [tenantId, id]
  );
}

export async function getBatchesForResource(tenantId: string, resourceId: string): Promise<Batch[]> {
  return query<Batch>(
    'SELECT * FROM batches WHERE tenant_id = $1 AND resource_id = $2 ORDER BY expiry_date ASC',
    [tenantId, resourceId]
  );
}

export async function getMovements(tenantId: string, resourceId: string): Promise<InventoryMovement[]> {
  return query<InventoryMovement>(
    `SELECT * FROM inventory_movements
     WHERE tenant_id = $1 AND resource_id = $2
     ORDER BY created_at DESC LIMIT 30`,
    [tenantId, resourceId]
  );
}

export async function getLowStock(tenantId: string, facilityId: string): Promise<Resource[]> {
  return query<Resource>(
    `SELECT * FROM resources
     WHERE tenant_id = $1 AND facility_id = $2 AND total_quantity <= alert_threshold
     ORDER BY total_quantity ASC`,
    [tenantId, facilityId]
  );
}

export async function getExpiring(tenantId: string, facilityId: string, daysAhead = 30): Promise<Batch[]> {
  return query<Batch>(
    `SELECT b.*, r.name AS resource_name, r.unit_of_measure
     FROM batches b
     JOIN resources r ON r.id = b.resource_id
     WHERE b.tenant_id = $1 AND r.facility_id = $2
       AND b.expiry_date <= CURRENT_DATE + INTERVAL '1 day' * $3
     ORDER BY b.expiry_date ASC`,
    [tenantId, facilityId, daysAhead]
  );
}

export async function createResource(
  tenantId: string,
  data: { facility_id: string; name: string; dci?: string; category: string; zone?: string; unit_of_measure: string; alert_threshold?: number; location?: string; notes?: string }
): Promise<Resource> {
  return transact(async (client) => {
    const res = await client.query<Resource>(
      `INSERT INTO resources (tenant_id, facility_id, name, dci, category, zone, unit_of_measure, alert_threshold, location, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [tenantId, data.facility_id, data.name, data.dci ?? null, data.category, data.zone ?? null,
       data.unit_of_measure, data.alert_threshold ?? 0, data.location ?? null, data.notes ?? null]
    );
    return res.rows[0];
  });
}

export async function addBatch(
  tenantId: string,
  data: { resource_id: string; batch_number: string; quantity: number; expiry_date: string; supplier?: string; order_number?: string }
): Promise<Batch> {
  return transact(async (client) => {
    const batchRes = await client.query<Batch>(
      `INSERT INTO batches (tenant_id, resource_id, batch_number, quantity, expiry_date, supplier, order_number)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [tenantId, data.resource_id, data.batch_number, data.quantity, data.expiry_date,
       data.supplier ?? null, data.order_number ?? null]
    );
    await client.query(
      `UPDATE resources SET total_quantity = total_quantity + $1, updated_at = NOW()
       WHERE tenant_id = $2 AND id = $3`,
      [data.quantity, tenantId, data.resource_id]
    );
    await client.query(
      `INSERT INTO inventory_movements (tenant_id, resource_id, batch_id, delta, reason)
       VALUES ($1,$2,$3,$4,'Ajout lot')`,
      [tenantId, data.resource_id, batchRes.rows[0].id, data.quantity]
    );
    return batchRes.rows[0];
  });
}
