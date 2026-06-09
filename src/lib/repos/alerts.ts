import { query, transact } from '@/lib/db';
import type { Alert } from '@/lib/types';

export async function listAlerts(
  tenantId: string,
  opts: { facilityId?: string; read?: boolean; severity?: string; page?: number; limit?: number }
): Promise<{ data: Alert[]; unreadCount: number }> {
  const conditions = ['tenant_id = $1'];
  const params: unknown[] = [tenantId];
  let i = 2;

  if (opts.facilityId) { conditions.push(`facility_id = $${i++}`); params.push(opts.facilityId); }
  if (opts.read !== undefined) { conditions.push(`is_read = $${i++}`); params.push(opts.read); }
  if (opts.severity) { conditions.push(`severity = $${i++}`); params.push(opts.severity); }

  const where = conditions.join(' AND ');
  const data = await query<Alert>(
    `SELECT * FROM alerts WHERE ${where} ORDER BY created_at DESC LIMIT ${opts.limit ?? 50}`,
    params
  );

  const [countRow] = await query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM alerts WHERE tenant_id = $1 AND is_read = false`,
    [tenantId]
  );

  return { data, unreadCount: parseInt(countRow?.count ?? '0', 10) };
}

export async function markRead(tenantId: string, id: string): Promise<Alert | null> {
  return transact(async (client) => {
    const res = await client.query<Alert>(
      `UPDATE alerts SET is_read = true WHERE tenant_id = $1 AND id = $2 RETURNING *`,
      [tenantId, id]
    );
    return res.rows[0] ?? null;
  });
}

export async function createAlert(
  tenantId: string,
  data: { facility_id: string; resource_id?: string; transfer_id?: string; alert_type: string; severity: string; title: string; description?: string }
): Promise<Alert> {
  return transact(async (client) => {
    const res = await client.query<Alert>(
      `INSERT INTO alerts (tenant_id, facility_id, resource_id, transfer_id, alert_type, severity, title, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [tenantId, data.facility_id, data.resource_id ?? null, data.transfer_id ?? null,
       data.alert_type, data.severity, data.title, data.description ?? null]
    );
    return res.rows[0];
  });
}
