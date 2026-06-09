'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import CountrySelect from '@/components/CountrySelect';

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', org: '', role: '', country: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting'); setError('');
    try {
      const res = await fetch('/api/access-requests', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Erreur'); }
      setStatus('success');
    } catch (e: unknown) { setError((e as Error).message); setStatus('error'); }
  };

  const inputStyle: React.CSSProperties = { width: '100%', height: 42, background: '#fff', border: '1px solid #E2E8F0', color: '#0F172A', padding: '0 14px', borderRadius: 8, fontSize: 14, fontFamily: 'Noto Sans, sans-serif' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 6 };

  if (status === 'success') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', background: '#F8FAFC' }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <CheckCircle2 size={56} color="#059669" style={{ margin: '0 auto 20px', display: 'block' }} />
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>Demande envoyée !</h1>
          <p style={{ fontSize: 16, color: '#64748B', lineHeight: 1.7 }}>
            L&apos;équipe VitalGrid examinera votre demande et vous contactera sous <strong>48h</strong> pour activer votre compte.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '120px 24px 80px' }}>
      <div style={{ maxWidth: 580, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>
          <span style={{ fontFamily: 'Fira Code, monospace', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' as const, color: '#059669' }}>Accès</span>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#0F172A', marginTop: 8 }}>
            Demander l&apos;accès à VitalGrid
          </h1>
          <p style={{ fontSize: 15, color: '#64748B', marginTop: 12, lineHeight: 1.7 }}>
            L&apos;accès est soumis à approbation pour garantir la qualité du réseau. L&apos;équipe VitalGrid vous contactera sous 48h.
          </p>
        </div>

        {status === 'error' && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid #EF4444', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#EF4444', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: '40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><label style={labelStyle}>Prénom *</label><input type="text" style={inputStyle} required value={form.firstName} onChange={set('firstName')} /></div>
            <div><label style={labelStyle}>Nom *</label><input type="text" style={inputStyle} required value={form.lastName} onChange={set('lastName')} /></div>
          </div>
          <div><label style={labelStyle}>Email professionnel *</label><input type="email" style={inputStyle} required value={form.email} onChange={set('email')} placeholder="vous@organisation.org" /></div>
          <div><label style={labelStyle}>Organisation *</label><input type="text" style={inputStyle} required value={form.org} onChange={set('org')} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Rôle *</label>
              <select style={inputStyle} required value={form.role} onChange={set('role')}>
                <option value="">Sélectionner...</option>
                <option value="facility_manager">Facility Manager</option>
                <option value="ngo_coordinator">NGO Coordinator</option>
                <option value="directeur_medical">Directeur médical</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Pays *</label>
              <div style={inputStyle}>
                <CountrySelect value={form.country} onChange={(v) => setForm((f) => ({ ...f, country: v }))} required className="" />
              </div>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Message (optionnel)</label>
            <textarea style={{ ...inputStyle, height: 80, padding: '10px 14px', resize: 'vertical' as const }} value={form.message} onChange={set('message')} placeholder="Décrivez votre organisation ou vos besoins..." />
          </div>
          <button type="submit" style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: 8, padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'Sora, sans-serif' }} disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Envoi en cours...' : 'Demander l\'accès →'}
          </button>
        </form>
      </div>
    </div>
  );
}
