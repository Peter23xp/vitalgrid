'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Inbox } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface AccessRequest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  organization: string;
  role: string;
  country_code: string;
  message: string | null;
  status: string;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending:   'En attente',
  contacted: 'Contacté',
  approved:  'Approuvé',
  rejected:  'Rejeté',
};

const STATUS_BADGE: Record<string, string> = {
  pending:   'warning',
  contacted: 'info',
  approved:  'success',
  rejected:  'critical',
};

export default function AccessRequestsPage() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '100' });
    if (filter) params.set('status', filter);
    apiFetch<{ data: AccessRequest[]; total: number }>(`/api/admin/access-requests?${params}`)
      .then((r) => { setRequests(r.data); setTotal(r.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    try {
      await apiFetch('/api/admin/access-requests', {
        method: 'PATCH',
        body: JSON.stringify({ id, status }),
      });
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(null);
    }
  }

  const pending = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/dashboard/admin" className={styles.backLink}>← Admin</Link>
          <h1 className={styles.title}>DEMANDES D&apos;ACCÈS</h1>
          {pending > 0 && (
            <span className={`badge warning ${styles.pendingBadge}`}>{pending} en attente</span>
          )}
        </div>
      </header>

      <div className={styles.filtersBar}>
        <select
          className={`input-field ${styles.select}`}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="contacted">Contacté</option>
          <option value="approved">Approuvé</option>
          <option value="rejected">Rejeté</option>
        </select>
      </div>

      <div className={styles.resultsInfo}>
        {loading ? 'Chargement...' : `${total} demande${total !== 1 ? 's' : ''}`}
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>DATE</th>
              <th>NOM</th>
              <th>EMAIL</th>
              <th>ORGANISATION</th>
              <th>PAYS</th>
              <th>RÔLE SOUHAITÉ</th>
              <th>MESSAGE</th>
              <th>STATUT</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {!loading && requests.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--brand-slate)' }}>
                  <Inbox size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.35 }} />
                  <p style={{ fontSize: 13 }}>Aucune demande</p>
                </td>
              </tr>
            ) : requests.map((r) => (
              <tr key={r.id} className={styles.row}>
                <td className="mono" style={{ fontSize: 12 }}>
                  {new Date(r.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className={styles.nameCell}>{r.first_name} {r.last_name}</td>
                <td className="mono" style={{ fontSize: 12 }}>{r.email}</td>
                <td>{r.organization}</td>
                <td style={{ textTransform: 'uppercase', fontSize: 12 }}>{r.country_code}</td>
                <td style={{ fontSize: 12 }}>{r.role}</td>
                <td className={styles.messageCell} title={r.message ?? ''}>
                  {r.message ? (r.message.length > 60 ? r.message.slice(0, 60) + '…' : r.message) : '—'}
                </td>
                <td>
                  <span className={`badge ${STATUS_BADGE[r.status] ?? 'info'}`}>
                    {STATUS_LABELS[r.status] ?? r.status}
                  </span>
                </td>
                <td className={styles.actions}>
                  {r.status === 'pending' && (
                    <>
                      <button
                        className={styles.actionBtn}
                        disabled={updating === r.id}
                        onClick={() => updateStatus(r.id, 'contacted')}
                      >
                        Contacté
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        disabled={updating === r.id}
                        onClick={() => updateStatus(r.id, 'rejected')}
                      >
                        Rejeter
                      </button>
                    </>
                  )}
                  {r.status === 'contacted' && (
                    <button
                      className={styles.actionBtn}
                      disabled={updating === r.id}
                      onClick={() => updateStatus(r.id, 'approved')}
                    >
                      Approuver
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
