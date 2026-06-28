'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, ArrowLeftRight } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Transfer {
  id: string;
  ref: string;
  quantity: number;
  status: string;
  requesting_facility_id: string;
  source_facility_id: string | null;
  created_at: string;
  is_emergency: boolean;
  requesting_facility_name?: string;
  source_facility_name?: string;
  resource_name?: string;
}

const STATUS_TAB: Record<string, string[]> = {
  active: ['in_transit', 'confirmed'],
  pending: ['pending'],
  completed: ['completed', 'incident', 'cancelled'],
};

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'active' | 'pending' | 'completed'>('active');

  useEffect(() => {
    setLoading(true);
    apiFetch<{ data: Transfer[] }>('/api/transfers?limit=100&enrich=1')
      .then((r) => {
        const data = r.data ?? [];
        setTransfers(data);
        // Auto-select "pending" tab if there are pending transfers and none active
        const hasPending = data.some((t) => STATUS_TAB.pending.includes(t.status));
        const hasActive  = data.some((t) => STATUS_TAB.active.includes(t.status));
        if (hasPending && !hasActive) setTab('pending');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = transfers.filter((t) => STATUS_TAB[tab].includes(t.status));
  const counts = {
    active: transfers.filter((t) => STATUS_TAB.active.includes(t.status)).length,
    pending: transfers.filter((t) => STATUS_TAB.pending.includes(t.status)).length,
  };

  const BADGE_MAP: Record<string, string> = {
    pending: 'warning', confirmed: 'info', in_transit: 'info',
    delivered: 'warning', completed: 'success', incident: 'critical', cancelled: 'info',
  };

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/dashboard" className={styles.backLink}>← Dashboard</Link>
          <h1 className={styles.title}>MES TRANSFERTS</h1>
        </div>
        <Link href="/transfers/new" className="btn-primary">
          <Plus size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />Nouveau
        </Link>
      </header>

      <div className={styles.tabBar}>
        {(['active', 'pending', 'completed'] as const).map((t) => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'active' ? `En cours (${counts.active})` : t === 'pending' ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                En attente
                {counts.pending > 0 && (
                  <span style={{ background: 'var(--status-error)', color: '#fff', borderRadius: 10, fontSize: 10, fontWeight: 700, padding: '1px 6px', lineHeight: '16px' }}>
                    {counts.pending}
                  </span>
                )}
              </span>
            ) : 'Complétés'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--brand-slate)', fontSize: 13 }}>Chargement...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--brand-slate)' }}>
          <ArrowLeftRight size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }} />
          <p style={{ fontSize: 13 }}>Aucun transfert dans cette catégorie</p>
        </div>
      ) : (
        <section className={styles.section}>
          <div className={styles.cardList}>
            {filtered.map((t) => (
              <div key={t.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.cardRef}>
                    <span className={`mono ${styles.refCode}`}>{t.ref}</span>
                    {t.is_emergency && <span className="badge critical" style={{ marginLeft: 8 }}>URGENCE</span>}
                  </div>
                  <span className={`badge ${BADGE_MAP[t.status] ?? 'info'}`}>{t.status.toUpperCase()}</span>
                </div>
                <div className={styles.cardRoute}>
                  <span className={styles.routeValue} style={{ fontSize: 12, color: 'var(--brand-slate)' }}>
                    {t.source_facility_name ?? t.source_facility_id?.slice(0, 8) ?? '—'}
                    {' → '}
                    {t.requesting_facility_name ?? t.requesting_facility_id?.slice(0, 8) ?? '—'}
                  </span>
                  <span className={styles.routeValue}>{t.quantity} unités{t.resource_name ? ` · ${t.resource_name}` : ''}</span>
                </div>
                <div className={styles.cardActions}>
                  <Link href={`/transfers/${t.id}`} className="btn-secondary" style={{ fontSize: '0.85rem', height: '36px', padding: '0 1rem' }}>
                    Voir détails
                  </Link>
                  {t.status === 'delivered' && (
                    <Link href={`/transfers/${t.id}/receive`} className="btn-primary" style={{ fontSize: '0.85rem', height: '36px', padding: '0 1rem' }}>
                      Confirmer réception
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
