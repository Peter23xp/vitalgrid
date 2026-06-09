import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function ExportPage() {
  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/analytics" className={styles.backLink}>← Analytics</Link>
          <span className={styles.separator}>|</span>
          <h1 className={styles.title}>EXPORT &amp; RAPPORT API</h1>
        </div>
      </header>

      <div className={styles.mainGrid}>
        <div className={styles.cardElevated}>
          <h2 className={styles.cardTitle}>Générer un export</h2>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Format *</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input type="radio" name="format" defaultChecked /> CSV
              </label>
              <label className={styles.radioLabel}>
                <input type="radio" name="format" /> PDF
              </label>
              <label className={styles.radioLabel}>
                <input type="radio" name="format" /> JSON
              </label>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="report-type">Type de rapport *</label>
            <select id="report-type" className="input-field" defaultValue="inventaire">
              <option value="inventaire">Inventaire</option>
              <option value="transferts">Transferts</option>
              <option value="alertes">Alertes</option>
              <option value="complet">Complet</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Période</label>
            <div className={styles.dateRange}>
              <div className={styles.dateField}>
                <span className={styles.datePrefix}>De</span>
                <input type="date" className={`input-field ${styles.dateInput}`} defaultValue="2026-06-01" />
              </div>
              <div className={styles.dateField}>
                <span className={styles.datePrefix}>À</span>
                <input type="date" className={`input-field ${styles.dateInput}`} defaultValue="2026-06-30" />
              </div>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Établissements</label>
            <div className={styles.chipGroup}>
              <span className={`${styles.chip} ${styles.chipActive}`}>Tous</span>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Métriques</label>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkLabel}>
                <input type="checkbox" defaultChecked /> Stock actuel
              </label>
              <label className={styles.checkLabel}>
                <input type="checkbox" defaultChecked /> Mouvements
              </label>
              <label className={styles.checkLabel}>
                <input type="checkbox" defaultChecked /> Transferts
              </label>
              <label className={styles.checkLabel}>
                <input type="checkbox" defaultChecked /> Alertes
              </label>
            </div>
          </div>

          <button className="btn-primary" style={{ marginTop: '0.5rem' }}>GÉNÉRER L&apos;EXPORT</button>
        </div>

        <div className={styles.cardElevated}>
          <h2 className={styles.cardTitle}>Documentation API REST</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ENDPOINT</th>
                  <th>MÉTHODE</th>
                  <th>DESCRIPTION</th>
                  <th>AUTH</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="mono">/api/inventory</td>
                  <td><span className={styles.methodGet}>GET</span></td>
                  <td>Liste ressources paginée</td>
                  <td className={styles.authCell}>Bearer JWT</td>
                </tr>
                <tr>
                  <td className="mono">/api/transfers</td>
                  <td>
                    <span className={styles.methodGet}>GET</span>
                    <span className={styles.methodPost}>POST</span>
                  </td>
                  <td>CRUD transferts</td>
                  <td className={styles.authCell}>Bearer JWT</td>
                </tr>
                <tr>
                  <td className="mono">/api/alerts</td>
                  <td><span className={styles.methodGet}>GET</span></td>
                  <td>Alertes actives</td>
                  <td className={styles.authCell}>Bearer JWT</td>
                </tr>
                <tr>
                  <td className="mono">/api/analytics/*</td>
                  <td><span className={styles.methodGet}>GET</span></td>
                  <td>Rapports analytiques</td>
                  <td className={styles.authCell}>API Key</td>
                </tr>
                <tr>
                  <td className="mono">/api/admin/audit-log</td>
                  <td><span className={styles.methodGet}>GET</span></td>
                  <td>Journal d&apos;audit</td>
                  <td className={styles.authCell}>API Key + Auditor role</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
