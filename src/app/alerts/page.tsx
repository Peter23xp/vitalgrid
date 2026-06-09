'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Settings, BellOff } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Alert {
  id: string;
  title: string;
  description: string | null;
  severity: string;
  alert_type: string;
  is_read: boolean;
  resource_id: string | null;
  transfer_id: string | null;
  created_at: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'critical' | 'warning'>('all');

  const load = () => {
    setLoading(true);
    apiFetch<{ data: Alert[]; unreadCount: number }>('/api/alerts?limit=50')
      .then((r) => setAlerts(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markRead = (id: string) => {
    apiFetch(`/api/alerts/${id}/read`, { method: 'PATCH' })
      .then(() => setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, is_read: true } : a)))
      .catch(console.error);
  };

  const filtered = alerts.filter((a) => tab === 'all' || a.severity === tab);
  const unread = alerts.filter((a) => !a.is_read);
  const counts = {
    all: alerts.length,
    critical: alerts.filter((a) => a.severity === 'critical').length,
    warning: alerts.filter((a) => a.severity === 'warning').length,
  };

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/dashboard" className={styles.backLink}>← Dashboard</Link>
          <h1 className={styles.title}>ALERTES</h1>
        </div>
        <div className={styles.headerActions}>
          <Link href="/alerts/rules/new" className="btn-outline">
            <Settings size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            Règles
          </Link>
        </div>
      </header>

      <div className={styles.summary}>
        <span className={styles.pulseDot}></span>
        <span>{unread.length} alerte{unread.length !== 1 ? 's' : ''} non lue{unread.length !== 1 ? 's' : ''}</span>
      </div>

      <div className={styles.tabBar}>
        {(['all', 'critical', 'warning'] as const).map((t) => (
          <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>
            {t === 'all' ? `Toutes (${counts.all})` : t === 'critical' ? `Critiques (${counts.critical})` : `Avertissements (${counts.warning})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--brand-slate)', fontSize: 13 }}>Chargement...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--brand-slate)' }}>
          <BellOff size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }} />
          <p style={{ fontSize: 13 }}>Aucune alerte active</p>
        </div>
      ) : (
        <section className={styles.section}>
          {filtered.map((alert) => (
            <div
              key={alert.id}
              className={`${styles.alertCard} ${alert.severity === 'critical' ? styles.alertCritical : styles.alertWarning}`}
              style={{ opacity: alert.is_read ? 0.6 : 1 }}
            >
              <div className={styles.alertHeader}>
                <span className={`badge ${alert.severity === 'critical' ? 'critical' : 'warning'}`}>
                  {alert.severity === 'critical' ? 'CRITIQUE' : 'AVERTISSEMENT'}
                </span>
                <span className={`${styles.timestamp} mono`}>
                  {new Date(alert.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h3 className={styles.alertTitle}>{alert.title}</h3>
              {alert.description && <p className={styles.alertSubtitle}>{alert.description}</p>}
              <div className={styles.alertActions}>
                {alert.resource_id && (
                  <Link href={`/inventory/${alert.resource_id}`} className="btn-secondary">Voir ressource</Link>
                )}
                {alert.transfer_id && (
                  <Link href={`/transfers/${alert.transfer_id}`} className="btn-secondary">Voir transfert</Link>
                )}
                {!alert.is_read && (
                  <button className={styles.btnMark} onClick={() => markRead(alert.id)}>✓ Marquer lu</button>
                )}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
