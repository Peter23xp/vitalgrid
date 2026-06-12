'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Batch {
  id: string; lot_number: string | null; quantity: number;
  expiry_date: string; resource_name?: string; unit_cost?: number | null;
}

export default function ExpiryRiskPage() {
  const [facilityId, setFacilityId] = useState('');
  const [batches, setBatches]       = useState<Batch[]>([]);
  const [days, setDays]             = useState(30);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((u) => { if (u.facilityId) setFacilityId(u.facilityId); else setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const load = useCallback(() => {
    if (!facilityId) return;
    setLoading(true);
    apiFetch<{ data: Batch[] }>(`/api/inventory/expiry?facilityId=${facilityId}&daysAhead=${days}`)
      .then((r) => setBatches(r.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [facilityId, days]);

  useEffect(() => { load(); }, [load]);

  const today   = new Date();
  const getAge  = (d: string) => Math.ceil((new Date(d).getTime() - today.getTime()) / 86400000);
  const redistrib = batches.filter((b) => getAge(b.expiry_date) > 14).length;
  const totalVal  = batches.reduce((s, b) => s + (b.unit_cost ?? 0) * b.quantity, 0);

  const daysClass = (d: string) => {
    const n = getAge(d);
    return n <= 14 ? styles.daysCell : n <= 30 ? styles.daysWarn : styles.daysInfo;
  };

  const v = (n: number | string) => loading ? '--' : n;

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/analytics" className={styles.backLink}>← Analytics</Link>
          <span className={styles.separator}>|</span>
          <h1 className={styles.title}>RAPPORT RISQUES D&apos;EXPIRATION</h1>
        </div>
        <div className={styles.headerActions}>
          <button className="btn-secondary">Exporter CSV</button>
        </div>
      </header>

      <div className={styles.horizonFilter}>
        <span className={styles.filterLabel}>Horizon :</span>
        {[30, 60, 90].map((d) => (
          <label key={d} className={styles.radioLabel}>
            <input type="radio" name="horizon" checked={days === d} onChange={() => setDays(d)} />
            {d} jours
          </label>
        ))}
      </div>

      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <p className={styles.summaryCardLabel}>À risque</p>
          <p className={styles.summaryCardValue}>{v(batches.length)}</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryCardLabel}>Valeur à perte estimée</p>
          <p className={`${styles.summaryCardValue} ${styles.valueDanger}`}>
            {loading ? '--' : totalVal > 0 ? `$${totalVal.toLocaleString('fr-FR')}` : '--'}
          </p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryCardLabel}>Redistribuables</p>
          <p className={`${styles.summaryCardValue} ${styles.valueSuccess}`}>{v(redistrib)}</p>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>RESSOURCE</th><th>LOT</th><th>QTÉ</th><th>EXPIRE</th><th>JOURS</th><th>RECOMMANDATION</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)', fontSize: 13 }}>Chargement...</td></tr>
            ) : batches.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)' }}>
                    <AlertTriangle size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.35 }} />
                    <p style={{ fontSize: 13 }}>Aucun lot à risque dans les {days} prochains jours</p>
                  </div>
                </td>
              </tr>
            ) : batches.map((b) => {
              const n = getAge(b.expiry_date);
              return (
                <tr key={b.id}>
                  <td style={{ fontWeight: 500 }}>{b.resource_name ?? '—'}</td>
                  <td className="mono" style={{ fontSize: 12 }}>{b.lot_number ?? '—'}</td>
                  <td>{b.quantity}</td>
                  <td className="mono" style={{ fontSize: 12 }}>{new Date(b.expiry_date).toLocaleDateString('fr-FR')}</td>
                  <td className={daysClass(b.expiry_date)}>{n}j</td>
                  <td style={{ fontSize: 12 }}>{n <= 14 ? 'Urgence — redistribuer immédiatement' : n <= 30 ? 'Planifier redistribution' : 'Surveiller'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!loading && (
        <p className={styles.infoRow}>
          {batches.length} lot{batches.length !== 1 ? 's' : ''} au total · {redistrib} redistribuable{redistrib !== 1 ? 's' : ''} · Valeur totale à risque : <strong>{totalVal > 0 ? `$${totalVal.toLocaleString('fr-FR')}` : '—'}</strong>
        </p>
      )}
    </div>
  );
}
