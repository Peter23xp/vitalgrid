'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { BellOff } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Alert {
  id: string; title: string; alert_type: string; severity: string;
  description: string | null; is_read: boolean; resolved_at: string | null;
  created_at: string; facility_id: string;
}

export default function AlertHistoryPage() {
  const [alerts, setAlerts]   = useState<Alert[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [severity, setSeverity] = useState('');
  const [readFilter, setReadFilter] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '50' });
    if (severity)   params.set('severity', severity);
    if (readFilter !== '') params.set('read', readFilter);
    apiFetch<{ data: Alert[]; total: number }>(`/api/alerts?${params}`)
      .then((r) => { setAlerts(r.data); setTotal(r.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [severity, readFilter]);

  useEffect(() => { load(); }, [load]);

  const SEV_BADGE: Record<string, string> = { critical: 'critical', warning: 'warning', info: 'info' };
  const SEV_LABEL: Record<string, string> = { critical: 'Critique', warning: 'Avertissement', info: 'Info' };
  const TYPE_LABEL: Record<string, string> = {
    stock_bas: 'Stock bas', expiration_proche: 'Expiration', temperature: 'Température',
    sync_inactivite: 'Sync', transfert: 'Transfert',
  };

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/alerts" className={styles.backLink}>← Alertes</Link>
          <h1 className={styles.title}>HISTORIQUE DES ALERTES</h1>
        </div>
      </header>

      <div className={styles.filterBar}>
        <div className={styles.filterItem}>
          <span className={styles.filterLabel}>Sévérité</span>
          <select className={`input-field ${styles.select}`} value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="">Toutes</option>
            <option value="critical">Critique</option>
            <option value="warning">Avertissement</option>
            <option value="info">Info</option>
          </select>
        </div>
        <div className={styles.filterItem}>
          <span className={styles.filterLabel}>Statut</span>
          <select className={`input-field ${styles.select}`} value={readFilter} onChange={(e) => setReadFilter(e.target.value)}>
            <option value="">Tous</option>
            <option value="false">Non lues</option>
            <option value="true">Lues</option>
          </select>
        </div>
      </div>

      <div className={styles.summary}>
        {loading ? 'Chargement...' : `${total} alerte${total !== 1 ? 's' : ''}`}
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>DATE</th><th>TYPE</th><th>TITRE</th><th>SÉVÉRITÉ</th><th>STATUT</th>
            </tr>
          </thead>
          <tbody>
            {!loading && alerts.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)' }}>
                    <BellOff size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }} />
                    <p style={{ fontSize: 13 }}>Aucune alerte dans l&apos;historique</p>
                  </div>
                </td>
              </tr>
            ) : alerts.map((a) => (
              <tr key={a.id} className={styles.row}>
                <td className="mono" style={{ fontSize: 12 }}>{new Date(a.created_at).toLocaleDateString('fr-FR')}</td>
                <td style={{ fontSize: 12 }}>{TYPE_LABEL[a.alert_type] ?? a.alert_type}</td>
                <td style={{ fontWeight: 500 }}>{a.title}</td>
                <td><span className={`badge ${SEV_BADGE[a.severity] ?? 'info'}`}>{SEV_LABEL[a.severity] ?? a.severity}</span></td>
                <td><span className={`badge ${a.is_read ? 'success' : 'warning'}`}>{a.is_read ? 'Lue' : 'Non lue'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
