import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { firstName, lastName, email, org, country, facilities, message } = await req.json();
  if (!firstName || !lastName || !email || !org || !country) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
  }

  // Sauvegarder en base d'abord — la demande ne doit jamais être perdue
  try {
    await query(
      `INSERT INTO access_requests (first_name, last_name, email, organization, role, country_code, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [firstName, lastName, email.toLowerCase(), org, facilities || 'non précisé', country, message || null]
    );
  } catch (e) {
    console.error('access_requests insert error:', e);
    // On continue quand même — ne pas bloquer l'utilisateur pour un pb de DB
  }

  // Tentative email — non bloquante
  const apiKey = process.env.SENDGRID_API_KEY;
  const from   = process.env.EMAIL_FROM ?? 'noreply@vitalgrid.io';

  if (apiKey) {
    try {
      const r = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method:  'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: 'admin@vitalgrid.io' }] }],
          from:    { email: from, name: 'VitalGrid' },
          subject: `[Démo] ${firstName} ${lastName} — ${org}`,
          content: [{
            type: 'text/plain',
            value: `Nouvelle demande de démo\n\nNom: ${firstName} ${lastName}\nEmail: ${email}\nOrganisation: ${org}\nPays: ${country}\nFacilities: ${facilities || 'Non précisé'}\n\nMessage:\n${message || '—'}`,
          }],
        }),
      });
      if (!r.ok) console.error('SendGrid error:', r.status, await r.text());
    } catch (e) {
      console.error('SendGrid fetch error:', e);
    }
  }

  return NextResponse.json({ success: true });
}
