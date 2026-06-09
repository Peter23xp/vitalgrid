import { query, transact } from '@/lib/db';
import type { AuditEntry } from '@/lib/types';

export async function logAction(
  tenantId: string,
  data: { user_id?: string; user_label?: string; action: string; detail?: string; result?: string }
): Promise<void> {
  await transact(async (client) => {
    await client.query(
      `INSERT INTO audit_log (tenant_id, user_id, user_label, action, detail, result)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [tenantId, data.user_id ?? null, data.user_label ?? null,
       data.action, data.detail ?? null, data.result ?? 'success']
    );
  });
}

export async function listAuditLog(
  tenantId: string,
  opts: { page?: number; limit?: number; userId?: string }
): Promise<{ data: AuditEntry[]; total: number }> {
  const conditions = ['tenant_id = $1'];
  const params: unknown[] = [tenantId];
  let i = 2;

  if (opts.userId) { conditions.push(`user_id = $${i++}`); params.push(opts.userId); }

  const where = conditions.join(' AND ');
  const limit = opts.limit ?? 50;
  const offset = ((opts.page ?? 1) - 1) * limit;

  const [countRow] = await query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM audit_log WHERE ${where}`, params
  );
  const total = parseInt(countRow?.count ?? '0', 10);

  params.push(limit, offset);
  const data = await query<AuditEntry>(
    `SELECT * FROM audit_log WHERE ${where} ORDER BY created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
    params
  );
  return { data, total };
}
