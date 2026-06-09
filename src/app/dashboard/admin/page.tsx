import React from 'react';
import Link from 'next/link';
import { Building2, Users, Database, Zap, CheckCircle2, ChevronRight } from 'lucide-react';
import styles from './page.module.css';

export default function SuperAdminDashboard() {
  return (
    <div className={`animate-fade-in ${styles.dashboard}`}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.welcomeTitle}>Plateforme VitalGrid</h1>
          <p className={styles.welcomeSubtitle}>Vue globale · Supervision Super Admin</p>
        </div>
        <Link href="/admin/system-status" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <CheckCircle2 size={15} />
          Statut système
        </Link>
      </header>

      <section className={styles.metricsGrid}>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(5,150,105,0.1)', color: 'var(--brand-sage)' }}>
            <Building2 size={18} />
          </div>
          <div className={styles.metricValue}>--</div>
          <p className={styles.metricLabel}>Organisations actives</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(14,165,233,0.1)', color: 'var(--status-info)' }}>
            <Building2 size={18} />
          </div>
          <div className={styles.metricValue}>--</div>
          <p className={styles.metricLabel}>Établissements</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(234,179,8,0.1)', color: 'var(--status-warning)' }}>
            <Users size={18} />
          </div>
          <div className={styles.metricValue}>--</div>
          <p className={styles.metricLabel}>Comptes utilisateurs</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(15,23,42,0.08)', color: 'var(--brand-navy)' }}>
            <Zap size={18} />
          </div>
          <div className={styles.metricValue}>--</div>
          <p className={styles.metricLabel}>Requêtes API / 24h</p>
        </div>
      </section>

      <div className={styles.mainGrid}>
        <div className={styles.columnLeft}>
          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Santé de l&apos;infrastructure</h2>
              <Link href="/admin/system-status" className={styles.seeAll}>
                Détails <ChevronRight size={14} />
              </Link>
            </div>
            <div className={styles.healthList}>
              <div className={styles.healthItem}>
                <div className={styles.healthLeft}>
                  <div className={styles.healthDot} style={{ background: 'var(--brand-slate)' }} />
                  <div>
                    <p className={styles.healthName}>Aurora DSQL</p>
                    <p className={styles.healthSub}>Base de données principale</p>
                  </div>
                </div>
                <div className={styles.healthMetrics}>
                  <span className={styles.metricPill}><span className="mono">--</span> latence</span>
                  <span className={styles.metricPill}><span className="mono">--</span> conn.</span>
                </div>
              </div>
              <div className={styles.healthItem}>
                <div className={styles.healthLeft}>
                  <div className={styles.healthDot} style={{ background: 'var(--brand-slate)' }} />
                  <div>
                    <p className={styles.healthName}>DynamoDB</p>
                    <p className={styles.healthSub}>Événements & IoT</p>
                  </div>
                </div>
                <div className={styles.healthMetrics}>
                  <span className={styles.metricPill}><span className="mono">--</span> latence</span>
                  <span className={styles.metricPill}><span className="mono">--</span> WCU</span>
                </div>
              </div>
              <div className={styles.healthItem}>
                <div className={styles.healthLeft}>
                  <div className={styles.healthDot} style={{ background: 'var(--brand-slate)' }} />
                  <div>
                    <p className={styles.healthName}>Vercel Edge</p>
                    <p className={styles.healthSub}>Réseau de distribution</p>
                  </div>
                </div>
                <div className={styles.healthMetrics}>
                  <span className={styles.metricPill}><span className="mono">--</span> P95</span>
                  <span className={styles.metricPill}><span className="mono">--</span> uptime</span>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Activité plateforme (24h)</h2>
            </div>
            <div className={styles.chartContainer}>
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--brand-slate)' }}>
                <p style={{ fontSize: 13 }}>Aucune donnée disponible</p>
              </div>
            </div>
          </section>
        </div>

        <div className={styles.columnRight}>
          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Organisations récentes</h2>
              <Link href="/admin/organization" className={styles.seeAll}>
                Gérer <ChevronRight size={14} />
              </Link>
            </div>
            <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)' }}>
              <Building2 size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ fontSize: 13 }}>Aucune organisation récente</p>
            </div>
          </section>

          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Administration</h2>
            </div>
            <div className={styles.quickLinks}>
              <Link href="/admin/users" className={styles.quickLink}>
                <Users size={15} />
                Gérer les utilisateurs
                <ChevronRight size={14} className={styles.quickLinkArrow} />
              </Link>
              <Link href="/admin/audit-log" className={styles.quickLink}>
                <Database size={15} />
                Journal d&apos;audit
                <ChevronRight size={14} className={styles.quickLinkArrow} />
              </Link>
              <Link href="/admin/billing" className={styles.quickLink}>
                <Zap size={15} />
                Facturation
                <ChevronRight size={14} className={styles.quickLinkArrow} />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
