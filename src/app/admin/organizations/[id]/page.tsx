'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Building2, Users, Plus, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Facility { id: string; name: string; type: string; region: string | null; status: string; }
interface User     { id: string; name: string; email: string; role: string; status: string; }
interface Detail   { org: { id: string; name: string; type: string; country_code: string }; facilities: Facility[]; users: User[]; }

export default function AdminOrgDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }          = use(params);
  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]   = useState<'facilities' | 'users'>('facilities');

  // Invite form state
  const [showInvite, setShowInvite]   = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole]   = useState('');
  const [inviteName, setInviteName]   = useState('');
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteError, setInviteError]   = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  const reload = () => {
    setLoading(true);
    apiFetch<Detail>(`/api/admin/organizations/${id}`)
      .then(setData).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { reload(); }, [id]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteRole || !inviteName) { setInviteError('Tous les champs sont requis'); return; }
    setInviteSubmitting(true); setInviteError(''); setInviteSuccess('');
    try {
      await apiFetch('/api/admin/users/invite', {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail, name: inviteName, role: inviteRole, orgId: id }),
      });
      setInviteSuccess(`Invitation envoyée à ${inviteEmail}`);
      setInviteEmail(''); setInviteRole(''); setInviteName('');
      reload();
    } catch (e: unknown) { setInviteError((e as Error).message); }
    finally { setInviteSubmitting(false); }
  };

  const STATUS_BADGE: Record<string, string> = { active: 'success', critical: 'critical', warning: 'warning', offline: 'info', disabled: 'info' };

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/admin/organizations" className={styles.backLink}>← Organisations</Link>
          <h1 className={styles.title}>{loading ? '...' : (data?.org.name ?? 'Organisation')}</h1>
          {data && <span className="badge info" style={{ marginLeft: 8 }}>{data.org.type}</span>}
          {data && <span className="badge info" style={{ marginLeft: 4 }}>{data.org.country_code}</span>}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href={`/facilities/new?org=${id}`} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <Building2 size={14} /> Ajouter un établissement
          </Link>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }} onClick={() => { setShowInvite(true); setTab('users'); }}>
            <Plus size={14} /> Inviter un utilisateur
          </button>
        </div>
      </header>

      <div className={styles.tabBar}>
        <button className={`${styles.tab} ${tab === 'facilities' ? styles.tabActive : ''}`} onClick={() => setTab('facilities')}>
          <Building2 size={14} /> Établissements {data && `(${data.facilities.length})`}
        </button>
        <button className={`${styles.tab} ${tab === 'users' ? styles.tabActive : ''}`} onClick={() => setTab('users')}>
          <Users size={14} /> Utilisateurs {data && `(${data.users.length})`}
        </button>
      </div>

      {/* ── Invite form ─────────────────────────────── */}
      {showInvite && tab === 'users' && (
        <div className={styles.inviteCard}>
          <div className={styles.inviteHeader}>
            <h3 className={styles.inviteTitle}>Inviter un utilisateur dans cette organisation</h3>
            <button onClick={() => { setShowInvite(false); setInviteError(''); setInviteSuccess(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-slate)' }}>
              <X size={18} />
            </button>
          </div>

          {inviteError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid var(--status-error)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, color: 'var(--status-error)', fontSize: 13 }}>
              <AlertCircle size={14} />{inviteError}
            </div>
          )}
          {inviteSuccess && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(5,150,105,0.08)', border: '1px solid var(--brand-sage)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, color: 'var(--brand-sage)', fontSize: 13 }}>
              <CheckCircle2 size={14} />{inviteSuccess}
            </div>
          )}

          <form onSubmit={handleInvite} className={styles.inviteForm}>
            <div className={styles.inviteField}>
              <label className={styles.inviteLabel}>Nom complet *</label>
              <input type="text" className="input-field" placeholder="Prénom Nom" required value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
            </div>
            <div className={styles.inviteField}>
              <label className={styles.inviteLabel}>Email *</label>
              <input type="email" className="input-field" placeholder="utilisateur@org.cd" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            </div>
            <div className={styles.inviteField}>
              <label className={styles.inviteLabel}>Rôle *</label>
              <select className="input-field" required value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                <option value="">Sélectionner un rôle...</option>
                <option value="facility_manager">Facility Manager</option>
                <option value="field_agent">Field Agent</option>
                <option value="ngo_coordinator">NGO Coordinator</option>
                <option value="auditor">Auditor</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={inviteSubmitting} style={{ alignSelf: 'flex-end', padding: '0 24px', height: 42 }}>
              {inviteSubmitting ? 'Envoi...' : 'Créer le compte'}
            </button>
          </form>
        </div>
      )}

      {/* ── Tables ─────────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--brand-slate)', fontSize: 13 }}>Chargement...</div>
      ) : tab === 'facilities' ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead><tr><th>NOM</th><th>TYPE</th><th>RÉGION</th><th>STATUT</th><th>ACTIONS</th></tr></thead>
            <tbody>
              {data?.facilities.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--brand-slate)' }}>
                  <Building2 size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.35 }} />
                  <p style={{ fontSize: 13, marginBottom: 12 }}>Aucun établissement dans cette organisation</p>
                  <Link href={`/facilities/new?org=${id}`} className="btn-primary" style={{ display: 'inline-flex', fontSize: 13, padding: '8px 16px' }}>
                    <Plus size={14} style={{ marginRight: 6 }} /> Ajouter un établissement
                  </Link>
                </td></tr>
              ) : data?.facilities.map((f) => (
                <tr key={f.id} className={styles.row}>
                  <td style={{ fontWeight: 600 }}>{f.name}</td>
                  <td>{f.type}</td>
                  <td>{f.region ?? '—'}</td>
                  <td><span className={`badge ${STATUS_BADGE[f.status] ?? 'info'}`}>{f.status}</span></td>
                  <td><Link href={`/facilities/${f.id}`} className={styles.actionLink}>Voir</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>NOM</th><th>EMAIL</th><th>RÔLE</th><th>STATUT</th>
                <th style={{ textAlign: 'right' }}>
                  <button className="btn-primary" style={{ fontSize: 11, padding: '5px 12px', height: 'auto' }} onClick={() => setShowInvite(true)}>
                    <Plus size={12} style={{ marginRight: 4 }} /> Inviter
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.users.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--brand-slate)' }}>
                  <Users size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.35 }} />
                  <p style={{ fontSize: 13, marginBottom: 12 }}>Aucun utilisateur dans cette organisation</p>
                  <button className="btn-primary" style={{ fontSize: 13, padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => setShowInvite(true)}>
                    <Plus size={14} /> Inviter le premier utilisateur
                  </button>
                </td></tr>
              ) : data?.users.map((u) => (
                <tr key={u.id} className={styles.row}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td className="mono" style={{ fontSize: 12 }}>{u.email}</td>
                  <td>{u.role}</td>
                  <td><span className={`badge ${u.status === 'active' ? 'success' : 'info'}`}>{u.status === 'active' ? 'Actif' : u.status}</span></td>
                  <td />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
