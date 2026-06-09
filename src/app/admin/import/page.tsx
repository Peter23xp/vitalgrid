import React from 'react';
import Link from 'next/link';
import { Upload, AlertTriangle } from 'lucide-react';
import styles from './page.module.css';

export default function AdminImportPage() {
  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/dashboard/admin" className={styles.backLink}>← Admin</Link>
          <h1 className={styles.title}>CENTRE D&apos;IMPORT DE DONNÉES</h1>
        </div>
      </header>

      <p className={styles.subtitle}>Import bulk à l&apos;échelle plateforme — Dry run → Prévisualisation → Confirmation</p>

      <div className={styles.tabs}>
        <button className={styles.tab}>Organisations</button>
        <button className={`${styles.tab} ${styles.tabActive}`}>● Établissements</button>
        <button className={styles.tab}>Utilisateurs</button>
        <button className={styles.tab}>Catalogue</button>
      </div>

      <div className={styles.stepRow}>
        <div className={`${styles.step} ${styles.stepActive}`}>
          <span className={styles.stepNum}>①</span>
          <span className={styles.stepLabel}>Upload</span>
        </div>
        <div className={styles.stepArrow}>→</div>
        <div className={styles.step}>
          <span className={styles.stepNum}>②</span>
          <span className={styles.stepLabel}>Validation</span>
        </div>
        <div className={styles.stepArrow}>→</div>
        <div className={styles.step}>
          <span className={styles.stepNum}>③</span>
          <span className={styles.stepLabel}>Import</span>
        </div>
      </div>

      <div className={styles.dropZone}>
        <Upload size={32} className={styles.dropIcon} />
        <p className={styles.dropMain}>Glisser-déposer CSV / JSON / DHIS2 ici</p>
        <p className={styles.dropSub}>ou cliquer pour sélectionner</p>
        <p className={styles.dropFormats}>Formats: CSV, JSON, DHIS2 · Max 10MB</p>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Prévisualisation (5 premières lignes)</h3>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>LIGNE</th>
                <th>DONNÉES</th>
                <th>STATUT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: 'var(--brand-slate)', fontSize: 13 }}>
                  Importez un fichier pour voir la prévisualisation
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={styles.statsLine}>-- lignes · -- erreurs · -- doublons</p>
        <div className={styles.cardActions}>
          <button className="btn-secondary">Annuler</button>
          <button className="btn-primary">Lancer l&apos;import</button>
        </div>
      </div>

      <div className={styles.historySection}>
        <h3 className={styles.cardTitle}>Imports récents</h3>
        <div className={styles.historyList}>
          <div className={styles.historyItem}>
            <span className={styles.historyDate}>08/06</span>
            <span className={styles.historyDesc}>Établissements — 23 importés</span>
            <span className="badge success">Succès</span>
          </div>
          <div className={styles.historyItem}>
            <span className={styles.historyDate}>01/06</span>
            <span className={styles.historyDesc}>Utilisateurs — 8 importés</span>
            <span className="badge success">Succès</span>
          </div>
        </div>
      </div>
    </div>
  );
}
