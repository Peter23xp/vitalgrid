import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { transact } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { apiError } from '@/lib/types';

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return apiError('Non authentifié', 401);
  if (session.role !== 'super_admin') return apiError('Accès refusé', 403);

  const { email, name, role, orgId } = await req.json();
  if (!email || !name || !role || !orgId) {
    return apiError('email, name, role et orgId sont requis');
  }

  // Récupérer le tenantId depuis l'org
  const org = await (async () => {
    const { queryOne } = await import('@/lib/db');
    return queryOne<{ id: string; name: string }>('SELECT id FROM organizations WHERE id = $1', [orgId]);
  })();

  if (!org) return apiError('Organisation introuvable', 404);

  // Mot de passe temporaire — l'utilisateur devra le changer
  const tempPassword = `VitalGrid${Math.random().toString(36).slice(-6).toUpperCase()}!`;
  const password_hash = await bcrypt.hash(tempPassword, 12);

  try {
    const user = await transact(async (client) => {
      const res = await client.query(
        `INSERT INTO users (tenant_id, org_id, email, name, role, password_hash, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'active')
         ON CONFLICT (email) DO UPDATE SET
           org_id        = EXCLUDED.org_id,
           role          = EXCLUDED.role,
           password_hash = EXCLUDED.password_hash,
           status        = 'active',
           updated_at    = NOW()
         RETURNING id, email, name, role, status`,
        [orgId, orgId, email.toLowerCase(), name, role, password_hash]
      );
      return res.rows[0];
    });

    // Notifier par email si SendGrid configuré
    const apiKey = process.env.SENDGRID_API_KEY;
    const from   = process.env.EMAIL_FROM ?? 'noreply@vitalgrid.io';

    if (apiKey) {
      await fetch('https://api.sendgrid.com/v3/mail/send', {
        method:  'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          personalizations: [{ to: [{ email }] }],
          from:    { email: from, name: 'VitalGrid' },
          subject: 'Votre compte VitalGrid a été créé',
          content: [{
            type: 'text/plain',
            value: `Bonjour ${name},\n\nVotre compte VitalGrid a été créé.\n\nEmail: ${email}\nMot de passe temporaire: ${tempPassword}\n\nConnectez-vous sur: ${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/login\n\nVeillez à changer votre mot de passe à la première connexion.\n\nL'équipe VitalGrid`,
          }],
        }),
      });
    }

    return NextResponse.json({
      user,
      tempPassword: apiKey ? undefined : tempPassword, // retourner le mdp si pas d'email
      emailSent: !!apiKey,
    }, { status: 201 });
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string };
    if (err.code === '23505') return apiError('Cet email existe déjà', 409);
    return apiError(err.message ?? 'Erreur serveur', 500);
  }
}
