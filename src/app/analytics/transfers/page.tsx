import React from 'react';
import Link from 'next/link';
import { BarChart2 } from 'lucide-react';
import styles from './page.module.css';

export default function TransfersAnalyticsPage() {
  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/analytics" className={styles.backLink}>← Analytics</Link>
          <span className={styles.separator}>|</span>
          <h1 className={styles.title}>EFFICACITÉ DES TRANSFERTS</h1>
        </div>
        <button className="btn-secondary">Exporter</button>
      </header>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Période :</label>
          <select className={`input-field ${styles.filterSelect}`}>
            <option value="">Toutes périodes</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Organisation :</label>
          <select className={`input-field ${styles.filterSelect}`}>
            <option value="all">Toute organisation</option>
          </select>
        </div>
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>TOTAL</p>
          <p className={styles.kpiValue}>--</p>
          <p className={styles.kpiSub}>transferts</p>
        </div>
        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>TAUX SUCCÈS</p>
          <p className={styles.kpiValue}>--</p>
          <p className={styles.kpiSub}>complétés</p>
        </div>
        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>DÉLAI MOYEN</p>
          <p className={styles.kpiValue}>--</p>
          <p className={styles.kpiSub}>par transfert</p>
        </div>
        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>INCIDENTS</p>
          <p className={styles.kpiValue}>--</p>
          <p className={styles.kpiSub}>du total</p>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Top ressources transférées</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>RESSOURCE</th>
                <th>TRANSFERTS</th>
                <th>TAUX SUCCÈS</th>
                <th>DÉLAI MOY.</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)' }}>
                  <BarChart2 size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.35 }} />
                  <p style={{ fontSize: 13 }}>Aucune donnée disponible</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Matrice de flux (OD)</h2>
        <div className={styles.fluxCard}>
          <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)' }}>
            <BarChart2 size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }} />
            <p style={{ fontSize: 13 }}>Aucune donnée de flux disponible</p>
          </div>
        </div>
      </section>
    </div>
  );
}
