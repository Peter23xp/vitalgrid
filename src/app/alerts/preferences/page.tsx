import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function AlertPreferencesPage() {
  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/alerts" className={styles.backLink}>← Alertes</Link>
          <h1 className={styles.title}>PRÉFÉRENCES DE NOTIFICATIONS</h1>
        </div>
      </header>

      <p className={styles.subtitle}>Configuration personnelle</p>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Types d'alertes</h2>
        <div className={styles.toggleList}>
          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleName}>Stock critique</span>
              <span className={styles.toggleDesc}>Niveaux en dessous du seuil</span>
            </div>
            <input type="checkbox" id="pref-stock" className={styles.toggle} defaultChecked />
            <label htmlFor="pref-stock" className={styles.toggleLabel}></label>
          </div>
          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleName}>Expirations proches</span>
              <span className={styles.toggleDesc}>Ressources expirant &lt; 30 jours</span>
            </div>
            <input type="checkbox" id="pref-expiry" className={styles.toggle} defaultChecked />
            <label htmlFor="pref-expiry" className={styles.toggleLabel}></label>
          </div>
          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleName}>Alertes chaîne du froid</span>
              <span className={styles.toggleDesc}>Variations de température</span>
            </div>
            <input type="checkbox" id="pref-cold" className={styles.toggle} defaultChecked />
            <label htmlFor="pref-cold" className={styles.toggleLabel}></label>
          </div>
          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleName}>Nouveaux transferts</span>
              <span className={styles.toggleDesc}>Transferts vers ma zone</span>
            </div>
            <input type="checkbox" id="pref-transfers" className={styles.toggle} defaultChecked />
            <label htmlFor="pref-transfers" className={styles.toggleLabel}></label>
          </div>
          <div className={`${styles.toggleRow} ${styles.toggleRowLast}`}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleName}>Activité synchronisation</span>
              <span className={styles.toggleDesc}>Statut de sync offline</span>
            </div>
            <input type="checkbox" id="pref-sync" className={styles.toggle} />
            <label htmlFor="pref-sync" className={styles.toggleLabel}></label>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Canaux</h2>
        <div className={styles.toggleList}>
          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleName}>App Push</span>
            </div>
            <input type="checkbox" id="chan-push" className={styles.toggle} defaultChecked />
            <label htmlFor="chan-push" className={styles.toggleLabel}></label>
          </div>
          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleName}>Email</span>
            </div>
            <input type="checkbox" id="chan-email" className={styles.toggle} defaultChecked />
            <label htmlFor="chan-email" className={styles.toggleLabel}></label>
          </div>
          <div className={`${styles.toggleRow} ${styles.toggleRowLast}`}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleName}>SMS</span>
              <span className={styles.toggleDesc}>Configuré par l'administrateur</span>
            </div>
            <input type="checkbox" id="chan-sms" className={styles.toggle} />
            <label htmlFor="chan-sms" className={styles.toggleLabel}></label>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Plages horaires</h2>
        <div className={styles.timeRangeRow}>
          <span className={styles.timeRangeLabel}>Recevoir entre :</span>
          <div className={styles.timeInputs}>
            <input type="time" className={`input-field ${styles.timeInput}`} defaultValue="08:00" />
            <span className={styles.timeRangeSeparator}>À</span>
            <input type="time" className={`input-field ${styles.timeInput}`} defaultValue="22:00" />
          </div>
        </div>
        <div className={`${styles.toggleRow} ${styles.toggleRowLast}`}>
          <div className={styles.toggleInfo}>
            <span className={styles.toggleName}>Mode silencieux la nuit (22h-8h)</span>
          </div>
          <input type="checkbox" id="pref-silent" className={styles.toggle} defaultChecked />
          <label htmlFor="pref-silent" className={styles.toggleLabel}></label>
        </div>
      </div>

      <div className={styles.formActions}>
        <button type="button" className="btn-primary">ENREGISTRER</button>
      </div>
    </div>
  );
}
