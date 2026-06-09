'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, Megaphone } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface BatchRow {
  id: string; batch_number: string; quantity: number; expiry_date: string;
  resource_name: string; unit_of_measure: string; resource_id: string;
}

export default function ExpiryPage() {
  const facilityId = process.env.NEXT_PUBLIC_FACILITY_ID ?? '';
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [daysAhead, setDaysAhead] = useState(7);

  useEffect(() => {
    if (!facilityId || facilityId === '00000000-0000-0000-0000-000000000001') { setLoading(false); return; }
    setLoading(true);
    apiFetch<BatchRow[]>(`/api/inventory/expiry?facilityId=${facilityId}&daysAhead=${daysAhead}`)
      .then(setBatches).catch(console.error).finally(() => setLoading(false));
  }, [facilityId, daysAhead]);

  const daysLeft = (date: string) => Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/inventory" className={styles.backLink}>← Inventaire</Link>
          <h1 className={styles.title}>SUIVI DES EXPIRATIONS</h1>
        </div>
        <button className="btn-outline">Exporter liste</button>
      </header>

      <div className={styles.horizonTabs}>
        {[7, 30, 90].map((d) => (
          <button key={d} className={`${styles.horizonBtn} ${daysAhead === d ? styles.horizonActive : ''}`} onClick={() => setDaysAhead(d)}>
            {d} jours
          </button>
        ))}
      </div>

      <p style={{ marginBottom: 20, color: 'var(--brand-slate)', fontSize: 14 }}>
        {loading ? 'Chargement...' : `${batches.length} ressource${batches.length !== 1 ? 's' : ''} expirent dans moins de ${daysAhead} jours`}
      </p>

      {!loading && batches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--brand-slate)' }}>
          <Clock size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }} />
          <p style={{ fontSize: 13 }}>Aucune ressource dans cette période</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead><tr><th>RESSOURCE</th><th>LOT</th><th>QTÉ</th><th>EXPIRE</th><th>JOURS</th><th>ACTION</th></tr></thead>
            <tbody>
              {batches.map((b) => {
                const days = daysLeft(b.expiry_date);
                const cls = days <= 3 ? 'critical' : days <= 7 ? 'warning' : 'info';
                return (
                  <tr key={b.id} className={styles.row}>
                    <td>{b.resource_name}</td>
                    <td className="mono">{b.batch_number}</td>
                    <td>{b.quantity} {b.unit_of_measure}</td>
                    <td>{b.expiry_date}</td>
                    <td><span className={`badge ${cls}`}>J+{days}</span></td>
                    <td><Link href={`/transfers/broadcast?resource=${b.resource_id}`} className="btn-secondary" style={{ fontSize: 12, height: 30, padding: '0 10px' }}>Redistribuer</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <Link href="/transfers/broadcast" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          <Megaphone size={15} />Créer broadcast de don d&apos;urgence
        </Link>
      </div>
    </div>
  );
}
