import React from 'react';
import Link from 'next/link';
import { Droplets, Pill, Syringe, Stethoscope, Package } from 'lucide-react';
import styles from './page.module.css';

export default function CategoriesPage() {
  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/inventory" className={styles.backLink}>← Inventaire</Link>
          <h1 className={styles.title}>CATALOGUE DE CATÉGORIES</h1>
        </div>
        <div className={styles.headerActions}>
          <button className="btn-primary">+ Nouvelle catégorie</button>
        </div>
      </header>

      <p className={styles.subtitle}>Configuration des types de ressources — Super Admin</p>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Droplets size={24} className={styles.cardIcon} />
            <div className={styles.cardInfo}>
              <h3 className={styles.cardTitle}>Sang</h3>
              <p className={styles.cardDesc}>Poches, composants sanguins, plasma</p>
            </div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.attribute}>
              <span className={styles.attrLabel}>Attributs requis:</span>
              <span className={styles.attrValue}>Groupe sanguin, Volume</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.subCatCount}>4 sous-catégories</span>
              <button className="btn-secondary">Modifier</button>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Pill size={24} className={styles.cardIcon} />
            <div className={styles.cardInfo}>
              <h3 className={styles.cardTitle}>Médicaments</h3>
              <p className={styles.cardDesc}>DCI, formes pharmaceutiques</p>
            </div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.attribute}>
              <span className={styles.attrLabel}>Attributs:</span>
              <span className={styles.attrValue}>DCI, Forme, Dosage</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.subCatCount}>12 sous-catégories</span>
              <button className="btn-secondary">Modifier</button>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Syringe size={24} className={styles.cardIcon} />
            <div className={styles.cardInfo}>
              <h3 className={styles.cardTitle}>Vaccins</h3>
              <p className={styles.cardDesc}>Vaccins, sérums, immunoglobulines</p>
            </div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.attribute}>
              <span className={styles.attrLabel}>Attributs:</span>
              <span className={styles.attrValue}>Vaccin, Dose, Chaîne du froid requis</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.subCatCount}>6 sous-catégories</span>
              <button className="btn-secondary">Modifier</button>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Stethoscope size={24} className={styles.cardIcon} />
            <div className={styles.cardInfo}>
              <h3 className={styles.cardTitle}>Matériel médical</h3>
              <p className={styles.cardDesc}>Consommables, équipements</p>
            </div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.attribute}>
              <span className={styles.attrLabel}>Attributs:</span>
              <span className={styles.attrValue}>Type, Taille, Stérilisation</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.subCatCount}>8 sous-catégories</span>
              <button className="btn-secondary">Modifier</button>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Package size={24} className={styles.cardIcon} />
            <div className={styles.cardInfo}>
              <h3 className={styles.cardTitle}>Autre</h3>
              <p className={styles.cardDesc}>Ressources non classifiées</p>
            </div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.attribute}>
              <span className={styles.attrLabel}>Attributs:</span>
              <span className={styles.attrValue}>Aucun requis</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.subCatCount}>0 sous-catégories</span>
              <button className="btn-secondary">Modifier</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
