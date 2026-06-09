import React from 'react';
import Link from 'next/link';
import { AlertCircle, FileText, ArrowLeftRight } from 'lucide-react';
import styles from './page.module.css';

export default function ForecastPage() {
  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/analytics" className={styles.backLink}>← Analytics</Link>
          <span className={styles.separator}>|</span>
          <h1 className={styles.title}>PRÉVISION DE LA DEMANDE</h1>
        </div>
      </header>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Ressource :</label>
          <select className={`input-field ${styles.filterSelect}`} defaultValue="">
            <option value="">Toutes les ressources</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Horizon :</label>
          <select className={`input-field ${styles.filterSelect}`} defaultValue="30">
            <option value="30">30 jours</option>
            <option value="60">60 jours</option>
            <option value="90">90 jours</option>
          </select>
        </div>
      </div>

      <div className={styles.content}>
        <p className={styles.subtitle}>Prévision basée sur historique 6 mois</p>

        <div className={styles.cardElevated}>
          <div className={styles.chartLegend}>
            <span className={styles.legendBlue}>— Stock actuel</span>
            <span className={styles.legendGreen}>-- Prévision avec réapprovo</span>
            <span className={styles.legendRed}>▪ Zone de rupture</span>
          </div>
          <svg viewBox="0 0 500 150" className={styles.chart}>
            <line x1="0" y1="30" x2="500" y2="30" stroke="#E2E8F0" strokeWidth="1" />
            <line x1="0" y1="60" x2="500" y2="60" stroke="#E2E8F0" strokeWidth="1" />
            <line x1="0" y1="90" x2="500" y2="90" stroke="#E2E8F0" strokeWidth="1" />
            <line x1="0" y1="120" x2="500" y2="120" stroke="#E2E8F0" strokeWidth="1" />

            <rect x="300" y="0" width="200" height="150" fill="rgba(239,68,68,0.08)" />
            <line x1="300" y1="0" x2="300" y2="150" stroke="#EF4444" strokeWidth="1" strokeDasharray="4 3" />
            <text x="308" y="14" fontSize="9" fill="#EF4444" fontFamily="var(--font-mono)">Zone de rupture</text>

            <polyline
              points="0,80 100,75 200,65 300,45 400,15"
              fill="none"
              stroke="#0EA5E9"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            <polyline
              points="300,45 400,65 500,85"
              fill="none"
              stroke="#22C55E"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeDasharray="6 3"
            />

            <text x="2" y="140" fontSize="9" fill="#94A3B8" fontFamily="var(--font-mono)">Auj.</text>
            <text x="82" y="140" fontSize="9" fill="#94A3B8" fontFamily="var(--font-mono)">J+5</text>
            <text x="175" y="140" fontSize="9" fill="#94A3B8" fontFamily="var(--font-mono)">J+10</text>
            <text x="258" y="140" fontSize="9" fill="#94A3B8" fontFamily="var(--font-mono)">J+15</text>
            <text x="342" y="140" fontSize="9" fill="#94A3B8" fontFamily="var(--font-mono)">J+20</text>
            <text x="425" y="140" fontSize="9" fill="#94A3B8" fontFamily="var(--font-mono)">J+25</text>
            <text x="472" y="140" fontSize="9" fill="#94A3B8" fontFamily="var(--font-mono)">J+30</text>
          </svg>
        </div>

        <div className={styles.alertBanner}>
          <AlertCircle size={14} style={{ color: 'var(--status-error)', flexShrink: 0 }} />
          <strong>RUPTURE PRÉVUE dans 3 jours (12 juin 2026)</strong>
        </div>

        <div className={styles.recommendationsBox}>
          <h3 className={styles.recTitle}>Recommandations</h3>
          <p className={styles.recLine}>
            <strong>Quantité recommandée à commander :</strong> 15 poches
          </p>
          <p className={styles.recLine}>
            <strong>Basé sur :</strong> consommation moy. 1.8/jour · seuil sécurité 10
          </p>
        </div>

        <div className={styles.actions}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FileText size={15} /> Générer bon de commande</button>
          <Link href="/transfers/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ArrowLeftRight size={15} /> Demander transfert</Link>
        </div>
      </div>
    </div>
  );
}
