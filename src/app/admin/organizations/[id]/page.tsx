'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Building2, Users } from 'lucide-react';
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

  useEffect(() => {
    apiFetch<Detail>(`/api/admin/organizations/${id}`)
      .then(setData).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const STATUS_BADGE: Record<string, string> = { active: 'success', critical: 'critical', warning: 'warning', offline: 'info', disabled: 'info' };

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/admin/organizations" className={styles.backLink}>← Organisations</Link>
          <h1 className={styles.title}>{loading ? '...' : (data?.org.name ?? 'Organisation')}</h1>
          {data && <span className="badge info" style={{ marginLeft: 8 }}>{data.org.type}</span>}
        </div>
      </header>

      <div className={styles.tabBar}>
        <button className={`${styles.tab} ${tab === 'facilities' ? styles.tabActive : ''}`} onClick={() => setTab('facilities')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Building2 size={14} /> Établissements {data && `(${data.facilities.length})`}
        </button>
        <button className={`${styles.tab} ${tab === 'users' ? styles.tabActive : ''}`} onClick={() => setTab('users')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Users size={14} /> Utilisateurs {data && `(${data.users.length})`}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--brand-slate)', fontSize: 13 }}>Chargement...</div>
      ) : tab === 'facilities' ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead><tr><th>NOM</th><th>TYPE</th><th>RÉGION</th><th>STATUT</th><th>ACTIONS</th></tr></thead>
            <tbody>
              {data?.facilities.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--brand-slate)' }}>
                  <Building2 size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.35 }} />
                  <p style={{ fontSize: 13 }}>Aucun établissement</p>
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
            <thead><tr><th>NOM</th><th>EMAIL</th><th>RÔLE</th><th>STATUT</th></tr></thead>
            <tbody>
              {data?.users.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--brand-slate)' }}>
                  <Users size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.35 }} />
                  <p style={{ fontSize: 13 }}>Aucun utilisateur</p>
                </td></tr>
              ) : data?.users.map((u) => (
                <tr key={u.id} className={styles.row}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td className="mono" style={{ fontSize: 12 }}>{u.email}</td>
                  <td>{u.role}</td>
                  <td><span className={`badge ${u.status === 'active' ? 'success' : 'info'}`}>{u.status === 'active' ? 'Actif' : u.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
