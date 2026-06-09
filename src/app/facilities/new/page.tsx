import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function FacilityNewPage() {
  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/facilities" className={styles.backLink}>← Établissements</Link>
          <h1 className={styles.title}>AJOUTER UN ÉTABLISSEMENT</h1>
        </div>
      </header>

      <form className={styles.formCard}>
        <div className={styles.formGrid}>
          <div className={styles.formGroupFull}>
            <label className={styles.label}>Nom établissement *</label>
            <input type="text" className="input-field" placeholder="Ex: Hôpital Général de Référence" required />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Type *</label>
            <select className={`input-field ${styles.select}`} required>
              <option value="">Sélectionner...</option>
              <option value="hopital">Hôpital</option>
              <option value="clinique">Clinique</option>
              <option value="centre-sante">Centre de Santé</option>
              <option value="ong">ONG</option>
              <option value="depot">Dépôt</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Pays *</label>
            <select className={`input-field ${styles.select}`} required>
              <option value="">Chargement...</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Région *</label>
            <select className={`input-field ${styles.select}`} required>
              <option value="">Sélectionnez d&apos;abord un pays</option>
            </select>
          </div>

          <div className={styles.formGroupFull}>
            <label className={styles.label}>Adresse complète *</label>
            <textarea className={`input-field ${styles.textarea}`} rows={2} placeholder="Adresse complète de l'établissement" required></textarea>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Latitude</label>
            <input type="number" step="any" className="input-field" placeholder="-1.6792" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Longitude</label>
            <input type="number" step="any" className="input-field" placeholder="29.2284" />
          </div>

          <div className={styles.formGroupFull}>
            <div className={styles.mapPicker}>
              📍 Cliquez sur la carte pour définir les coordonnées GPS
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Contact principal *</label>
            <input type="text" className="input-field" placeholder="Ex: Dr. Amara Diallo" required />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Téléphone *</label>
            <input type="tel" className="input-field" placeholder="+243 81X XXX XXX" required />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Email contact</label>
            <input type="email" className="input-field" placeholder="contact@etablissement.cd" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Zones de stockage</label>
            <input type="text" className="input-field" placeholder="Pharmacie, Urgences, Banque de Sang..." />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Capacité lits</label>
            <input type="number" className="input-field" placeholder="Ex: 280" />
          </div>

          <div className={styles.formGroupFull}>
            <label className={styles.label}>Notes (optionnel)</label>
            <textarea className={`input-field ${styles.textarea}`} rows={3} placeholder="Informations supplémentaires..."></textarea>
          </div>
        </div>

        <div className={styles.formActions}>
          <Link href="/facilities" className="btn-outline" style={{ padding: '0.75rem 2rem' }}>ANNULER</Link>
          <button type="button" className="btn-primary" style={{ padding: '0.75rem 2rem' }}>ENREGISTRER</button>
        </div>
      </form>
    </div>
  );
}
