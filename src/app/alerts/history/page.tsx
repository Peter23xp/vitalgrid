import React from 'react';
import Link from 'next/link';
import { BellOff } from 'lucide-react';
import styles from './page.module.css';

export default function AlertHistoryPage() {
  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/alerts" className={styles.backLink}>← Alertes</Link>
          <h1 className={styles.title}>HISTORIQUE DES ALERTES</h1>
        </div>
        <div className={styles.headerActions}>
          <button className="btn-outline">Exporter CSV</button>
        </div>
      </header>

      <div className={styles.filterBar}>
        <div className={styles.filterItem}>
          <span className={styles.filterLabel}>Période</span>
          <select className={`input-field ${styles.select}`}>
            <option>30 jours</option>
            <option>7 jours</option>
            <option>90 jours</option>
          </select>
        </div>
        <div className={styles.filterItem}>
          <span className={styles.filterLabel}>Type</span>
          <select className={`input-field ${styles.select}`}>
            <option>Tous</option>
            <option>Stock bas</option>
            <option>Température</option>
            <option>Expiration</option>
            <option>Sync inactivité</option>
          </select>
        </div>
        <div className={styles.filterItem}>
          <span className={styles.filterLabel}>Statut</span>
          <select className={`input-field ${styles.select}`}>
            <option>Tous</option>
            <option>Résolue</option>
            <option>Active</option>
          </select>
        </div>
      </div>

      <div className={styles.summary}>
        0 alertes sur 30 jours
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>DATE</th>
              <th>TYPE</th>
              <th>RESSOURCE</th>
              <th>ÉTABLISSEMENT</th>
              <th>SÉVÉRITÉ</th>
              <th>STATUT</th>
              <th>DÉLAI</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={7}>
                <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)' }}>
                  <BellOff size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }} />
                  <p style={{ fontSize: 13 }}>Aucune alerte dans l&apos;historique</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
