import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function AdminApiKeysPage() {
  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/dashboard/admin" className={styles.backLink}>← Admin</Link>
          <h1 className={styles.title}>CLÉS API &amp; INTÉGRATIONS</h1>
        </div>
        <button className="btn-primary">+ Créer clé</button>
      </header>

      <p className={styles.resultsInfo}>3 clés API actives</p>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>NOM</th>
              <th>SCOPE</th>
              <th>CRÉÉE</th>
              <th>DERNIÈRE UTIL.</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr className={styles.row}>
              <td className={styles.nameCell}>HMIS Integration</td>
              <td><span className="mono">read:all</span></td>
              <td>01/01/26</td>
              <td>il y a 2h</td>
              <td className={styles.actions}>
                <button className={styles.actionBtn}>Voir</button>
                <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`}>Révoquer</button>
              </td>
            </tr>
            <tr className={styles.row}>
              <td className={styles.nameCell}>Tableau de bord</td>
              <td><span className="mono">read:analytics</span></td>
              <td>15/03/26</td>
              <td>il y a 5j</td>
              <td className={styles.actions}>
                <button className={styles.actionBtn}>Voir</button>
                <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`}>Révoquer</button>
              </td>
            </tr>
            <tr className={styles.row}>
              <td className={styles.nameCell}>IoT Gateway</td>
              <td><span className="mono">write:sensors</span></td>
              <td>10/05/26</td>
              <td>il y a 4min</td>
              <td className={styles.actions}>
                <button className={styles.actionBtn}>Voir</button>
                <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`}>Révoquer</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Webhooks</h3>
        <div className={styles.formGroup}>
          <label className={styles.label}>URL</label>
          <input
            type="text"
            className="input-field"
            placeholder="https://votre-systeme.org/webhook"
          />
        </div>
        <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
          <label className={styles.label}>Événements</label>
          <div className={styles.checkGroup}>
            <label className={styles.checkLabel}>
              <input type="checkbox" defaultChecked className={styles.checkbox} /> Alerte critique
            </label>
            <label className={styles.checkLabel}>
              <input type="checkbox" defaultChecked className={styles.checkbox} /> Transfert confirmé
            </label>
            <label className={styles.checkLabel}>
              <input type="checkbox" defaultChecked className={styles.checkbox} /> Stock critique
            </label>
            <label className={styles.checkLabel}>
              <input type="checkbox" className={styles.checkbox} /> Activité normale
            </label>
          </div>
        </div>
        <div className={styles.cardActions}>
          <button className="btn-secondary">Enregistrer webhook</button>
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Intégrations</h3>
        <div className={styles.integrationsGrid}>
          <div className={styles.integrationItem}>
            <div className={styles.integrationHeader}>
              <span className={styles.integrationName}>DHIS2</span>
              <span className="badge info">Connecté</span>
            </div>
            <button className={styles.actionBtn}>Configurer</button>
          </div>
          <div className={styles.integrationItem}>
            <div className={styles.integrationHeader}>
              <span className={styles.integrationName}>OpenMRS</span>
              <span className="badge success">Disponible</span>
            </div>
            <button className={styles.actionBtn}>Configurer</button>
          </div>
          <div className={styles.integrationItem}>
            <div className={styles.integrationHeader}>
              <span className={styles.integrationName}>ERP SAP</span>
              <span className="badge success">Disponible</span>
            </div>
            <button className={styles.actionBtn}>Configurer</button>
          </div>
          <div className={styles.integrationItem}>
            <div className={styles.integrationHeader}>
              <span className={styles.integrationName}>Slack</span>
              <span className="badge warning">Config. requise</span>
            </div>
            <button className={styles.actionBtn}>Configurer</button>
          </div>
        </div>
      </div>
    </div>
  );
}
