import { query, queryOne, transact } from '@/lib/db';
import type { User } from '@/lib/types';

export async function listUsers(
  tenantId: string,
  opts: { role?: string; status?: string; search?: string; page?: number; limit?: number }
): Promise<{ data: User[]; total: number }> {
  const conditions = ['tenant_id = $1'];
  const params: unknown[] = [tenantId];
  let i = 2;

  if (opts.role)   { conditions.push(`role = $${i++}`);   params.push(opts.role); }
  if (opts.status) { conditions.push(`status = $${i++}`); params.push(opts.status); }
  if (opts.search) { conditions.push(`(name ILIKE $${i} OR email ILIKE $${i++})`); params.push(`%${opts.search}%`); }

  const where = conditions.join(' AND ');
  const limit = opts.limit ?? 25;
  const offset = ((opts.page ?? 1) - 1) * limit;

  const [countRow] = await query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM users WHERE ${where}`, params
  );
  const total = parseInt(countRow?.count ?? '0', 10);

  params.push(limit, offset);
  const data = await query<User>(
    `SELECT id,tenant_id,org_id,facility_id,email,name,role,zone,status,last_login_at,created_at
     FROM users WHERE ${where} ORDER BY name LIMIT $${i} OFFSET $${i + 1}`,
    params
  );
  return { data, total };
}

export async function getUser(tenantId: string, id: string): Promise<User | null> {
  return queryOne<User>(
    `SELECT id,tenant_id,org_id,facility_id,email,name,role,zone,status,last_login_at,created_at
     FROM users WHERE tenant_id = $1 AND id = $2`,
    [tenantId, id]
  );
}

export async function updateUserStatus(tenantId: string, id: string, status: string): Promise<User | null> {
  return transact(async (client) => {
    const res = await client.query<User>(
      `UPDATE users SET status = $1, updated_at = NOW()
       WHERE tenant_id = $2 AND id = $3 RETURNING *`,
      [status, tenantId, id]
    );
    return res.rows[0] ?? null;
  });
}
