'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart2 } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Transfer {
  id: string; ref: string; status: string; priority: string;
  quantity: number; created_at: string; updated_at: string;
}

interface Stats {
  total: number;
  delivered: number;
  cancelled: number;
  inTransit: number;
  pending: number;
  successRate: string;
}

export default function TransfersAnalyticsPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [stats, setStats]         = useState<Stats | null>(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    apiFetch<{ data: Transfer[]; total: number }>('/api/transfers?limit=200')
      .then((r) => {
        const data = r.data;
        setTransfers(data);
        const total     = r.total;
        const delivered = data.filter((t) => t.status === 'delivered').length;
        const cancelled = data.filter((t) => t.status === 'cancelled').length;
        const inTransit = data.filter((t) => t.status === 'in_transit').length;
        const pending   = data.filter((t) => t.status === 'pending').length;
        const successRate = total > 0 ? `${Math.round((delivered / total) * 100)}%` : '—';
        setStats({ total, delivered, cancelled, inTransit, pending, successRate });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Agrégat par priorité
  const byPriority = transfers.reduce<Record<string, { count: number; delivered: number }>>((acc, t) => {
    if (!acc[t.priority]) acc[t.priority] = { count: 0, delivered: 0 };
    acc[t.priority].count++;
    if (t.status === 'delivered') acc[t.priority].delivered++;
    return acc;
  }, {});

  const v = (n: number | string | undefined) => loading ? '--' : (n ?? '--');

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/analytics" className={styles.backLink}>← Analytics</Link>
          <span className={styles.separator}>|</span>
          <h1 className={styles.title}>EFFICACITÉ DES TRANSFERTS</h1>
        </div>
      </header>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>TOTAL</p>
          <p className={styles.kpiValue}>{v(stats?.total)}</p>
          <p className={styles.kpiSub}>transferts</p>
        </div>
        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>TAUX SUCCÈS</p>
          <p className={styles.kpiValue}>{v(stats?.successRate)}</p>
          <p className={styles.kpiSub}>complétés</p>
        </div>
        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>EN TRANSIT</p>
          <p className={styles.kpiValue}>{v(stats?.inTransit)}</p>
          <p className={styles.kpiSub}>en cours</p>
        </div>
        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>ANNULÉS</p>
          <p className={styles.kpiValue}>{v(stats?.cancelled)}</p>
          <p className={styles.kpiSub}>du total</p>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Par priorité</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>PRIORITÉ</th><th>TRANSFERTS</th><th>LIVRÉS</th><th>TAUX SUCCÈS</th>
              </tr>
            </thead>
            <tbody>
              {!loading && Object.keys(byPriority).length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)' }}>
                    <BarChart2 size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.35 }} />
                    <p style={{ fontSize: 13 }}>Aucune donnée disponible</p>
                  </td>
                </tr>
              ) : Object.entries(byPriority).map(([priority, data]) => (
                <tr key={priority} className={styles.row}>
                  <td><span className={`badge ${priority === 'URGENTE' ? 'critical' : priority === 'HAUTE' ? 'warning' : 'info'}`}>{priority}</span></td>
                  <td>{data.count}</td>
                  <td>{data.delivered}</td>
                  <td>{data.count > 0 ? `${Math.round((data.delivered / data.count) * 100)}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Répartition par statut</h2>
        <div className={styles.fluxCard}>
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--brand-slate)', fontSize: 13 }}>Chargement...</div>
          ) : stats && stats.total > 0 ? (
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Livrés', count: stats.delivered, color: 'var(--status-success)' },
                { label: 'En transit', count: stats.inTransit, color: 'var(--status-info)' },
                { label: 'En attente', count: stats.pending, color: 'var(--status-warning)' },
                { label: 'Annulés', count: stats.cancelled, color: 'var(--status-error)' },
              ].map(({ label, count, color }) => (
                <div key={label} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 50px', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--brand-navy)', fontWeight: 500 }}>{label}</span>
                  <div style={{ height: 8, background: 'var(--border-light)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%`, background: color, borderRadius: 4, transition: 'width 0.4s' }} />
                  </div>
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--brand-navy)', textAlign: 'right' }}>{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)' }}>
              <BarChart2 size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }} />
              <p style={{ fontSize: 13 }}>Aucune donnée de flux disponible</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
