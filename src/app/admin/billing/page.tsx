import React from 'react';
import Link from 'next/link';
import { Receipt } from 'lucide-react';
import styles from './page.module.css';

export default function AdminBillingPage() {
  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/dashboard/admin" className={styles.backLink}>← Admin</Link>
          <h1 className={styles.title}>FACTURATION &amp; ABONNEMENT</h1>
        </div>
      </header>

      <div className={styles.planCard}>
        <div className={styles.planHeader}>
          <div>
            <p className={styles.planOrg}>—</p>
            <p className={styles.planName}>Plan: —</p>
            <p className={styles.planRenewal}>Renouvellement: —</p>
          </div>
          <span className="badge info">—</span>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Utilisation actuelle</h2>
        <div className={styles.usageList}>
          <div className={styles.usageRow}>
            <span className={styles.usageLabel}>Établissements</span>
            <div className={styles.usageBarWrap}>
              <div className={styles.usageBar}>
                <div className={`${styles.usageBarFill} ${styles.usageFillGreen}`} style={{ width: '100%' }}></div>
              </div>
            </div>
            <span className={styles.usageValue}>23 / ∞</span>
            <span className={styles.usageMeta}>Illimité</span>
          </div>
          <div className={styles.usageRow}>
            <span className={styles.usageLabel}>Utilisateurs</span>
            <div className={styles.usageBarWrap}>
              <div className={styles.usageBar}>
                <div className={`${styles.usageBarFill} ${styles.usageFillBlue}`} style={{ width: '0%' }}></div>
              </div>
            </div>
            <span className={styles.usageValue}>-- / --</span>
            <span className={styles.usageMeta}>—</span>
          </div>
          <div className={styles.usageRow}>
            <span className={styles.usageLabel}>Requêtes API</span>
            <div className={styles.usageBarWrap}>
              <div className={styles.usageBar}>
                <div className={`${styles.usageBarFill} ${styles.usageFillGreen}`} style={{ width: '0%' }}></div>
              </div>
            </div>
            <span className={styles.usageValue}>-- / -- /mois</span>
            <span className={styles.usageMeta}>—</span>
          </div>
          <div className={styles.usageRow}>
            <span className={styles.usageLabel}>Stockage</span>
            <div className={styles.usageBarWrap}>
              <div className={styles.usageBar}>
                <div className={`${styles.usageBarFill} ${styles.usageFillGreen}`} style={{ width: '0%' }}></div>
              </div>
            </div>
            <span className={styles.usageValue}>-- / --</span>
            <span className={styles.usageMeta}>—</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Plans disponibles</h2>
        <div className={styles.plansGrid}>
          <div className={styles.pricingCard}>
            <h3 className={styles.pricingName}>Freemium</h3>
            <p className={styles.pricingPrice}>Gratuit</p>
            <p className={styles.pricingDesc}>≤5 facilities · ≤20 users</p>
          </div>
          <div className={styles.pricingCard}>
            <h3 className={styles.pricingName}>Standard</h3>
            <p className={styles.pricingPrice}>$199/mois</p>
            <p className={styles.pricingDesc}>≤50 facilities</p>
          </div>
          <div className={`${styles.pricingCard} ${styles.pricingCardActive}`}>
            <h3 className={styles.pricingName}>Enterprise</h3>
            <p className={styles.pricingPrice}>Sur devis</p>
            <p className={styles.pricingDesc}>Illimité</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Factures</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>DATE</th>
                <th>MONTANT</th>
                <th>STATUT</th>
                <th>PDF</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4}>
                  <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)' }}>
                    <Receipt size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }} />
                    <p style={{ fontSize: 13 }}>Aucune facture</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
