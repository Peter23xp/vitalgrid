import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, transact } from '@/lib/db';
import { apiError } from '@/lib/types';

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return apiError('Non authentifié', 401);
  if (session.role !== 'super_admin') return apiError('Accès refusé', 403);

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') ?? '';
  const limit  = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 200);
  const offset = parseInt(searchParams.get('offset') ?? '0', 10);

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows, countRows] = await Promise.all([
    query<{
      id: string; first_name: string; last_name: string; email: string;
      organization: string; role: string; country_code: string;
      message: string | null; status: string; created_at: string;
    }>(
      `SELECT id, first_name, last_name, email, organization, role, country_code, message, status, created_at
       FROM access_requests ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    ),
    query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM access_requests ${where}`,
      params
    ),
  ]);

  return NextResponse.json({
    data:  rows,
    total: parseInt(countRows[0]?.count ?? '0', 10),
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return apiError('Non authentifié', 401);
  if (session.role !== 'super_admin') return apiError('Accès refusé', 403);

  const { id, status } = await req.json();
  if (!id || !status) return apiError('id et status requis');

  const allowed = ['pending', 'contacted', 'approved', 'rejected'];
  if (!allowed.includes(status)) return apiError('Statut invalide');

  await transact(async (client) => {
    await client.query(
      `UPDATE access_requests SET status = $1 WHERE id = $2`,
      [status, id]
    );
  });

  return NextResponse.json({ success: true });
}
