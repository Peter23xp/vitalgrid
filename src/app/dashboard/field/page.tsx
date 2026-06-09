import React from 'react';
import Link from 'next/link';
import { Package, ScanLine, PackageCheck, ArrowLeftRight, Plus, TriangleAlert, ChevronRight, PackageX } from 'lucide-react';
import styles from './page.module.css';

export default function FieldAgentDashboard() {
  return (
    <div className={`animate-fade-in ${styles.dashboard}`}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.welcomeTitle}>Tableau de bord terrain</h1>
          <p className={styles.welcomeSubtitle}>Agent de terrain</p>
        </div>
        <div className={`${styles.syncIndicator}`}>
          <span className={styles.syncDot} />
          Synchronisé
        </div>
      </header>

      <section className={styles.topCards}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Tâches en attente</div>
          <div style={{ textAlign: 'center', padding: '20px 20px 8px', color: 'var(--brand-slate)' }}>
            <Package size={28} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
            <p style={{ fontSize: 13 }}>Aucune tâche en attente</p>
          </div>
          <Link href="/inventory/new" className={styles.taskLink}>
            Saisir maintenant <ChevronRight size={13} />
          </Link>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Scan rapide</div>
          <button className={`btn-primary ${styles.scanBtn}`}>
            <ScanLine size={16} />
            Scanner un article
          </button>
        </div>
      </section>

      <div className={styles.mainGrid}>
        <div className={styles.columnLeft}>
          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Ressources critiques dans ma zone</h2>
            </div>
            <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)' }}>
              <PackageX size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ fontSize: 13 }}>Aucune ressource critique</p>
            </div>
          </section>

          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Actions rapides</h2>
            </div>
            <div className={styles.actionGrid}>
              <Link href="/inventory/receive" className={styles.actionBlock}>
                <PackageCheck size={20} />
                <span>Enregistrer réception</span>
              </Link>
              <Link href="/transfers/new" className={styles.actionBlock}>
                <ArrowLeftRight size={20} />
                <span>Déclarer transfert</span>
              </Link>
              <Link href="/inventory/new" className={styles.actionBlock}>
                <Plus size={20} />
                <span>Ajouter stock</span>
              </Link>
              <Link href="/alerts" className={styles.actionBlock}>
                <TriangleAlert size={20} />
                <span>Signaler anomalie</span>
              </Link>
            </div>
          </section>
        </div>

        <div className={styles.columnRight}>
          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Transferts entrants</h2>
            </div>
            <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)' }}>
              <ArrowLeftRight size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ fontSize: 13 }}>Aucun transfert entrant</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
