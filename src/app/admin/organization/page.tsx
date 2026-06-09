import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function AdminOrganizationPage() {
  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/dashboard/admin" className={styles.backLink}>← Admin</Link>
          <h1 className={styles.title}>PARAMÈTRES DE L&apos;ORGANISATION</h1>
        </div>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Informations générales</h2>
        <div className={styles.formCard}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nom</label>
              <input type="text" className="input-field" placeholder="Nom de l'organisation" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Type</label>
              <select className={`input-field ${styles.select}`} defaultValue="ong">
                <option value="ong">ONG Humanitaire</option>
                <option value="gouvernement">Gouvernement</option>
                <option value="hopital">Hôpital</option>
                <option value="clinique">Clinique</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Pays</label>
              <input type="text" className="input-field" placeholder="Pays de l'organisation" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Logo</label>
              <div className={styles.logoRow}>
                <div className={styles.logoPlaceholder}>
                  <span className={styles.logoIcon}>🏢</span>
                </div>
                <button className="btn-secondary" style={{height: '36px', padding: '0 1rem', fontSize: '0.85rem'}}>Modifier le logo</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Paramètres régionaux</h2>
        <div className={styles.formCard}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Fuseau horaire</label>
              <select className={`input-field ${styles.select}`}>
                <option value="">Chargement...</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Devise</label>
              <select className={`input-field ${styles.select}`}>
                <option>USD - Dollar américain</option>
                <option>EUR - Euro</option>
                <option>CDF - Franc congolais</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Langue interface</label>
              <select className={`input-field ${styles.select}`}>
                <option>Français</option>
                <option>English</option>
                <option>Swahili</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Paramètres de sécurité</h2>
        <div className={styles.formCard}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Complexité MDP</label>
              <select className={`input-field ${styles.select}`}>
                <option>Élevée</option>
                <option>Moyenne</option>
                <option>Basique</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Expiration MDP</label>
              <select className={`input-field ${styles.select}`}>
                <option>90 jours</option>
                <option>60 jours</option>
                <option>30 jours</option>
                <option>Jamais</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Durée de session</label>
              <select className={`input-field ${styles.select}`}>
                <option>8 heures</option>
                <option>4 heures</option>
                <option>2 heures</option>
                <option>24 heures</option>
              </select>
            </div>
            <div className={styles.formGroupFull}>
              <div className={styles.toggleRow}>
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleLabel}>SSO SAML</span>
                  <span className={styles.toggleDesc}>Domaine: unicef.org</span>
                </div>
                <div className={`${styles.toggle} ${styles.toggleOn}`}>
                  <div className={styles.toggleKnob}></div>
                </div>
              </div>
            </div>
            <div className={styles.formGroupFull}>
              <div className={styles.toggleRow}>
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleLabel}>2FA obligatoire pour les admins</span>
                  <span className={styles.toggleDesc}>Authentification à deux facteurs requise</span>
                </div>
                <div className={`${styles.toggle} ${styles.toggleOn}`}>
                  <div className={styles.toggleKnob}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Notifications</h2>
        <div className={styles.formCard}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email digest</label>
              <select className={`input-field ${styles.select}`}>
                <option>Quotidien</option>
                <option>Hebdomadaire</option>
                <option>Désactivé</option>
              </select>
            </div>
            <div className={styles.formGroupFull}>
              <label className={styles.label}>Canaux activés</label>
              <div className={styles.checkGroup}>
                <label className={styles.checkLabel}>
                  <input type="checkbox" defaultChecked className={styles.checkbox} /> Push
                </label>
                <label className={styles.checkLabel}>
                  <input type="checkbox" defaultChecked className={styles.checkbox} /> Email
                </label>
                <label className={styles.checkLabel}>
                  <input type="checkbox" className={styles.checkbox} /> SMS
                  <span className={styles.checkNote}>SMS nécessite intégration Twilio</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.formActions}>
        <button className="btn-primary">ENREGISTRER LES MODIFICATIONS</button>
      </div>
    </div>
  );
}
