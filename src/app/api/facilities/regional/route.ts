import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { apiOk, apiError } from '@/lib/types';

// Toutes les facilities du même pays que l'org connectée — toutes orgs confondues.
// Utilisé par la carte régionale et le formulaire de transfert cross-org.
export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return apiError('Non authentifié', 401);

  try {
    // Récupérer le country_code de l'organisation du user connecté
    const orgRow = await query<{ country_code: string }>(
      'SELECT country_code FROM organizations WHERE id = $1',
      [session.orgId]
    );
    if (!orgRow[0]) return apiError('Organisation introuvable', 404);

    const countryCode = orgRow[0].country_code;

    const s = req.nextUrl.searchParams;
    const search = s.get('search') ?? '';
    const limit  = Math.min(Number(s.get('limit') ?? 200), 500);

    const conditions = ['f.country_code = $1', "f.status != 'inactive'"];
    const params: unknown[] = [countryCode];
    let i = 2;

    if (search) {
      conditions.push(`f.name ILIKE $${i++}`);
      params.push(`%${search}%`);
    }

    const where = conditions.join(' AND ');
    params.push(limit);

    const data = await query<{
      id: string; name: string; type: string; region: string | null;
      lat: number | null; lng: number | null; status: string;
      org_id: string; org_name: string; tenant_id: string;
    }>(
      `SELECT f.id, f.name, f.type, f.region, f.lat, f.lng, f.status,
              f.org_id, f.tenant_id, o.name AS org_name
       FROM facilities f
       JOIN organizations o ON o.id = f.org_id
       WHERE ${where}
       ORDER BY f.name
       LIMIT $${i}`,
      params
    );

    return apiOk({ data, total: data.length, countryCode });
  } catch {
    return apiError('Erreur serveur', 500);
  }
}
