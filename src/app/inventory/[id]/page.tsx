'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Pencil, ArrowLeftRight, FileDown, AlertCircle, Layers, MapPin, History } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Resource {
  id: string; name: string; category: string; zone: string | null;
  total_quantity: number; alert_threshold: number; unit_of_measure: string;
  facility_id: string; notes: string | null;
}
interface Batch { id: string; batch_number: string; quantity: number; expiry_date: string; }
interface Movement { id: string; delta: number; reason: string; location: string | null; created_at: string; }

export default function ResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [resource, setResource] = useState<Resource | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<Resource>(`/api/inventory/${id}`),
      apiFetch<Batch[]>(`/api/inventory/${id}/batches`),
      apiFetch<Movement[]>(`/api/inventory/${id}/movements`),
    ]).then(([r, b, m]) => { setResource(r); setBatches(b); setMovements(m); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const isCritical = resource && resource.total_quantity <= resource.alert_threshold;

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/inventory" className={styles.backLink}>← Inventaire</Link>
          <h1 className={styles.title}>DÉTAIL RESSOURCE</h1>
        </div>
        <div className={styles.headerActions}>
          <Link href={`/inventory/new?edit=${id}`} className="btn-outline">
            <Pencil size={14} style={{ marginRight: 4 }} />Modifier
          </Link>
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--brand-slate)', fontSize: 13 }}>Chargement...</div>
      ) : !resource ? (
        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--brand-slate)' }}>
          <AlertCircle size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }} />
          <p style={{ fontSize: 13 }}>Ressource introuvable</p>
        </div>
      ) : (
        <>
          <section className={styles.resourceIdentity}>
            <h2 className={styles.resourceName}>{resource.name}</h2>
            <p className={styles.resourceMeta}>ID: {resource.id} · Catégorie: {resource.category} · Zone: {resource.zone ?? '—'}</p>
          </section>

          <div className={styles.mainGrid}>
            <div className={styles.column}>
              <div className={`${styles.statusCard} ${isCritical ? styles.cardCritical : ''}`}>
                <h3 className={styles.statusHeader}>
                  <AlertCircle size={16} style={{ marginRight: 6 }} />
                  {isCritical ? 'STOCK CRITIQUE' : 'STOCK'}
                </h3>
                <div className={styles.statusDetails}>
                  <div className={styles.detailRow}><span className={styles.detailLabel}>Quantité actuelle</span><span className={styles.detailValue}>{resource.total_quantity} {resource.unit_of_measure}</span></div>
                  <div className={styles.detailRow}><span className={styles.detailLabel}>Seuil d&apos;alerte</span><span className={styles.detailValue}>{resource.alert_threshold}</span></div>
                </div>
              </div>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Lots en stock</h3>
                {batches.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--brand-slate)' }}>
                    <Layers size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.35 }} />
                    <p style={{ fontSize: 13 }}>Aucun lot</p>
                  </div>
                ) : (
                  <div className={styles.list}>
                    {batches.map((b) => (
                      <div key={b.id} className={styles.listItem}>
                        <span className={styles.lotName}>{b.batch_number}</span>
                        <span className={styles.lotQty}>Qté: {b.quantity}</span>
                        <span className={styles.lotExpiry}>Expire: {b.expiry_date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Disponibilité à proximité</h3>
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--brand-slate)' }}>
                  <MapPin size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.35 }} />
                  <p style={{ fontSize: 13 }}>Disponible après connexion DB</p>
                </div>
              </section>
            </div>

            <div className={styles.column}>
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Historique (30 jours)</h3>
                {movements.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--brand-slate)' }}>
                    <History size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.35 }} />
                    <p style={{ fontSize: 13 }}>Aucun mouvement</p>
                  </div>
                ) : (
                  <table className={styles.historyTable}>
                    <tbody>
                      {movements.map((m) => (
                        <tr key={m.id}>
                          <td className={styles.dateCell}>{new Date(m.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</td>
                          <td className={m.delta > 0 ? styles.deltaPositive : styles.deltaNegative}>{m.delta > 0 ? `+${m.delta}` : m.delta}</td>
                          <td>{m.reason}</td>
                          <td className={styles.metaCell}>{m.location ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>

              <div className={styles.actionGroup}>
                <Link href={`/transfers/new?resource=${id}`} className="btn-primary" style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <ArrowLeftRight size={15} />Demander un transfert
                </Link>
                <button className="btn-outline" style={{ width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <FileDown size={15} />Exporter historique
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
