import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { firstName, lastName, email, org, country, facilities, message } = await req.json();
  if (!firstName || !lastName || !email || !org || !country) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
  }

  const apiKey = process.env.SENDGRID_API_KEY;
  const from   = process.env.EMAIL_FROM ?? 'noreply@vitalgrid.io';

  if (!apiKey) return NextResponse.json({ error: 'SendGrid non configuré' }, { status: 500 });

  const body = {
    personalizations: [{ to: [{ email: 'admin@vitalgrid.io' }] }],
    from:    { email: from, name: 'VitalGrid' },
    subject: `[Démo] ${firstName} ${lastName} — ${org}`,
    content: [{
      type: 'text/plain',
      value: `Nouvelle demande de démo\n\nNom: ${firstName} ${lastName}\nEmail: ${email}\nOrganisation: ${org}\nPays: ${country}\nFacilities: ${facilities || 'Non précisé'}\n\nMessage:\n${message || '—'}`,
    }],
  };

  const r = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method:  'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  if (!r.ok) {
    console.error('SendGrid error:', await r.text());
    return NextResponse.json({ error: 'Erreur d\'envoi email' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
