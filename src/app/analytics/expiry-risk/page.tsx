import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function ExpiryRiskPage() {
  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/analytics" className={styles.backLink}>← Analytics</Link>
          <span className={styles.separator}>|</span>
          <h1 className={styles.title}>RAPPORT RISQUES D&apos;EXPIRATION</h1>
        </div>
        <div className={styles.headerActions}>
          <button className="btn-secondary">Exporter PDF</button>
          <button className="btn-secondary">Exporter CSV</button>
        </div>
      </header>

      <div className={styles.horizonFilter}>
        <span className={styles.filterLabel}>Horizon :</span>
        <label className={styles.radioLabel}>
          <input type="radio" name="horizon" defaultChecked /> 30 jours
        </label>
        <label className={styles.radioLabel}>
          <input type="radio" name="horizon" /> 60 jours
        </label>
        <label className={styles.radioLabel}>
          <input type="radio" name="horizon" /> 90 jours
        </label>
      </div>

      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <p className={styles.summaryCardLabel}>À risque</p>
          <p className={styles.summaryCardValue}>--</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryCardLabel}>Valeur à perte estimée</p>
          <p className={`${styles.summaryCardValue} ${styles.valueDanger}`}>--</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryCardLabel}>Redistribuables</p>
          <p className={`${styles.summaryCardValue} ${styles.valueSuccess}`}>--</p>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>RESSOURCE</th>
              <th>LOT</th>
              <th>QTÉ</th>
              <th>EXPIRE</th>
              <th>JOURS</th>
              <th>VALEUR EST.</th>
              <th>RECOMMANDATION</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)' }}>
                <p style={{ fontSize: 13 }}>Aucune donnée disponible</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className={styles.infoRow}>
        -- lots au total · -- redistribuables · Valeur totale à risque : <strong>--</strong>
      </p>
    </div>
  );
}
