import React from 'react';
import Link from 'next/link';
import { Building2, Package, AlertTriangle, ArrowLeftRight, ChevronRight, MapPin, Megaphone } from 'lucide-react';
import styles from './page.module.css';

export default function NgoCoordinatorDashboard() {
  return (
    <div className={`animate-fade-in ${styles.dashboard}`}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.welcomeTitle}>Coordinateur régional</h1>
          <p className={styles.welcomeSubtitle}>Vue Régionale · Mise à jour en temps réel</p>
        </div>
        <Link href="/facilities/map" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <MapPin size={15} />
          Carte régionale
        </Link>
      </header>

      <section className={styles.metricsGrid}>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(14,165,233,0.1)', color: 'var(--status-info)' }}>
            <Building2 size={18} />
          </div>
          <div className={styles.metricValue}>--</div>
          <p className={styles.metricLabel}>Établissements</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(5,150,105,0.1)', color: 'var(--brand-sage)' }}>
            <Package size={18} />
          </div>
          <div className={styles.metricValue}>--</div>
          <p className={styles.metricLabel}>Types de ressources surveillés</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--status-error)' }}>
            <AlertTriangle size={18} />
          </div>
          <div className={styles.metricValue}>--</div>
          <p className={styles.metricLabel}>Établissements en pénurie</p>
        </div>
      </section>

      <div className={styles.mainGrid}>
        <div className={styles.columnLeft}>
          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Établissements en situation critique</h2>
              <Link href="/facilities" className={styles.seeAll}>
                Tout voir <ChevronRight size={14} />
              </Link>
            </div>
            <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)' }}>
              <Building2 size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ fontSize: 13 }}>Aucun établissement en situation critique</p>
            </div>
          </section>

          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Transferts inter-établissements</h2>
              <Link href="/transfers" className={styles.seeAll}>
                Tout voir <ChevronRight size={14} />
              </Link>
            </div>
            <div className={styles.transferSummary}>
              <div className={styles.transferStats}>
                <div className={styles.statBox}>
                  <span className={styles.statNumber}>--</span>
                  <span className={styles.statLabel}>En cours</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statNumber}>--</span>
                  <span className={styles.statLabel}>Complétés cette semaine</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statNumber}>--</span>
                  <span className={styles.statLabel}>En attente</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className={styles.columnRight}>
          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Carte de chaleur</h2>
              <Link href="/analytics/map" className={styles.seeAll}>
                Plein écran <ChevronRight size={14} />
              </Link>
            </div>
            <div className={styles.mapContainer}>
              <div className={styles.mapPlaceholder}>
                <span className={styles.mapLabel}>Aucune donnée — connectez la base de données</span>
              </div>
            </div>
            <div className={styles.mapLegend}>
              <span className={styles.legendItem}><span style={{ background: 'var(--status-error)' }} />Critique</span>
              <span className={styles.legendItem}><span style={{ background: 'var(--status-warning)' }} />Avertissement</span>
              <span className={styles.legendItem}><span style={{ background: 'var(--status-success)' }} />OK</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
