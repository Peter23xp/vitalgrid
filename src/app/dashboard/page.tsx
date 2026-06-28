'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeftRight, Timer, Package, ChevronRight, PackageX, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Summary {
  totalResources: number;
  criticalAlerts: number;
  activeTransfers: number;
  expiringIn7Days: number;
}

interface Alert {
  id: string;
  title: string;
  severity: string;
  description: string | null;
  created_at: string;
  resource_id: string | null;
}

interface Transfer {
  id: string;
  ref: string;
  resource_id: string;
  quantity: number;
  status: string;
  requesting_facility_id: string;
  source_facility_id: string | null;
  created_at: string;
}

export default function FacilityManagerDashboard() {
  const [facilityId, setFacilityId] = useState<string>('');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  });

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((u) => setFacilityId(u.facilityId ?? ''))
      .catch(() => {});
  }, []);

  useEffect(() => {

    // Always load org-wide stats — facility filter would miss cross-tenant data
    Promise.all([
      apiFetch<Summary>('/api/dashboard/summary'),
      apiFetch<{ data: Alert[] }>('/api/alerts?read=false&severity=critical&limit=3'),
      // Load pending first, fallback to in_transit — shows what needs action
      apiFetch<{ data: Transfer[] }>('/api/transfers?limit=10&enrich=1').then((r) => {
        const data = r.data ?? [];
        const pending = data.filter((t) => t.status === 'pending');
        return { data: pending.length > 0 ? pending : data.filter((t) => t.status === 'in_transit') };
      }),
    ]).then(([s, a, t]) => {
      setSummary(s);
      setAlerts(a.data ?? []);
      setTransfers(t.data ?? []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [facilityId]);

  return (
    <div className={`animate-fade-in ${styles.dashboard}`}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.welcomeTitle}>Tableau de bord</h1>
          <p className={styles.welcomeSubtitle}>{currentDate}</p>
        </div>
        <Link href="/alerts" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={15} />
          Voir les alertes
        </Link>
      </header>

      <section className={styles.metricsGrid}>
        <Link href="/inventory" className={styles.card} style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <div className={styles.cardIcon} style={{ background: 'rgba(5,150,105,0.1)', color: 'var(--brand-sage)' }}>
            <Package size={18} />
          </div>
          <div className={styles.metricValue}>{loading ? '--' : (summary?.totalResources ?? '--')}</div>
          <p className={styles.metricLabel}>Ressources en stock</p>
        </Link>
        <Link href="/alerts?severity=critical" className={styles.card} style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <div className={styles.cardIcon} style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--status-error)' }}>
            <AlertTriangle size={18} />
          </div>
          <div className={styles.metricValue}>{loading ? '--' : (summary?.criticalAlerts ?? '--')}</div>
          <p className={styles.metricLabel}>Alertes critiques</p>
        </Link>
        <Link href="/transfers" className={styles.card} style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <div className={styles.cardIcon} style={{ background: 'rgba(14,165,233,0.1)', color: 'var(--status-info)' }}>
            <ArrowLeftRight size={18} />
          </div>
          <div className={styles.metricValue}>{loading ? '--' : (summary?.activeTransfers ?? '--')}</div>
          <p className={styles.metricLabel}>Transferts en cours</p>
        </Link>
        <Link href="/inventory/expiry" className={styles.card} style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <div className={styles.cardIcon} style={{ background: 'rgba(234,179,8,0.1)', color: 'var(--status-warning)' }}>
            <Timer size={18} />
          </div>
          <div className={styles.metricValue}>{loading ? '--' : (summary?.expiringIn7Days ?? '--')}</div>
          <p className={styles.metricLabel}>Expirent dans 7 jours</p>
        </Link>
      </section>

      <div className={styles.mainGrid}>
        <div className={styles.columnLeft}>
          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Alertes prioritaires</h2>
              <Link href="/alerts" className={styles.seeAll}>Tout voir <ChevronRight size={14} /></Link>
            </div>
            {loading || alerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)' }}>
                <PackageX size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }} />
                <p style={{ fontSize: 13 }}>{loading ? 'Chargement...' : 'Aucune alerte active'}</p>
              </div>
            ) : (
              <div className={styles.list}>
                {alerts.map((alert) => (
                  <div key={alert.id} className={styles.listItem}>
                    <div className={styles.itemInfo}>
                      <span className={styles.statusDot} style={{ background: alert.severity === 'critical' ? 'var(--status-error)' : 'var(--status-warning)' }} />
                      <div>
                        <p className={styles.itemTitle}>{alert.title}</p>
                        <p className={styles.itemDesc}>{alert.description ?? ''}</p>
                      </div>
                    </div>
                    {alert.resource_id && (
                      <Link href={`/transfers/new?resource=${alert.resource_id}`} className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px', height: 32 }}>
                        Demander
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                {transfers.some((t) => t.status === 'pending') ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    À approuver
                    <span style={{ background: 'var(--status-error)', color: '#fff', borderRadius: 10, fontSize: 10, fontWeight: 700, padding: '1px 7px' }}>
                      {transfers.filter((t) => t.status === 'pending').length}
                    </span>
                  </span>
                ) : 'Transferts en cours'}
              </h2>
              <Link href="/transfers?tab=pending" className={styles.seeAll}>Tout voir <ChevronRight size={14} /></Link>
            </div>
            {loading || transfers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)' }}>
                <ArrowLeftRight size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }} />
                <p style={{ fontSize: 13 }}>{loading ? 'Chargement...' : 'Aucun transfert en attente'}</p>
              </div>
            ) : (
              <div className={styles.list}>
                {transfers.map((t) => (
                  <div key={t.id} className={styles.listItem}>
                    <div className={styles.itemInfo}>
                      <div className={styles.transferDirIcon} style={{ color: t.status === 'pending' ? 'var(--status-warning)' : 'var(--status-info)' }}>
                        {t.requesting_facility_id === facilityId ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                      </div>
                      <div>
                        <p className={styles.itemTitle}><span className="mono">{t.ref}</span></p>
                        <p className={styles.itemDesc}>
                          {(t as Transfer & { source_facility_name?: string; requesting_facility_name?: string }).source_facility_name ?? '—'}
                          {' → '}
                          {(t as Transfer & { requesting_facility_name?: string }).requesting_facility_name ?? '—'}
                          {' · '}{t.quantity} unités
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`badge ${t.status === 'pending' ? 'warning' : 'info'}`}>{t.status.toUpperCase()}</span>
                      {t.status === 'pending' && (
                        <Link href={`/transfers/${t.id}`} className="btn-primary" style={{ fontSize: 11, padding: '4px 10px', height: 28 }}>
                          Voir →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className={styles.columnRight}>
          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Dernières activités</h2>
            </div>
            <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)' }}>
              <Clock size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }} />
              <p style={{ fontSize: 13 }}>Disponible après connexion DB</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
