'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { History } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Transfer {
  id: string; ref: string; status: string; quantity: number;
  created_at: string; priority: string;
  requesting_facility_id: string; source_facility_id: string | null;
}

export default function TransfersHistoryPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [days, setDays]           = useState(30);
  const [status, setStatus]       = useState('');
  const [page, setPage]           = useState(1);
  const LIMIT = 25;

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: String(LIMIT), page: String(page) });
    if (status) params.set('status', status);
    apiFetch<{ data: Transfer[]; total: number }>(`/api/transfers?${params}`)
      .then((r) => { setTransfers(r.data); setTotal(r.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, status]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [days, status]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const STATUS_LABEL: Record<string, string> = {
    pending: 'En attente', confirmed: 'Confirmé', in_transit: 'En transit',
    delivered: 'Livré', cancelled: 'Annulé', rejected: 'Refusé',
  };
  const STATUS_BADGE: Record<string, string> = {
    pending: 'warning', confirmed: 'info', in_transit: 'info',
    delivered: 'success', cancelled: 'critical', rejected: 'critical',
  };

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/transfers" className={styles.backLink}>← Transferts</Link>
          <h1 className={styles.title}>HISTORIQUE DES TRANSFERTS</h1>
        </div>
      </header>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Statut</span>
          <select className={`input-field ${styles.select}`} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tous</option>
            <option value="delivered">Livré</option>
            <option value="in_transit">En transit</option>
            <option value="pending">En attente</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>
      </div>

      <div className={styles.summary}>
        {loading ? 'Chargement...' : `${total} transfert${total !== 1 ? 's' : ''}`}
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>DATE</th><th>RÉF.</th><th>QTÉ</th><th>PRIORITÉ</th><th>STATUT</th><th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {!loading && transfers.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)' }}>
                    <History size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }} />
                    <p style={{ fontSize: 13 }}>Aucun transfert dans l&apos;historique</p>
                  </div>
                </td>
              </tr>
            ) : transfers.map((t) => (
              <tr key={t.id} className={styles.row}>
                <td className="mono" style={{ fontSize: 12 }}>{new Date(t.created_at).toLocaleDateString('fr-FR')}</td>
                <td className="mono" style={{ fontWeight: 600 }}>{t.ref}</td>
                <td>{t.quantity}</td>
                <td><span className={`badge ${t.priority === 'URGENTE' ? 'critical' : t.priority === 'HAUTE' ? 'warning' : 'info'}`}>{t.priority}</span></td>
                <td><span className={`badge ${STATUS_BADGE[t.status] ?? 'info'}`}>{STATUS_LABEL[t.status] ?? t.status}</span></td>
                <td><Link href={`/transfers/${t.id}`} className={styles.actionLink}>Voir</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <div className={styles.pageButtons}>
            <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage(page - 1)}>&lt;</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button key={p} className={`${styles.pageBtn} ${page === p ? styles.activePage : ''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className={styles.pageBtn} disabled={page === totalPages} onClick={() => setPage(page + 1)}>&gt;</button>
          </div>
        </div>
      )}
    </div>
  );
}
