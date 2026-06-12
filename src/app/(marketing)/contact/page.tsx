'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Mail, MapPin, Clock } from 'lucide-react';

const INFO = [
  { icon: Mail,    label: 'Email',         value: 'hello@vitalgrid.io' },
  { icon: MapPin,  label: 'Siège',         value: 'Kinshasa, RDC — Nairobi, Kenya' },
  { icon: Clock,   label: 'Réponse sous',  value: '24 à 48 heures ouvrées' },
];

const SUBJECTS = [
  'Question sur le produit',
  'Partenariat ou intégration',
  'Support technique',
  'Presse ou médias',
  'Autre',
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting'); setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Erreur serveur'); }
      setStatus('success');
    } catch (e: unknown) {
      setError((e as Error).message);
      setStatus('error');
    }
  };

  const mono: React.CSSProperties    = { fontFamily: 'Fira Code, monospace' };
  const display: React.CSSProperties = { fontFamily: 'Barlow Condensed, sans-serif' };
  const input: React.CSSProperties   = { width: '100%', height: 44, background: '#fff', border: '1px solid #E2E8F0', color: '#0F172A', padding: '0 14px', borderRadius: 8, fontSize: 14, fontFamily: 'Barlow, sans-serif', outline: 'none' };
  const label: React.CSSProperties   = { display: 'block', fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 6 };

  if (status === 'success') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', background: '#F8FAFC' }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <CheckCircle2 size={56} color="#059669" style={{ margin: '0 auto 20px', display: 'block' }} />
          <h1 style={{ ...display, fontSize: 32, fontWeight: 800, textTransform: 'uppercase', color: '#0F172A', marginBottom: 12 }}>Message envoyé !</h1>
          <p style={{ fontSize: 16, color: '#64748B', lineHeight: 1.7 }}>
            L&apos;équipe VitalGrid vous répondra sous <strong>48h ouvrées</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff' }}>

      {/* ── Hero ── */}
      <section style={{ background: '#0F172A', padding: 'clamp(120px, 14vw, 160px) 24px clamp(64px, 8vw, 96px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 30% 50%, rgba(5,150,105,0.10) 0%, transparent 70%)' }} />
        <div className="mk-container" style={{ position: 'relative', zIndex: 2 }}>
          <span style={{ ...mono, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#059669', display: 'block', marginBottom: 20 }}>Contact</span>
          <h1 style={{ ...display, fontSize: 'clamp(44px, 6vw, 80px)', fontWeight: 800, textTransform: 'uppercase', color: '#fff', letterSpacing: '-1px', lineHeight: 1.0, maxWidth: 640, textWrap: 'balance' }}>
            Parlons de<br /><span style={{ color: '#059669' }}>votre contexte</span>
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, marginTop: 24, maxWidth: 520 }}>
            Une question, un partenariat, un besoin spécifique — envoyez-nous un message. Nous répondons sous 48h ouvrées.
          </p>
        </div>
      </section>

      {/* ── Form + Info ── */}
      <section style={{ padding: 'clamp(64px, 8vw, 96px) 24px', background: '#F8FAFC' }}>
        <div className="mk-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'start' }}>

          {/* Form */}
          <div>
            {status === 'error' && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid #EF4444', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#DC2626', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}
            <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: 'clamp(28px, 4vw, 48px)', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={label}>Nom complet *</label>
                <input type="text" style={input} required value={form.name} onChange={set('name')} placeholder="Votre nom" />
              </div>
              <div>
                <label style={label}>Email *</label>
                <input type="email" style={input} required value={form.email} onChange={set('email')} placeholder="vous@organisation.org" />
              </div>
              <div>
                <label style={label}>Sujet *</label>
                <select style={input} required value={form.subject} onChange={set('subject')}>
                  <option value="">Sélectionner un sujet...</option>
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={label}>Message *</label>
                <textarea
                  style={{ ...input, height: 140, padding: '12px 14px', resize: 'vertical' }}
                  required
                  value={form.message}
                  onChange={set('message')}
                  placeholder="Décrivez votre question ou besoin..."
                />
              </div>
              <button
                type="submit"
                disabled={status === 'submitting'}
                style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: 8, padding: '14px', fontSize: 15, fontWeight: 700, cursor: status === 'submitting' ? 'not-allowed' : 'pointer', opacity: status === 'submitting' ? 0.7 : 1, ...display, textTransform: 'uppercase', letterSpacing: '0.5px' }}
              >
                {status === 'submitting' ? 'Envoi en cours...' : 'Envoyer le message →'}
              </button>
            </form>
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#0F172A', borderRadius: 16, padding: 36, marginBottom: 8 }}>
              <h2 style={{ ...display, fontSize: 22, fontWeight: 800, textTransform: 'uppercase', color: '#fff', letterSpacing: '-0.3px', marginBottom: 24 }}>
                Informations de contact
              </h2>
              {INFO.map(({ icon: Icon, label: lbl, value }) => (
                <div key={lbl} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', paddingBottom: 20, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(5,150,105,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={17} color="#059669" />
                  </div>
                  <div>
                    <div style={{ ...mono, fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 }}>{lbl}</div>
                    <div style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.2)', borderRadius: 12, padding: 24 }}>
              <div style={{ ...mono, fontSize: 10, color: '#059669', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>Démo prioritaire</div>
              <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.7 }}>
                Vous souhaitez voir VitalGrid en action dans votre contexte ?
              </p>
              <a href="/demo" style={{ display: 'inline-block', marginTop: 14, fontSize: 14, fontWeight: 700, color: '#059669', ...display, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                Demander une démo →
              </a>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
