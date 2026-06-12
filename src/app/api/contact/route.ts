import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { name, email, subject, message } = await req.json();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 });
  }

  const apiKey = process.env.SENDGRID_API_KEY;
  const from   = process.env.EMAIL_FROM ?? 'noreply@vitalgrid.io';

  if (apiKey) {
    try {
      const r = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: 'hello@vitalgrid.io' }] }],
          from: { email: from, name: 'VitalGrid Contact' },
          subject: `[Contact] ${subject} — ${name}`,
          content: [{
            type: 'text/plain',
            value: `Nouveau message de contact\n\nNom: ${name}\nEmail: ${email}\nSujet: ${subject}\n\nMessage:\n${message}`,
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
