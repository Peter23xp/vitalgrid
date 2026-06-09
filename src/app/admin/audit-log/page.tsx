'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ScrollText } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface AuditEntry {
  id: string;
  user_label: string | null;
  action: string;
  detail: string | null;
  result: string;
  created_at: string;
}

export default function AdminAuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch<{ data: AuditEntry[]; total: number }>('/api/admin/audit-log?limit=50')
      .then((r) => { setEntries(r.data); setTotal(r.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/dashboard/admin" className={styles.backLink}>← Admin</Link>
          <h1 className={styles.title}>JOURNAL D&apos;AUDIT</h1>
        </div>
        <button className="btn-secondary">Exporter</button>
      </header>

      <div className={styles.infoBanner}>
        Journal immuable — Aurora DSQL append-only. Aucune entrée ne peut être modifiée ou supprimée.
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr><th>HORODATAGE</th><th>UTILISATEUR</th><th>ACTION</th><th>DÉTAIL</th><th>RÉSULTAT</th></tr>
          </thead>
          <tbody>
            {!loading && entries.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--brand-slate)' }}>
                  <ScrollText size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.35 }} />
                  <p style={{ fontSize: 13 }}>Aucun log disponible</p>
                </td>
              </tr>
            ) : entries.map((e) => (
              <tr key={e.id} className={styles.row}>
                <td className="mono" style={{ fontSize: 12 }}>{new Date(e.created_at).toLocaleString('fr-FR')}</td>
                <td>{e.user_label ?? '[système]'}</td>
                <td>{e.action}</td>
                <td style={{ fontSize: 12, color: 'var(--brand-slate)' }}>{e.detail ?? '—'}</td>
                <td><span className={`badge ${e.result === 'success' ? 'success' : 'critical'}`}>{e.result === 'success' ? '✓ Succès' : '✗ Refusé'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {total > 0 && <p style={{ fontSize: 12, color: 'var(--brand-slate)', padding: '12px 0' }}>{total} entrées au total</p>}
    </div>
  );
}
