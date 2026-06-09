'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Users, Zap, CheckCircle2, ChevronRight, Database } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Summary {
  orgs: number;
  facilities: number;
  users: number;
  recentOrgs: { id: string; name: string; type: string; country_code: string; facilitiesCount: number }[];
}

export default function SuperAdminDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Summary>('/api/admin/platform-summary')
      .then(setSummary).catch(console.error).finally(() => setLoading(false));
  }, []);

  const val = (n: number | undefined) => loading ? '--' : (n ?? '--');

  return (
    <div className={`animate-fade-in ${styles.dashboard}`}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.welcomeTitle}>Plateforme VitalGrid</h1>
          <p className={styles.welcomeSubtitle}>Vue globale · Supervision Super Admin</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/admin/organizations" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <Building2 size={15} />Organisations
          </Link>
          <Link href="/admin/system-status" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <CheckCircle2 size={15} />Statut système
          </Link>
        </div>
      </header>

      <section className={styles.metricsGrid}>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(5,150,105,0.1)', color: 'var(--brand-sage)' }}><Building2 size={18} /></div>
          <div className={styles.metricValue}>{val(summary?.orgs)}</div>
          <p className={styles.metricLabel}>Organisations actives</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(14,165,233,0.1)', color: 'var(--status-info)' }}><Building2 size={18} /></div>
          <div className={styles.metricValue}>{val(summary?.facilities)}</div>
          <p className={styles.metricLabel}>Établissements</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(234,179,8,0.1)', color: 'var(--status-warning)' }}><Users size={18} /></div>
          <div className={styles.metricValue}>{val(summary?.users)}</div>
          <p className={styles.metricLabel}>Comptes utilisateurs</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(15,23,42,0.08)', color: 'var(--brand-navy)' }}><Zap size={18} /></div>
          <div className={styles.metricValue}>--</div>
          <p className={styles.metricLabel}>Requêtes API / 24h</p>
        </div>
      </section>

      <div className={styles.mainGrid}>
        <div className={styles.columnLeft}>
          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Santé de l&apos;infrastructure</h2>
              <Link href="/admin/system-status" className={styles.seeAll}>Détails <ChevronRight size={14} /></Link>
            </div>
            <div className={styles.healthList}>
              {[
                { name: 'Aurora DSQL', sub: 'Base de données principale' },
                { name: 'DynamoDB', sub: 'Événements & IoT' },
                { name: 'Vercel Edge', sub: 'Réseau de distribution' },
              ].map((s) => (
                <div key={s.name} className={styles.healthItem}>
                  <div className={styles.healthLeft}>
                    <div className={styles.healthDot} style={{ background: 'var(--brand-slate)' }} />
                    <div>
                      <p className={styles.healthName}>{s.name}</p>
                      <p className={styles.healthSub}>{s.sub}</p>
                    </div>
                  </div>
                  <div className={styles.healthMetrics}>
                    <span className={styles.metricPill}><span className="mono">--</span> latence</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className={styles.columnRight}>
          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Organisations récentes</h2>
              <Link href="/admin/organizations" className={styles.seeAll}>Tout voir <ChevronRight size={14} /></Link>
            </div>
            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--brand-slate)', fontSize: 13 }}>Chargement...</div>
            ) : !summary?.recentOrgs?.length ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--brand-slate)' }}>
                <Building2 size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.35 }} />
                <p style={{ fontSize: 13 }}>Aucune organisation</p>
              </div>
            ) : (
              <div className={styles.orgList}>
                {summary.recentOrgs.map((o) => (
                  <Link key={o.id} href={`/admin/organizations/${o.id}`} className={styles.orgItem} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--border-light)', transition: 'background 0.12s' }}
                    onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-main)')}
                    onMouseOut={(e) => (e.currentTarget.style.background = '')}>
                    <div className={styles.orgAvatar}>{o.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <p className={styles.orgName}>{o.name}</p>
                      <p className={styles.orgMeta}>{Number(o.facilitiesCount)} établissement{Number(o.facilitiesCount) !== 1 ? 's' : ''} · {o.country_code}</p>
                    </div>
                    <ChevronRight size={14} style={{ marginLeft: 'auto', color: 'var(--brand-slate)' }} />
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>Administration</h2></div>
            <div className={styles.quickLinks}>
              <Link href="/admin/organizations" className={styles.quickLink}><Building2 size={15} />Gérer les organisations<ChevronRight size={14} className={styles.quickLinkArrow} /></Link>
              <Link href="/admin/users" className={styles.quickLink}><Users size={15} />Gérer les utilisateurs<ChevronRight size={14} className={styles.quickLinkArrow} /></Link>
              <Link href="/admin/audit-log" className={styles.quickLink}><Database size={15} />Journal d&apos;audit<ChevronRight size={14} className={styles.quickLinkArrow} /></Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
