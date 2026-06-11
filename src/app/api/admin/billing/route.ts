import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, transact } from '@/lib/db';
import { apiError } from '@/lib/types';

const PLANS: Record<string, { label: string; priceUsd: number; maxFacilities: number | null; maxUsers: number | null }> = {
  freemium:   { label: 'Freemium',   priceUsd: 0,   maxFacilities: 5,    maxUsers: 20   },
  standard:   { label: 'Standard',   priceUsd: 199, maxFacilities: 50,   maxUsers: 200  },
  enterprise: { label: 'Enterprise', priceUsd: 0,   maxFacilities: null, maxUsers: null },
};

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id        UUID         NOT NULL UNIQUE,
      plan          VARCHAR(20)  NOT NULL DEFAULT 'freemium',
      status        VARCHAR(20)  NOT NULL DEFAULT 'active',
      mrr_usd_cents INTEGER      NOT NULL DEFAULT 0,
      renewal_at    TIMESTAMPTZ,
      trial_ends_at TIMESTAMPTZ,
      notes         TEXT,
      created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `);
  // Insérer une ligne freemium pour chaque org qui n'en a pas encore
  await query(`
    INSERT INTO subscriptions (org_id, plan, status)
    SELECT id, 'freemium', 'active' FROM organizations
    WHERE id NOT IN (SELECT org_id FROM subscriptions)
  `);
}

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return apiError('Non authentifié', 401);
  if (session.role !== 'super_admin') return apiError('Accès refusé', 403);

  await ensureTable();

  const rows = await query<{
    org_id: string; org_name: string; country_code: string;
    plan: string; status: string; mrr_usd_cents: number;
    renewal_at: string | null; trial_ends_at: string | null; notes: string | null;
    sub_created_at: string;
    facilities_count: string; users_count: string;
  }>(`
    SELECT
      s.org_id,
      o.name          AS org_name,
      o.country_code,
      s.plan,
      s.status,
      s.mrr_usd_cents,
      s.renewal_at,
      s.trial_ends_at,
      s.notes,
      s.created_at    AS sub_created_at,
      (SELECT COUNT(*) FROM facilities f WHERE f.org_id = o.id)::text AS facilities_count,
      (SELECT COUNT(*) FROM users     u WHERE u.org_id = o.id)::text AS users_count
    FROM subscriptions s
    JOIN organizations o ON o.id = s.org_id
    ORDER BY s.mrr_usd_cents DESC, o.name ASC
  `);

  const data = rows.map((r) => ({
    ...r,
    planInfo:       PLANS[r.plan] ?? PLANS.freemium,
    facilitiesCount: parseInt(r.facilities_count, 10),
    usersCount:      parseInt(r.users_count, 10),
  }));

  const totalMrr = rows.reduce((sum, r) => sum + r.mrr_usd_cents, 0);

  return NextResponse.json({ data, totalMrr, plans: PLANS });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return apiError('Non authentifié', 401);
  if (session.role !== 'super_admin') return apiError('Accès refusé', 403);

  const { orgId, plan, status, mrrUsdCents, renewalAt, notes } = await req.json();
  if (!orgId) return apiError('orgId requis');

  const allowed = ['freemium', 'standard', 'enterprise'];
  if (plan && !allowed.includes(plan)) return apiError('Plan invalide');

  await transact(async (client) => {
    await client.query(
      `UPDATE subscriptions SET
         plan          = COALESCE($2, plan),
         status        = COALESCE($3, status),
         mrr_usd_cents = COALESCE($4, mrr_usd_cents),
         renewal_at    = COALESCE($5, renewal_at),
         notes         = COALESCE($6, notes),
         updated_at    = NOW()
       WHERE org_id = $1`,
      [orgId, plan ?? null, status ?? null, mrrUsdCents ?? null, renewalAt ?? null, notes ?? null]
    );
  });

  return NextResponse.json({ success: true });
}
