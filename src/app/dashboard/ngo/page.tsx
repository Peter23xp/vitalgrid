'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Package, AlertTriangle, ArrowLeftRight, ChevronRight, MapPin, Megaphone } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Facility { id: string; name: string; region: string | null; status: string; }
interface Transfer { id: string; ref: string; quantity: number; status: string; }

export default function NgoCoordinatorDashboard() {
  const [facilities, setFacilities]   = useState<Facility[]>([]);
  const [transfers, setTransfers]     = useState<Transfer[]>([]);
  const [totalFac, setTotalFac]       = useState(0);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<{ data: Facility[]; total: number }>('/api/facilities?limit=50'),
      apiFetch<{ data: Transfer[] }>('/api/transfers?limit=50'),
    ]).then(([f, t]) => {
      setFacilities(f.data);
      setTotalFac(f.total);
      setTransfers(t.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const critical   = facilities.filter((f) => f.status === 'critical');
  const inTransit  = transfers.filter((t) => t.status === 'in_transit').length;
  const delivered  = transfers.filter((t) => t.status === 'delivered').length;
  const pending    = transfers.filter((t) => t.status === 'pending').length;

  const v = (n: number) => loading ? '--' : n;

  return (
    <div className={`animate-fade-in ${styles.dashboard}`}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.welcomeTitle}>Coordinateur régional</h1>
          <p className={styles.welcomeSubtitle}>Vue Régionale · {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
        </div>
        <Link href="/facilities/map" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <MapPin size={15} />
          Carte régionale
        </Link>
      </header>

      <section className={styles.metricsGrid}>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(14,165,233,0.1)', color: 'var(--status-info)' }}>
            <Building2 size={18} />
          </div>
          <div className={styles.metricValue}>{v(totalFac)}</div>
          <p className={styles.metricLabel}>Établissements</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(5,150,105,0.1)', color: 'var(--brand-sage)' }}>
            <Package size={18} />
          </div>
          <div className={styles.metricValue}>{v(inTransit + pending)}</div>
          <p className={styles.metricLabel}>Transferts actifs</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--status-error)' }}>
            <AlertTriangle size={18} />
          </div>
          <div className={styles.metricValue}>{v(critical.length)}</div>
          <p className={styles.metricLabel}>Établissements en pénurie</p>
        </div>
      </section>

      <div className={styles.mainGrid}>
        <div className={styles.columnLeft}>
          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Établissements en situation critique</h2>
              <Link href="/facilities" className={styles.seeAll}>Tout voir <ChevronRight size={14} /></Link>
            </div>
            {loading ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--brand-slate)', fontSize: 13 }}>Chargement...</div>
            ) : critical.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)' }}>
                <Building2 size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <p style={{ fontSize: 13 }}>Aucun établissement en situation critique</p>
              </div>
            ) : critical.map((f) => (
              <Link key={f.id} href={`/facilities/${f.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--border-light)', textDecoration: 'none' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-navy)' }}>{f.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--brand-slate)' }}>{f.region ?? '—'}</p>
                </div>
                <span className="badge critical">Critique</span>
              </Link>
            ))}
          </section>

          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Transferts inter-établissements</h2>
              <Link href="/transfers" className={styles.seeAll}>Tout voir <ChevronRight size={14} /></Link>
            </div>
            <div className={styles.transferSummary}>
              <div className={styles.transferStats}>
                <div className={styles.statBox}>
                  <span className={styles.statNumber}>{v(inTransit)}</span>
                  <span className={styles.statLabel}>En cours</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statNumber}>{v(delivered)}</span>
                  <span className={styles.statLabel}>Complétés</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statNumber}>{v(pending)}</span>
                  <span className={styles.statLabel}>En attente</span>
                </div>
              </div>
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-light)' }}>
              <Link href="/transfers/broadcast" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--status-error)', fontWeight: 600, textDecoration: 'none' }}>
                <Megaphone size={14} /> Déclencher broadcast d&apos;urgence
              </Link>
            </div>
          </section>
        </div>

        <div className={styles.columnRight}>
          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Établissements ({totalFac})</h2>
              <Link href="/facilities" className={styles.seeAll}>Tout voir <ChevronRight size={14} /></Link>
            </div>
            {loading ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--brand-slate)', fontSize: 13 }}>Chargement...</div>
            ) : facilities.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--brand-slate)', fontSize: 13 }}>Aucun établissement</div>
            ) : (
              <div>
                {facilities.slice(0, 8).map((f) => (
                  <Link key={f.id} href={`/facilities/${f.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', borderBottom: '1px solid var(--border-light)', textDecoration: 'none' }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--brand-navy)' }}>{f.name}</p>
                    <span className={`badge ${f.status === 'active' ? 'success' : f.status === 'critical' ? 'critical' : 'warning'}`} style={{ fontSize: 11 }}>
                      {f.status === 'active' ? 'OK' : f.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
