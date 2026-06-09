import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Megaphone } from 'lucide-react';
import styles from './page.module.css';

export default function BroadcastPage() {
  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/dashboard" className={styles.backLink}>← Dashboard</Link>
          <h1 className={styles.title}>BROADCAST D&apos;URGENCE RÉGIONALE</h1>
        </div>
      </header>

      <div className={styles.warningBanner}>
        <AlertTriangle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
        Cet appel sera envoyé à TOUS les établissements de la région sélectionnée
      </div>

      <form className={styles.formCard}>
        <div className={styles.formGrid}>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="resource">Ressource en pénurie *</label>
            <select id="resource" className={`input-field ${styles.select}`} required>
              <option value="">Sélectionner...</option>
              <option value="sang-o-">Sang O-</option>
              <option value="quinine">Quinine inj.</option>
              <option value="vaccins-vpo">Vaccins VPO</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="facility">Établissement demandeur *</label>
            <select id="facility" className={`input-field ${styles.select}`} required>
              <option value="">Sélectionner un établissement...</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="qty">Quantité minimale *</label>
            <input
              id="qty"
              type="number"
              className="input-field"
              min="1"
              placeholder="Ex: 10"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="region">Région de diffusion *</label>
            <select id="region" className={`input-field ${styles.select}`} required>
              <option value="">Sélectionner une région...</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="delay">Délai de réponse souhaité *</label>
            <select id="delay" className={`input-field ${styles.select}`} required>
              <option value="">Sélectionner...</option>
              <option value="1h">1 heure</option>
              <option value="2h">2 heures</option>
              <option value="4h">4 heures</option>
              <option value="24h">24 heures</option>
            </select>
          </div>

          <div className={styles.formGroupFull}>
            <label className={styles.label} htmlFor="message">Message d&apos;urgence</label>
            <textarea
              id="message"
              className={`input-field ${styles.textarea}`}
              rows={4}
              placeholder="Décrivez la situation d'urgence..."
            ></textarea>
          </div>

          <div className={styles.formGroupFull}>
            <div className={styles.infoRow}>
              <span className={styles.infoIcon}>ℹ</span>
              <span>Établissements qui recevront le broadcast&nbsp;: <strong>--</strong></span>
            </div>
          </div>

          <div className={styles.formGroupFull}>
            <label className={styles.label}>Canaux de diffusion</label>
            <div className={styles.channelRow}>
              <label className={styles.channelOption}>
                <input type="checkbox" defaultChecked />
                <span>App Push</span>
              </label>
              <label className={styles.channelOption}>
                <input type="checkbox" defaultChecked />
                <span>Email</span>
              </label>
              <label className={styles.channelOption}>
                <input type="checkbox" />
                <span>SMS (si configuré)</span>
              </label>
            </div>
          </div>

        </div>

        <div className={styles.formActions}>
          <Link href="/dashboard" className="btn-secondary" style={{padding: '0 2rem'}}>ANNULER</Link>
          <button
            type="submit"
            className={`btn-primary ${styles.btnBroadcast}`}
          >
            <Megaphone size={15} style={{ marginRight: 6 }} /> ENVOYER LE BROADCAST
          </button>
        </div>
      </form>
    </div>
  );
}
