'use client';

import React, { useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';
import { Share2, History, Check } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Transfer {
  id: string; ref: string; quantity: number; status: string;
  priority: string; is_emergency: boolean; motif: string | null;
  requesting_facility_id: string; source_facility_id: string | null;
  driver_name: string | null; driver_phone: string | null;
  vehicle_ref: string | null; created_at: string; updated_at: string;
}

const STATUS_BADGE: Record<string, string> = {
  pending: 'warning', confirmed: 'info', in_transit: 'info',
  delivered: 'warning', completed: 'success', incident: 'critical',
};

export default function TransferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    const title = transfer ? `Transfert ${transfer.ref}` : 'Transfert VitalGrid';
    const text = transfer
      ? `Transfert ${transfer.ref} — ${transfer.quantity} unités — ${transfer.status.toUpperCase()}`
      : 'Transfert VitalGrid';

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // user cancelled — do nothing
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [transfer]);

  useEffect(() => {
    apiFetch<Transfer>(`/api/transfers/${id}`)
      .then(setTransfer)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/transfers" className={styles.backLink}>← Transferts</Link>
          <h1 className={styles.title}>{transfer ? `TRANSFERT ${transfer.ref}` : 'TRANSFERT'}</h1>
        </div>
        <button
          className="btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={handleShare}
        >
          {copied ? <Check size={14} /> : <Share2 size={14} />}
          {copied ? 'Lien copié !' : 'Partager'}
        </button>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--brand-slate)', fontSize: 13 }}>Chargement...</div>
      ) : !transfer ? (
        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--brand-slate)' }}>
          <History size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }} />
          <p style={{ fontSize: 13 }}>Transfert introuvable</p>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              {transfer.quantity} unités · Priorité: {transfer.priority}
              {transfer.is_emergency && <span className="badge critical" style={{ marginLeft: 8 }}>URGENCE</span>}
            </p>
            <span className={`badge ${STATUS_BADGE[transfer.status] ?? 'info'}`}>
              {transfer.status.toUpperCase()}
            </span>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 10, padding: 20, marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Détails logistiques</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', fontSize: 13 }}>
              <div><span style={{ color: 'var(--brand-slate)' }}>Motif</span><br /><strong>{transfer.motif ?? '—'}</strong></div>
              {transfer.driver_name && <div><span style={{ color: 'var(--brand-slate)' }}>Transporteur</span><br /><strong>{transfer.driver_name}</strong></div>}
              {transfer.driver_phone && <div><span style={{ color: 'var(--brand-slate)' }}>Téléphone</span><br /><a href={`tel:${transfer.driver_phone}`} style={{ color: 'var(--brand-sage)' }}>{transfer.driver_phone}</a></div>}
              {transfer.vehicle_ref && <div><span style={{ color: 'var(--brand-slate)' }}>Véhicule</span><br /><strong>{transfer.vehicle_ref}</strong></div>}
              <div><span style={{ color: 'var(--brand-slate)' }}>Créé le</span><br /><strong>{new Date(transfer.created_at).toLocaleString('fr-FR')}</strong></div>
            </div>
          </div>

          {transfer.status === 'delivered' && (
            <Link href={`/transfers/${id}/receive`} className="btn-primary" style={{ display: 'block', textAlign: 'center', padding: '14px' }}>
              CONFIRMER LA RÉCEPTION
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
