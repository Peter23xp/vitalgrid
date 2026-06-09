import React from 'react';
import Link from 'next/link';
import { History } from 'lucide-react';
import styles from './page.module.css';

export default function TransfersHistoryPage() {
  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/transfers" className={styles.backLink}>← Transferts</Link>
          <h1 className={styles.title}>HISTORIQUE DES TRANSFERTS</h1>
        </div>
        <button className="btn-secondary" style={{ fontSize: '0.875rem', height: '38px', padding: '0 1.25rem' }}>Exporter</button>
      </header>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Période</span>
          <div className={styles.pillGroup}>
            <button className={`${styles.pill} ${styles.pillActive}`}>7j</button>
            <button className={styles.pill}>30j</button>
            <button className={styles.pill}>90j</button>
            <button className={styles.pill}>Personnalisée</button>
          </div>
        </div>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Type</span>
          <select className={`input-field ${styles.select}`}>
            <option>Reçus</option>
            <option>Envoyés</option>
            <option>Tous</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Statut</span>
          <select className={`input-field ${styles.select}`}>
            <option>Tous</option>
            <option>Complété</option>
            <option>Incident</option>
            <option>Annulé</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Ressource</span>
          <select className={`input-field ${styles.select}`}>
            <option>Tous</option>
          </select>
        </div>
      </div>

      <div className={styles.summary}>
        0 transferts
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>DATE</th>
              <th>RÉF.</th>
              <th>RESSOURCE</th>
              <th>QTÉ</th>
              <th>SOURCE → DEST</th>
              <th>STATUT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6}>
                <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)' }}>
                  <History size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }} />
                  <p style={{ fontSize: 13 }}>Aucun transfert dans l'historique</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <div className={styles.pageButtons}>
          <button className={styles.pageBtn}>&lt;</button>
          <button className={`${styles.pageBtn} ${styles.activePage}`}>1</button>
          <button className={styles.pageBtn}>&gt;</button>
        </div>
      </div>
    </div>
  );
}
