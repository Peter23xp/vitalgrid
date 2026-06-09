import React from 'react';
import Link from 'next/link';
import { List } from 'lucide-react';
import styles from './page.module.css';
import MapWrapper from './MapWrapper';

export default function FacilitiesMapPage() {
  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.topLeft}>
          <Link href="/dashboard" className={styles.backLink}>← Dashboard</Link>
          <span className={styles.brand}>VitalGrid</span>
          <span className={styles.separator}>|</span>
          <h1 className={styles.title}>Carte des établissements</h1>
        </div>
        <Link href="/facilities" className={styles.viewToggle}>
          <List size={15} />
          Vue liste
        </Link>
      </header>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Région :</label>
          <select className={`input-field ${styles.filterSelect}`}>
            <option>Toutes les régions</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Ressource :</label>
          <select className={`input-field ${styles.filterSelect}`}>
            <option>Toutes</option>
            <option>Sang</option>
            <option>Médicaments</option>
            <option>Vaccins</option>
          </select>
        </div>
        <div className={styles.statusToggles}>
          <button className={`${styles.toggle} ${styles.toggleCritique}`}>Critique</button>
          <button className={`${styles.toggle} ${styles.toggleAvertissement}`}>Avertissement</button>
          <button className={`${styles.toggle} ${styles.toggleOk}`}>OK</button>
          <button className={`${styles.toggle} ${styles.toggleOffline}`}>Hors-ligne</button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        <MapWrapper />
      </div>

      <div className={styles.legendBar}>
        <span className={styles.legendItem}><span className={styles.dotRed} /> Critique</span>
        <span className={styles.legendItem}><span className={styles.dotOrange} /> Avertissement</span>
        <span className={styles.legendItem}><span className={styles.dotGreen} /> OK</span>
        <span className={styles.legendItem}><span className={styles.dotGray} /> Hors-ligne</span>
      </div>
    </div>
  );
}
