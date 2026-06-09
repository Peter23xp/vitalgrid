import React from 'react';
import Link from 'next/link';
import { Package } from 'lucide-react';
import styles from './page.module.css';

export default async function FacilityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/facilities" className={styles.backLink}>← Établissements</Link>
          <h1 className={styles.title}>ÉTABLISSEMENT #{id}</h1>
        </div>
        <div className={styles.headerActions}>
          <Link href="/facilities/new" className="btn-secondary">Éditer</Link>
        </div>
      </header>

      <div className={styles.heroCard}>
        <div className={styles.heroMain}>
          <h2 className={styles.heroName}>Établissement #{id}</h2>
          <p className={styles.heroMeta}>—</p>
        </div>
        <div className={styles.heroStatus}>
          <span className={styles.syncInfo}>—</span>
        </div>
      </div>

      <div className={styles.metricsRow}>
        <div className={styles.metricCard}>
          <h3 className={styles.metricLabel}>RESSOURCES</h3>
          <div className={styles.metricValue}>--</div>
          <p className={styles.metricDesc}>unités</p>
        </div>
        <div className={styles.metricCard}>
          <h3 className={styles.metricLabel}>ALERTES</h3>
          <div className={styles.metricValue}>--</div>
          <p className={styles.metricDesc}>actives</p>
        </div>
        <div className={styles.metricCard}>
          <h3 className={styles.metricLabel}>PERSONNEL</h3>
          <div className={styles.metricValue}>--</div>
          <p className={styles.metricDesc}>agents</p>
        </div>
      </div>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Inventaire actuel</h3>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>NOM</th>
                <th>STATUT</th>
                <th>QTÉ</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4}>
                  <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)' }}>
                    <Package size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }} />
                    <p style={{ fontSize: 13 }}>Aucun inventaire disponible</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className={styles.sectionFooter}>
          <Link href="/inventory" className={styles.viewAllLink}>Voir tout l&apos;inventaire →</Link>
        </div>
      </section>

      <div className={styles.infoGrid}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Informations</h3>
          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Adresse</span>
              <span className={styles.infoValue}>—</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>GPS</span>
              <span className={`${styles.infoValue} mono`}>—</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Capacité lits</span>
              <span className={styles.infoValue}>—</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Zones de stockage</h3>
          <div className={styles.zonesCard}>
            <div className={styles.zonesWrap}>
              <span style={{ color: 'var(--brand-slate)', fontSize: 13 }}>Aucune zone configurée</span>
            </div>
          </div>
        </section>
      </div>

      <div className={styles.pageActions}>
        <Link href={`/facilities/${id}/staff`} className="btn-secondary">Gérer le personnel</Link>
      </div>
    </div>
  );
}
