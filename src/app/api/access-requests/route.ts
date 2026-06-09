import { NextRequest, NextResponse } from 'next/server';
import { transact } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { firstName, lastName, email, org, role, country, message } = await req.json();
  if (!firstName || !lastName || !email || !org || !role || !country) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
  }

  try {
    await transact(async (client) => {
      await client.query(
        `INSERT INTO access_requests (first_name, last_name, email, organization, role, country_code, message)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [firstName, lastName, email, org, role, country, message || null]
      );
    });

    const apiKey = process.env.SENDGRID_API_KEY;
    const from   = process.env.EMAIL_FROM ?? 'noreply@vitalgrid.io';

    if (apiKey) {
      await fetch('https://api.sendgrid.com/v3/mail/send', {
        method:  'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          personalizations: [{ to: [{ email: 'admin@vitalgrid.io' }] }],
          from:    { email: from, name: 'VitalGrid' },
          subject: `[Accès] ${firstName} ${lastName} — ${org}`,
          content: [{
            type: 'text/plain',
            value: `Nouvelle demande d'accès\n\nNom: ${firstName} ${lastName}\nEmail: ${email}\nOrganisation: ${org}\nRôle: ${role}\nPays: ${country}\n\nMessage:\n${message || '—'}`,
          }],
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error('access-requests error:', (e as Error).message);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
