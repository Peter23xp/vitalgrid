'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ScanLine, PackageCheck, ArrowLeftRight, Plus, TriangleAlert, ChevronRight, PackageX } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Alert { id: string; title: string; severity: string; description: string | null; resource_id: string | null; }
interface Transfer {
  id: string; ref: string; quantity: number; status: string;
  requesting_facility_id: string; source_facility_name?: string | null;
  resource_name?: string | null;
}

const STATUS_LABEL: Record<string, { label: string; badge: string }> = {
  pending:   { label: 'En attente d\'approbation', badge: 'warning' },
  confirmed: { label: 'Approuvé — préparation', badge: 'info' },
  in_transit:{ label: 'En transit', badge: 'info' },
  delivered: { label: 'Livré — à réceptionner', badge: 'warning' },
  completed: { label: 'Complété', badge: 'success' },
  cancelled: { label: 'Annulé', badge: 'info' },
  incident:  { label: 'Incident', badge: 'critical' },
};

export default function FieldAgentDashboard() {
  const [facilityId, setFacilityId] = useState<string | null>(null);
  const [alerts, setAlerts]         = useState<Alert[]>([]);
  const [transfers, setTransfers]   = useState<Transfer[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((u) => setFacilityId(u.facilityId ?? ''))
      .catch(() => setFacilityId(''));
  }, []);

  useEffect(() => {
    if (facilityId === null) return;
    const fFilter = facilityId ? `&facilityId=${facilityId}` : '';
    Promise.all([
      apiFetch<{ data: Alert[] }>(`/api/alerts?read=false&severity=critical&limit=5${fFilter}`),
      // All active transfers WHERE this facility is the requester (mes demandes)
      apiFetch<{ data: Transfer[] }>(`/api/transfers?limit=10&enrich=1${fFilter}`).then((r) => ({
        data: (r.data ?? []).filter((t) =>
          ['pending','confirmed','in_transit','delivered'].includes(t.status) &&
          t.requesting_facility_id === facilityId
        ),
      })),
    ]).then(([a, t]) => { setAlerts(a.data ?? []); setTransfers(t.data ?? []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [facilityId]);

  return (
    <div className={`animate-fade-in ${styles.dashboard}`}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.welcomeTitle}>Tableau de bord terrain</h1>
          <p className={styles.welcomeSubtitle}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
        </div>
        <div className={styles.syncIndicator}>
          <span className={styles.syncDot} />
          Synchronisé
        </div>
      </header>

      <section className={styles.topCards}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Alertes critiques</div>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--brand-slate)', fontSize: 13 }}>Chargement...</div>
          ) : alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 20px 8px', color: 'var(--brand-slate)' }}>
              <Package size={28} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
              <p style={{ fontSize: 13 }}>Aucune alerte critique</p>
            </div>
          ) : (
            <div style={{ padding: '8px 0' }}>
              {alerts.map((a) => (
                <div key={a.id} style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--status-error)', marginTop: 4, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-navy)' }}>{a.title}</p>
                    {a.description && <p style={{ fontSize: 11, color: 'var(--brand-slate)' }}>{a.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link href="/alerts" className={styles.taskLink}>Voir toutes les alertes <ChevronRight size={13} /></Link>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Scan rapide</div>
          <button className={`btn-primary ${styles.scanBtn}`}>
            <ScanLine size={16} />
            Scanner un article
          </button>
        </div>
      </section>

      <div className={styles.mainGrid}>
        <div className={styles.columnLeft}>
          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Ressources critiques</h2>
              <Link href="/inventory/low-stock" className={styles.seeAll}>Voir <ChevronRight size={14} /></Link>
            </div>
            {loading ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--brand-slate)', fontSize: 13 }}>Chargement...</div>
            ) : alerts.filter((a) => a.resource_id).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)' }}>
                <PackageX size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <p style={{ fontSize: 13 }}>Aucune ressource critique</p>
              </div>
            ) : (
              <div>
                {alerts.filter((a) => a.resource_id).map((a) => (
                  <div key={a.id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-navy)' }}>{a.title}</p>
                    <Link href={`/transfers/new?resource=${a.resource_id}`} className="btn-secondary" style={{ fontSize: 12, padding: '4px 12px', height: 30 }}>
                      Demander
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Actions rapides</h2>
            </div>
            <div className={styles.actionGrid}>
              <Link href="/inventory/receive" className={styles.actionBlock}>
                <PackageCheck size={20} />
                <span>Enregistrer réception</span>
              </Link>
              <Link href="/transfers/new" className={styles.actionBlock}>
                <ArrowLeftRight size={20} />
                <span>Déclarer transfert</span>
              </Link>
              <Link href="/inventory/new" className={styles.actionBlock}>
                <Plus size={20} />
                <span>Ajouter stock</span>
              </Link>
              <Link href="/alerts" className={styles.actionBlock}>
                <TriangleAlert size={20} />
                <span>Signaler anomalie</span>
              </Link>
            </div>
          </section>
        </div>

        <div className={styles.columnRight}>
          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Mes demandes de transfert</h2>
              <Link href="/transfers" className={styles.seeAll}>Tout voir <ChevronRight size={14} /></Link>
            </div>
            {loading ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--brand-slate)', fontSize: 13 }}>Chargement...</div>
            ) : transfers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)' }}>
                <ArrowLeftRight size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <p style={{ fontSize: 13 }}>Aucune demande active</p>
                <Link href="/transfers/new" className="btn-primary" style={{ display: 'inline-flex', marginTop: 12, padding: '8px 16px', fontSize: 12 }}>
                  Nouvelle demande
                </Link>
              </div>
            ) : (
              <div>
                {transfers.map((t) => {
                  const s = STATUS_LABEL[t.status] ?? { label: t.status, badge: 'info' };
                  const needsAction = t.status === 'delivered';
                  return (
                    <Link key={t.id} href={`/transfers/${t.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--border-light)', textDecoration: 'none' }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-navy)' }} className="mono">{t.ref}</p>
                        <p style={{ fontSize: 11, color: 'var(--brand-slate)', marginTop: 2 }}>
                          {t.resource_name ?? ''}{t.resource_name ? ' · ' : ''}{t.quantity} unités
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--brand-slate)' }}>{s.label}</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <span className={`badge ${s.badge}`} style={{ fontSize: 10 }}>{t.status.toUpperCase()}</span>
                        {needsAction && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--status-warning)' }}>ACTION REQUISE</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
