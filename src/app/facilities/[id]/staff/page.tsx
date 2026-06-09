'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Users, AlertCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

export default function StaffPage() {
  const params = useParams();
  const id = params.id as string;

  const [inviteEmail, setInviteEmail]   = useState('');
  const [inviteRole, setInviteRole]     = useState('');
  const [inviteZone, setInviteZone]     = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteRole) {
      setError('Email et rôle sont requis');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await apiFetch(`/api/facilities/${id}/staff/invite`, {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail, role: inviteRole, zone: inviteZone || null }),
      });
      setSuccess(`Invitation envoyée à ${inviteEmail}`);
      setInviteEmail('');
      setInviteRole('');
      setInviteZone('');
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href={`/facilities/${id}`} className={styles.backLink}>← Établissement</Link>
          <h1 className={styles.title}>GESTION DU PERSONNEL</h1>
        </div>
        <div className={styles.headerActions}>
          <button className="btn-primary" onClick={() => document.getElementById('invite-section')?.scrollIntoView({ behavior: 'smooth' })}>
            + Inviter un agent
          </button>
        </div>
      </header>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>NOM</th><th>EMAIL</th><th>RÔLE</th><th>ZONE</th><th>STATUT</th><th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--brand-slate)' }}>
                <Users size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.35 }} />
                <p style={{ fontSize: 13 }}>Aucun agent configuré</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div id="invite-section" className={styles.inviteCard}>
        <h3 className={styles.inviteTitle}>Inviter un agent</h3>
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--status-error)', borderRadius: 8, padding: '10px 14px', marginBottom: 12, color: 'var(--status-error)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
        {success && (
          <div style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid var(--brand-sage)', borderRadius: 8, padding: '10px 14px', marginBottom: 12, color: 'var(--brand-sage)', fontSize: 13 }}>
            {success}
          </div>
        )}
        <form className={styles.inviteForm} onSubmit={handleInvite}>
          <div className={styles.inviteField}>
            <label className={styles.label}>Email *</label>
            <input type="email" className="input-field" placeholder="agent@etablissement.cd" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
          </div>
          <div className={styles.inviteField}>
            <label className={styles.label}>Rôle *</label>
            <select className={`input-field ${styles.select}`} required value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
              <option value="">Sélectionner...</option>
              <option value="field_agent">Field Agent</option>
              <option value="facility_manager">Facility Manager</option>
              <option value="ngo_coordinator">NGO Coordinator</option>
            </select>
          </div>
          <div className={styles.inviteField}>
            <label className={styles.label}>Zone</label>
            <select className={`input-field ${styles.select}`} value={inviteZone} onChange={(e) => setInviteZone(e.target.value)}>
              <option value="">Toutes</option>
              <option value="urgences">Urgences</option>
              <option value="pharmacie">Pharmacie</option>
              <option value="banque-sang">Banque de Sang</option>
            </select>
          </div>
          <div className={styles.inviteAction}>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Envoi...' : 'Envoyer invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
