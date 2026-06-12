'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, XCircle, RefreshCw, ScrollText } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface HealthResult {
  db: boolean;
  dbMs: number | null;
  orgsCount: number | null;
  facilitiesCount: number | null;
  usersCount: number | null;
}

export default function AdminSystemStatusPage() {
  const [health, setHealth]     = useState<HealthResult | null>(null);
  const [loading, setLoading]   = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const runCheck = () => {
    setLoading(true);
    Promise.all([
      apiFetch<{ data: unknown[] }>('/api/admin/organizations').catch(() => null),
      apiFetch<{ data: unknown[]; total: number }>('/api/admin/users?limit=1').catch(() => null),
      apiFetch<{ data: unknown[]; total: number }>('/api/facilities?limit=1').catch(() => null),
    ]).then(([orgsRes, usersRes, facRes]) => {
      setHealth({
        db: orgsRes !== null,
        dbMs: null,
        orgsCount: orgsRes ? (orgsRes.data?.length ?? 0) : null,
        facilitiesCount: facRes ? (facRes.total ?? null) : null,
        usersCount: usersRes ? (usersRes.total ?? null) : null,
      });
      setLastCheck(new Date());
    }).finally(() => setLoading(false));
  };

  useEffect(() => { runCheck(); }, []);

  const dbOk = health?.db === true;

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/dashboard/admin" className={styles.backLink}>← Admin</Link>
          <h1 className={styles.title}>STATUT DU SYSTÈME</h1>
        </div>
        <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }} onClick={runCheck} disabled={loading}>
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Actualiser
        </button>
      </header>

      <div className={`${styles.overallBanner} ${dbOk ? styles.bannerOk : styles.bannerWarn}`}>
        {dbOk
          ? <><CheckCircle2 size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Tous les systèmes opérationnels</>
          : <><XCircle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> {loading ? 'Vérification en cours…' : 'Problème de connexion détecté'}</>
        }
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Base de données</h2>
        <div className={styles.serviceList}>
          <div className={styles.serviceRow}>
            <span className={styles.serviceName}>Aurora DSQL</span>
            <span className={`badge ${loading ? 'info' : dbOk ? 'success' : 'critical'}`}>
              {loading ? 'Vérification…' : dbOk ? 'Opérationnel' : 'Erreur'}
            </span>
            <span className={styles.serviceMeta}>Organisations: <span className="mono">{health?.orgsCount ?? '--'}</span></span>
            <span className={styles.serviceMeta}>Établissements: <span className="mono">{health?.facilitiesCount ?? '--'}</span></span>
          </div>
          <div className={styles.serviceRow}>
            <span className={styles.serviceName}>Utilisateurs</span>
            <span className={`badge ${loading ? 'info' : dbOk ? 'success' : 'critical'}`}>
              {loading ? 'Vérification…' : dbOk ? 'Opérationnel' : 'Erreur'}
            </span>
            <span className={styles.serviceMeta}>Comptes: <span className="mono">{health?.usersCount ?? '--'}</span></span>
            <span className={styles.serviceMeta}></span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Infrastructure</h2>
        <div className={styles.serviceList}>
          <div className={styles.serviceRow}>
            <span className={styles.serviceName}>Next.js App Router</span>
            <span className="badge success">Opérationnel</span>
            <span className={styles.serviceMeta}>v16.2.7</span>
            <span className={styles.serviceMeta}></span>
          </div>
          <div className={styles.serviceRow}>
            <span className={styles.serviceName}>API Routes</span>
            <span className={`badge ${loading ? 'info' : dbOk ? 'success' : 'warning'}`}>
              {loading ? 'Vérification…' : dbOk ? 'Opérationnel' : 'Dégradé'}
            </span>
            <span className={styles.serviceMeta}></span>
            <span className={styles.serviceMeta}></span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Métriques système</h2>
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <p className={styles.metricLabel}>Organisations</p>
            <p className={`mono ${styles.metricValue}`}>{health?.orgsCount ?? '--'}</p>
          </div>
          <div className={styles.metricCard}>
            <p className={styles.metricLabel}>Établissements</p>
            <p className={`mono ${styles.metricValue}`}>{health?.facilitiesCount ?? '--'}</p>
          </div>
          <div className={styles.metricCard}>
            <p className={styles.metricLabel}>Utilisateurs</p>
            <p className={`mono ${styles.metricValue}`}>{health?.usersCount ?? '--'}</p>
          </div>
          <div className={styles.metricCard}>
            <p className={styles.metricLabel}>Statut DB</p>
            <p className={`mono ${styles.metricValue}`} style={{ color: loading ? 'var(--brand-slate)' : dbOk ? 'var(--status-success)' : 'var(--status-error)' }}>
              {loading ? '…' : dbOk ? 'OK' : 'ERR'}
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Dernière vérification</h2>
        <div className={styles.logViewer}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'rgba(255,255,255,0.3)' }}>
              <RefreshCw size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4, animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: 12 }}>Vérification en cours…</p>
            </div>
          ) : (
            <div style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {lastCheck && (
                <div style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 4 }}>
                  [{lastCheck.toLocaleTimeString('fr-FR')}] Vérification démarrée
                </div>
              )}
              <div style={{ color: dbOk ? '#4ade80' : '#f87171' }}>
                [{lastCheck?.toLocaleTimeString('fr-FR') ?? '—'}] Aurora DSQL: {dbOk ? 'CONNECTED' : 'FAILED'}
              </div>
              {health?.orgsCount != null && (
                <div>[INFO] Organisations chargées: {health.orgsCount}</div>
              )}
              {health?.facilitiesCount != null && (
                <div>[INFO] Établissements: {health.facilitiesCount}</div>
              )}
              <div style={{ color: dbOk ? '#4ade80' : '#f87171' }}>
                [DONE] Statut global: {dbOk ? 'OK' : 'DEGRADED'}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
