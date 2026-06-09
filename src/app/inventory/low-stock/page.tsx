'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Settings, AlertTriangle, Megaphone } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Resource {
  id: string; name: string; total_quantity: number; alert_threshold: number; category: string;
}

export default function LowStockPage() {
  const facilityId = process.env.NEXT_PUBLIC_FACILITY_ID ?? '';
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!facilityId || facilityId === '00000000-0000-0000-0000-000000000001') { setLoading(false); return; }
    apiFetch<Resource[]>(`/api/inventory/low-stock?facilityId=${facilityId}`)
      .then(setResources).catch(console.error).finally(() => setLoading(false));
  }, [facilityId]);

  const critical = resources.filter((r) => r.total_quantity <= r.alert_threshold);
  const low = resources.filter((r) => r.total_quantity > r.alert_threshold && r.total_quantity <= r.alert_threshold * 1.5);

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/inventory" className={styles.backLink}>← Inventaire</Link>
          <h1 className={styles.title}>ALERTES STOCK BAS</h1>
        </div>
        <Link href="/alerts/rules/new" className="btn-outline">
          <Settings size={14} style={{ marginRight: 4 }} />Configurer seuils
        </Link>
      </header>

      <p style={{ marginBottom: 20, color: 'var(--brand-slate)', fontSize: 14 }}>
        {loading ? 'Chargement...' : `${resources.length} ressource${resources.length !== 1 ? 's' : ''} en dessous du seuil`}
      </p>

      {!loading && critical.length === 0 && low.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--brand-slate)' }}>
          <AlertTriangle size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }} />
          <p style={{ fontSize: 13 }}>Aucune ressource sous le seuil</p>
        </div>
      )}

      {critical.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>CRITIQUES ({critical.length})</h2>
          <div className={styles.cardElevated}>
            {critical.map((r) => (
              <div key={r.id} className={styles.listItem}>
                <div className={styles.itemInfo}>
                  <span className={styles.statusDot} style={{ background: 'var(--status-error)' }} />
                  <div>
                    <p className={styles.itemName}>{r.name}</p>
                    <p className={styles.itemDesc}>{r.total_quantity} / seuil {r.alert_threshold}</p>
                  </div>
                </div>
                <Link href={`/transfers/new?resource=${r.id}`} className="btn-secondary" style={{ fontSize: 12, height: 32, padding: '0 12px' }}>
                  Demander
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {low.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>FAIBLES ({low.length})</h2>
          <div className={styles.cardElevated}>
            {low.map((r) => (
              <div key={r.id} className={styles.listItem}>
                <div className={styles.itemInfo}>
                  <span className={styles.statusDot} style={{ background: 'var(--status-warning)' }} />
                  <div>
                    <p className={styles.itemName}>{r.name}</p>
                    <p className={styles.itemDesc}>{r.total_quantity} / seuil {r.alert_threshold}</p>
                  </div>
                </div>
                <Link href={`/inventory/${r.id}`} className="btn-secondary" style={{ fontSize: 12, height: 32, padding: '0 12px' }}>
                  Voir
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      <div style={{ marginTop: 24 }}>
        <Link href="/transfers/broadcast" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          <Megaphone size={15} />Broadcast urgence régionale
        </Link>
      </div>
    </div>
  );
}
