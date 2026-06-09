import React from 'react';
import Link from 'next/link';
import { Camera, Pencil } from 'lucide-react';
import styles from './page.module.css';

export default function AddResourcePage() {
  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/inventory" className={styles.backLink}>← Inventaire</Link>
          <h1 className={styles.title}>AJOUTER UNE RESSOURCE</h1>
        </div>
      </header>

      <div className={styles.scanMethods}>
        <button className={styles.scanBtn}>
          <Camera size={16} /> Scanner code-barres
        </button>
        <span className={styles.orText}>── ou ──</span>
        <button className={`${styles.scanBtn} ${styles.activeBtn}`}>
          <Pencil size={16} /> Saisie manuelle
        </button>
      </div>

      <form className={styles.formCard}>
        <div className={styles.formGrid}>
          {/* Ligne 1 */}
          <div className={styles.formGroupFull}>
            <label className={styles.label}>Nom / Dénomination *</label>
            <input type="text" className="input-field" placeholder="Ex: Poches de Sang — Groupe O Négatif" required />
          </div>

          <div className={styles.formGroupFull}>
            <label className={styles.label}>DCI (Dénomination Commune Internationale)</label>
            <input type="text" className="input-field" placeholder="Ex: Paracétamol" />
          </div>

          {/* Ligne 2 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Catégorie *</label>
            <select className={`input-field ${styles.select}`} required>
              <option value="">Sélectionner...</option>
              <option value="sang">Sang</option>
              <option value="medicaments">Médicaments</option>
              <option value="vaccins">Vaccins</option>
              <option value="materiel">Matériel</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Zone de stockage *</label>
            <select className={`input-field ${styles.select}`} required>
              <option value="">Sélectionner...</option>
              <option value="banque">Banque de Sang</option>
              <option value="pharmacie">Pharmacie Centrale</option>
              <option value="urgences">Urgences</option>
            </select>
          </div>

          {/* Ligne 3 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Unité de mesure *</label>
            <select className={`input-field ${styles.select}`} required>
              <option value="">Sélectionner...</option>
              <option value="unites">Unité(s)</option>
              <option value="doses">Dose(s)</option>
              <option value="poches">Poche(s)</option>
              <option value="boites">Boîte(s)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Quantité ajoutée *</label>
            <input type="number" className="input-field" min="1" placeholder="0" required />
          </div>

          {/* Ligne 4 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Numéro de lot *</label>
            <input type="text" className="input-field" placeholder="Ex: LOT-12345" required />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Date d'expiration *</label>
            <input type="date" className="input-field" required />
          </div>

          {/* Ligne 5 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Fournisseur</label>
            <input type="text" className="input-field" placeholder="Ex: MSF Supply" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Numéro de commande</label>
            <input type="text" className="input-field" placeholder="Ex: CMD-99887" />
          </div>

          {/* Ligne 6 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Seuil d'alerte</label>
            <input type="number" className="input-field" min="1" placeholder="Ex: 10" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Emplacement physique</label>
            <input type="text" className="input-field" placeholder="Ex: Étagère A2" />
          </div>

          {/* Ligne 7 */}
          <div className={styles.formGroupFull}>
            <label className={styles.label}>Notes / Observations (optionnel)</label>
            <textarea className={`input-field ${styles.textarea}`} rows={3} placeholder="Détails supplémentaires..."></textarea>
          </div>
        </div>

        <div className={styles.formActions}>
          <Link href="/inventory" className="btn-outline" style={{padding: '0.75rem 2rem'}}>ANNULER</Link>
          <button type="button" className="btn-primary" style={{padding: '0.75rem 2rem'}}>ENREGISTRER</button>
        </div>
      </form>
    </div>
  );
}
