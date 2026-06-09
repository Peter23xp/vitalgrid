import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import StockMapWrapper from './MapWrapper';

export default function AnalyticsMapPage() {
  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.topLeft}>
          <Link href="/dashboard" className={styles.backLink}>← Dashboard</Link>
          <span className={styles.separator}>|</span>
          <h1 className={styles.title}>Carte régionale des stocks</h1>
        </div>
      </header>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Ressource :</label>
          <select className={`input-field ${styles.filterSelect}`}>
            <option>Toutes</option>
            <option>Sang O-</option>
            <option>Plasma AB</option>
            <option>Vaccin VPO</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Région :</label>
          <select className={`input-field ${styles.filterSelect}`}>
            <option>Toutes les régions</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Vue :</label>
          <div className={styles.vueToggleGroup}>
            <label className={styles.radioLabel}>
              <input type="radio" name="vue" defaultChecked /> Carte chaleur
            </label>
            <label className={styles.radioLabel}>
              <input type="radio" name="vue" /> Clusters
            </label>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        <StockMapWrapper />
      </div>

      <div className={styles.summaryPanel}>
        <div className={styles.summaryStats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total dans la région :</span>
            <span className={styles.statValue}>--</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Établissements en pénurie :</span>
            <span className={`${styles.statValue} ${styles.statDanger}`}>--</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Dernier transfert :</span>
            <span className={styles.statValue}>--</span>
          </div>
        </div>
        <Link href="/transfers/broadcast" className="btn-primary">
          Déclencher broadcast régional
        </Link>
      </div>
    </div>
  );
}
