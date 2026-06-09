import React from 'react';
import Link from 'next/link';
import { Upload, AlertTriangle } from 'lucide-react';
import styles from './page.module.css';

export default function ImportResourcesPage() {
  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/inventory" className={styles.backLink}>← Inventaire</Link>
          <h1 className={styles.title}>IMPORT RESSOURCES CSV</h1>
        </div>
        <div className={styles.headerActions}>
          <button className="btn-secondary">Télécharger template</button>
        </div>
      </header>

      <div className={styles.dropZone}>
        <Upload size={24} />
        <p className={styles.dropPrimary}>Glisser-déposer votre fichier CSV ici</p>
        <p className={styles.dropSecondary}>ou cliquer pour sélectionner</p>
        <p className={styles.dropHint}>max 5MB · colonnes requises: Nom, Catégorie, Quantité, N° lot, Expiration</p>
        <input type="file" accept=".csv" className={styles.fileInput} />
      </div>

      <div className={styles.previewSection}>
        <div className={styles.previewHeader}>
          <span className={styles.previewTitle}>APERÇU — 5 lignes détectées</span>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>LIGNE</th>
                <th>NOM</th>
                <th>CATÉGORIE</th>
                <th>QTÉ</th>
                <th>LOT</th>
                <th>EXPIRATION</th>
                <th>STATUT</th>
              </tr>
            </thead>
            <tbody>
              <tr className={styles.row}>
                <td className="mono">1</td>
                <td>Amoxicilline 500mg</td>
                <td>Méd.</td>
                <td>100</td>
                <td className="mono">LOT-001</td>
                <td>30/06/2026</td>
                <td><span className="badge success">Valide</span></td>
              </tr>
              <tr className={`${styles.row} ${styles.rowError}`}>
                <td className="mono">2</td>
                <td>Sang O-</td>
                <td>Sang</td>
                <td className={styles.errorCell}>-5</td>
                <td className="mono">LOT-002</td>
                <td className={styles.errorCell}>01/01/2020</td>
                <td><span className="badge critical">Erreur: Quantité invalide</span></td>
              </tr>
              <tr className={styles.row}>
                <td className="mono">3</td>
                <td>Vaccin VPO dose</td>
                <td>Vaccin</td>
                <td>45</td>
                <td className="mono">LOT-003</td>
                <td>15/12/2026</td>
                <td><span className="badge success">Valide</span></td>
              </tr>
              <tr className={styles.row}>
                <td className="mono">4</td>
                <td>Seringues 10mL</td>
                <td>Matér.</td>
                <td>500</td>
                <td className="mono">LOT-004</td>
                <td>31/03/2027</td>
                <td><span className="badge success">Valide</span></td>
              </tr>
              <tr className={styles.row}>
                <td className="mono">5</td>
                <td>Chloroquine 250mg</td>
                <td>Méd.</td>
                <td>200</td>
                <td className="mono">LOT-005</td>
                <td>20/08/2026</td>
                <td><span className="badge success">Valide</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.errorReport}>
          <AlertTriangle size={14} />
          <span>1 erreur détectée — ligne 2: quantité doit être &gt; 0</span>
        </div>
      </div>

      <div className={styles.formActions}>
        <Link href="/inventory" className="btn-secondary">ANNULER</Link>
        <button className="btn-primary" disabled>IMPORTER</button>
      </div>
    </div>
  );
}
