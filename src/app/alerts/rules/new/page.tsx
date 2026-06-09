import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function NewAlertRulePage() {
  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/alerts" className={styles.backLink}>← Alertes</Link>
          <h1 className={styles.title}>CRÉER UNE RÈGLE D'ALERTE</h1>
        </div>
      </header>

      <form className={styles.formCard}>
        <div className={styles.formGroup}>
          <label htmlFor="resource">Ressource cible</label>
          <input
            id="resource"
            type="text"
            className="input-field"
            placeholder="Rechercher ressource ou catégorie..."
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="ruleType">Type de règle *</label>
          <select id="ruleType" className={`input-field ${styles.select}`} required>
            <option value="">Sélectionner...</option>
            <option value="stock">Stock bas</option>
            <option value="expiration">Expiration proche</option>
            <option value="temperature">Température</option>
            <option value="sync">Inactivité sync</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="threshold">Seuil numérique *</label>
          <input
            id="threshold"
            type="number"
            className="input-field"
            placeholder="Ex: 10"
            required
          />
          <p className={styles.helperText}>Quantité, jours, ou °C selon le type de règle</p>
        </div>

        <div className={styles.formGroup}>
          <label>Sévérité *</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input type="radio" name="severity" value="warning" className={styles.radioInput} />
              <span className={styles.radioText}>Avertissement</span>
            </label>
            <label className={styles.radioLabel}>
              <input type="radio" name="severity" value="critical" defaultChecked className={styles.radioInput} />
              <span className={styles.radioText}>Critique</span>
            </label>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Canaux de notification</label>
          <div className={styles.checkboxRow}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" defaultChecked className={styles.checkboxInput} />
              <span>App push</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" defaultChecked className={styles.checkboxInput} />
              <span>Email</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" defaultChecked className={styles.checkboxInput} />
              <span>SMS</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" className={styles.checkboxInput} />
              <span>Webhook</span>
            </label>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="repeat">Répétition</label>
          <select id="repeat" className={`input-field ${styles.select}`}>
            <option value="once">Une fois</option>
            <option value="hourly">Chaque heure</option>
            <option value="daily">Quotidien</option>
          </select>
        </div>

        <div className={styles.toggleRow}>
          <span className={styles.toggleRowLabel}>Activer immédiatement</span>
          <input type="checkbox" id="activateNow" className={styles.toggle} defaultChecked />
          <label htmlFor="activateNow" className={styles.toggleLabel}></label>
        </div>

        <div className={styles.formActions}>
          <Link href="/alerts" className="btn-outline">ANNULER</Link>
          <button type="submit" className="btn-primary">CRÉER LA RÈGLE</button>
        </div>
      </form>
    </div>
  );
}
