import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ScrollText } from 'lucide-react';
import styles from './page.module.css';

export default function AdminSystemStatusPage() {
  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/dashboard/admin" className={styles.backLink}>← Admin</Link>
          <h1 className={styles.title}>STATUT DU SYSTÈME</h1>
        </div>
      </header>

      <div className={styles.overallBanner}>
        <CheckCircle2 size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
        Statut en attente de connexion à la base de données
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Base de données</h2>
        <div className={styles.serviceList}>
          <div className={styles.serviceRow}>
            <span className={styles.serviceName}>Aurora DSQL</span>
            <span className="badge info">Non connecté</span>
            <span className={styles.serviceMeta}>Latence: <span className="mono">--</span></span>
            <span className={styles.serviceMeta}>Connexions: <span className="mono">--</span></span>
          </div>
          <div className={styles.serviceRow}>
            <span className={styles.serviceName}>DynamoDB Events</span>
            <span className="badge info">Non connecté</span>
            <span className={styles.serviceMeta}>Latence: <span className="mono">--</span></span>
            <span className={styles.serviceMeta}>WCU: <span className="mono">--</span></span>
          </div>
          <div className={styles.serviceRow}>
            <span className={styles.serviceName}>DynamoDB Notifications</span>
            <span className="badge info">Non connecté</span>
            <span className={styles.serviceMeta}>Latence: <span className="mono">--</span></span>
            <span className={styles.serviceMeta}></span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Infrastructure</h2>
        <div className={styles.serviceList}>
          <div className={styles.serviceRow}>
            <span className={styles.serviceName}>Vercel Edge</span>
            <span className="badge info">Non connecté</span>
            <span className={styles.serviceMeta}>P95: <span className="mono">--</span></span>
            <span className={styles.serviceMeta}>Uptime: <span className="mono">--</span></span>
          </div>
          <div className={styles.serviceRow}>
            <span className={styles.serviceName}>API Gateway</span>
            <span className="badge info">Non connecté</span>
            <span className={styles.serviceMeta}></span>
            <span className={styles.serviceMeta}>Uptime: <span className="mono">--</span></span>
          </div>
          <div className={styles.serviceRow}>
            <span className={styles.serviceName}>WebSocket</span>
            <span className="badge info">Non connecté</span>
            <span className={styles.serviceMeta}><span className="mono">--</span></span>
            <span className={styles.serviceMeta}></span>
          </div>
          <div className={styles.serviceRow}>
            <span className={styles.serviceName}>Storage S3</span>
            <span className="badge info">Non connecté</span>
            <span className={styles.serviceMeta}></span>
            <span className={styles.serviceMeta}></span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Métriques 24h</h2>
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <p className={styles.metricLabel}>API Requêtes</p>
            <p className={`mono ${styles.metricValue}`}>--</p>
          </div>
          <div className={styles.metricCard}>
            <p className={styles.metricLabel}>Erreurs 5xx</p>
            <p className={`mono ${styles.metricValue}`}>--</p>
          </div>
          <div className={styles.metricCard}>
            <p className={styles.metricLabel}>Transactions DSQL</p>
            <p className={`mono ${styles.metricValue}`}>--</p>
          </div>
          <div className={styles.metricCard}>
            <p className={styles.metricLabel}>Conflits OCC</p>
            <p className={`mono ${styles.metricValue}`}>--</p>
          </div>
          <div className={styles.metricCard}>
            <p className={styles.metricLabel}>Events DynamoDB</p>
            <p className={`mono ${styles.metricValue}`}>--</p>
          </div>
          <div className={styles.metricCard}>
            <p className={styles.metricLabel}>Alertes IoT</p>
            <p className={`mono ${styles.metricValue}`}>--</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Logs système récents</h2>
        <div className={styles.logViewer}>
          <div style={{ textAlign: 'center', padding: '24px', color: 'rgba(255,255,255,0.3)' }}>
            <ScrollText size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
            <p style={{ fontSize: 12 }}>Aucun log disponible</p>
          </div>
        </div>
      </section>
    </div>
  );
}
