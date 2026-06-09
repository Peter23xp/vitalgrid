import React from 'react';
import Link from 'next/link';
import { Upload } from 'lucide-react';
import styles from './page.module.css';

export default function OnboardingPage() {
  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Bienvenue sur VitalGrid</h1>
          <p className={styles.subtitle}>Configurez votre organisation en 3 étapes (5 min)</p>
        </div>

        <div className={styles.stepperNav}>
          <div className={styles.stepperLine}></div>
          <div className={`${styles.stepDot} ${styles.stepDotActive}`}>
            <span>●</span>
            <span className={styles.stepLabel}>Organisation</span>
          </div>
          <div className={styles.stepDot}>
            <span>○</span>
            <span className={styles.stepLabel}>Établissements</span>
          </div>
          <div className={styles.stepDot}>
            <span>○</span>
            <span className={styles.stepLabel}>Ressources</span>
          </div>
        </div>

        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>ÉTAPE 1 / 3 — Votre organisation</h2>
          
          <form className={styles.form}>
            <div className={styles.formGroup}>
              <label>Nom de l'organisation *</label>
              <input type="text" className="input-field" placeholder="Ex: MSF Belgique" required />
            </div>

            <div className={styles.formGroup}>
              <label>Type d'organisation *</label>
              <select className={`input-field ${styles.select}`} required>
                <option value="">Sélectionner... ▼</option>
                <option value="ong">ONG Humanitaire</option>
                <option value="hopital">Hôpital-réseau</option>
                <option value="distributeur">Distributeur</option>
                <option value="gouvernement">Gouvernement</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Pays principal *</label>
              <select className={`input-field ${styles.select}`} required>
                <option value="">Chargement des pays...</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Régions d'opération (multi-select)</label>
              <button type="button" className={styles.addRegionBtn}>+ Ajouter une région</button>
            </div>

            <div className={styles.formGroup}>
              <label>Logo (optionnel)</label>
              <div className={styles.uploadBox}>
                <Upload size={24} className={styles.uploadIcon} />
                <span>Télécharger logo</span>
                <span className={styles.uploadMeta}>max 2MB PNG/SVG</span>
              </div>
            </div>
          </form>
        </div>

        <div className={styles.footer}>
          <Link href="/dashboard/admin" className={styles.skipLink}>PASSER</Link>
          <button className={`btn-primary ${styles.continueBtn}`}>CONTINUER →</button>
        </div>
      </div>
    </div>
  );
}
