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
  const [facilityId, setFacilityId] = useState('');
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
      .then((u) => { if (u.facilityId) setFacilityId(u.facilityId); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!facilityId || facilityId === '00000000-0000-0000-0000-000000000001') {
      setLoading(false);
      return;
    }
    Promise.all([
      apiFetch<Summary>(`/api/dashboard/summary?facilityId=${facilityId}`),
      apiFetch<{ data: Alert[] }>(`/api/alerts?facilityId=${facilityId}&read=false&severity=critical&limit=3`),
      apiFetch<{ data: Transfer[] }>(`/api/transfers?facilityId=${facilityId}&status=in_transit`),
    ]).then(([s, a, t]) => {
      setSummary(s);
      setAlerts(a.data);
      setTransfers(t.data);
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
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(5,150,105,0.1)', color: 'var(--brand-sage)' }}>
            <Package size={18} />
          </div>
          <div className={styles.metricValue}>{loading ? '--' : (summary?.totalResources ?? '--')}</div>
          <p className={styles.metricLabel}>Ressources en stock</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--status-error)' }}>
            <AlertTriangle size={18} />
          </div>
          <div className={styles.metricValue}>{loading ? '--' : (summary?.criticalAlerts ?? '--')}</div>
          <p className={styles.metricLabel}>Alertes critiques</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(14,165,233,0.1)', color: 'var(--status-info)' }}>
            <ArrowLeftRight size={18} />
          </div>
          <div className={styles.metricValue}>{loading ? '--' : (summary?.activeTransfers ?? '--')}</div>
          <p className={styles.metricLabel}>Transferts en cours</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(234,179,8,0.1)', color: 'var(--status-warning)' }}>
            <Timer size={18} />
          </div>
          <div className={styles.metricValue}>{loading ? '--' : (summary?.expiringIn7Days ?? '--')}</div>
          <p className={styles.metricLabel}>Expirent dans 7 jours</p>
        </div>
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
              <h2 className={styles.sectionTitle}>Transferts en cours</h2>
              <Link href="/transfers" className={styles.seeAll}>Tout voir <ChevronRight size={14} /></Link>
            </div>
            {loading || transfers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)' }}>
                <ArrowLeftRight size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }} />
                <p style={{ fontSize: 13 }}>{loading ? 'Chargement...' : 'Aucun transfert en cours'}</p>
              </div>
            ) : (
              <div className={styles.list}>
                {transfers.map((t) => (
                  <div key={t.id} className={styles.listItem}>
                    <div className={styles.itemInfo}>
                      <div className={styles.transferDirIcon} style={{ color: 'var(--status-info)' }}>
                        {t.requesting_facility_id === facilityId ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                      </div>
                      <div>
                        <p className={styles.itemTitle}><span className="mono">{t.ref}</span></p>
                        <p className={styles.itemDesc}>{t.quantity} unités</p>
                      </div>
                    </div>
                    <span className="badge info">{t.status}</span>
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
