'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Thermometer } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Reading { timestamp: string; celsius: number; isAlert: boolean; }
interface ColdChainData {
  latestReading: { celsius: number; timestamp: string; deviceId: string } | null;
  readings: Reading[];
  stats: { min: number; max: number; avg: number };
  alerts: Reading[];
}

const THRESHOLD_LOW = 2;
const THRESHOLD_HIGH = 8;

function Sparkline({ readings }: { readings: Reading[] }) {
  if (readings.length < 2) return null;
  const temps = readings.map((r) => r.celsius);
  const minT = Math.min(...temps, THRESHOLD_LOW - 1);
  const maxT = Math.max(...temps, THRESHOLD_HIGH + 1);
  const range = maxT - minT || 1;
  const W = 600;
  const H = 120;
  const xStep = W / (readings.length - 1);
  const toY = (c: number) => H - ((c - minT) / range) * H;

  const points = readings.map((r, i) => `${i * xStep},${toY(r.celsius)}`).join(' ');
  const thresholdLowY = toY(THRESHOLD_LOW);
  const thresholdHighY = toY(THRESHOLD_HIGH);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 120 }}>
      <line x1={0} y1={thresholdHighY} x2={W} y2={thresholdHighY} stroke="var(--status-error)" strokeWidth={1} strokeDasharray="4 4" opacity={0.5} />
      <line x1={0} y1={thresholdLowY} x2={W} y2={thresholdLowY} stroke="var(--status-info)" strokeWidth={1} strokeDasharray="4 4" opacity={0.5} />
      <polyline points={points} fill="none" stroke="var(--brand-sage)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {readings.map((r, i) => r.isAlert && (
        <circle key={i} cx={i * xStep} cy={toY(r.celsius)} r={4} fill="var(--status-error)" />
      ))}
    </svg>
  );
}

export default function ColdChainPage() {
  const [transferId, setTransferId] = useState('');
  const [data, setData] = useState<ColdChainData | null>(null);
  const [loading, setLoading] = useState(false);

  const load = (tid: string) => {
    if (!tid) return;
    setLoading(true);
    apiFetch<ColdChainData>(`/api/cold-chain/${tid}?hoursBack=24`)
      .then(setData).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tid = params.get('transferId') ?? '';
    if (tid) { setTransferId(tid); load(tid); }
  }, []);

  const tempOk = data?.latestReading
    ? data.latestReading.celsius >= THRESHOLD_LOW && data.latestReading.celsius <= THRESHOLD_HIGH
    : null;

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/alerts" className={styles.backLink}>← Alertes</Link>
          <h1 className={styles.title}>CHAÎNE DU FROID — MONITORING</h1>
        </div>
      </header>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Transfert :</label>
          <input
            type="text"
            className={`input-field ${styles.filterInput}`}
            placeholder="ID du transfert..."
            value={transferId}
            onChange={(e) => setTransferId(e.target.value)}
            onBlur={() => load(transferId)}
          />
        </div>
      </div>

      {!transferId && (
        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--brand-slate)' }}>
          <Thermometer size={40} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.35 }} />
          <p style={{ fontSize: 14 }}>Saisissez un ID de transfert pour voir les données IoT</p>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--brand-slate)', fontSize: 13 }}>Chargement des données capteurs...</div>
      )}

      {!loading && data && (
        <>
          <div className={styles.tempCard}>
            <div className={styles.tempMain}>
              <span className={styles.tempValue}>
                {data.latestReading ? `${data.latestReading.celsius}°C` : '--'}
              </span>
              {tempOk !== null && (
                <span className={`badge ${tempOk ? 'success' : 'critical'}`} style={{ marginLeft: 16 }}>
                  {tempOk ? 'Zone acceptable (2–8°C)' : 'HORS ZONE'}
                </span>
              )}
            </div>

            {data.readings.length > 0 ? (
              <div className={styles.chartArea}>
                <Sparkline readings={data.readings} />
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--brand-slate)', fontSize: 13 }}>
                Aucune lecture dans les dernières 24h
              </div>
            )}

            <div className={styles.statsRow}>
              <span className={styles.statItem}>Min: <strong className="mono">{data.stats.min}°C</strong></span>
              <span className={styles.statItem}>Max: <strong className="mono">{data.stats.max}°C</strong></span>
              <span className={styles.statItem}>Moy: <strong className="mono">{data.stats.avg}°C</strong></span>
            </div>
          </div>

          {data.alerts.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Événements ({data.alerts.length} alertes)</h2>
              <div className={styles.eventList}>
                {data.alerts.map((a, i) => (
                  <div key={i} className={styles.eventItem}>
                    <span className={`${styles.eventDot} ${styles.eventDotAlert}`} />
                    <span className="mono" style={{ fontSize: 12 }}>{new Date(a.timestamp).toLocaleTimeString('fr-FR')}</span>
                    <span style={{ fontSize: 13 }}>Alerte température</span>
                    <span className="mono">{a.celsius}°C</span>
                    <span className="badge critical">Hors zone</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
