'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

export default function ReceivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [receivedQty, setReceivedQty] = useState(0);
  const [packagingOk, setPackagingOk] = useState(true);
  const [condition, setCondition] = useState('good');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!receivedQty) { setError('La quantité reçue est requise'); return; }
    setSubmitting(true);
    setError('');
    try {
      await apiFetch(`/api/transfers/${id}/receive`, {
        method: 'POST',
        body: JSON.stringify({ received_qty: receivedQty, packaging_ok: packagingOk, condition, notes }),
      });
      router.push('/transfers');
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <Link href={`/transfers/${id}`} className={styles.backLink}>← Transfert {id.slice(0, 8)}...</Link>
        <h1 className={styles.title}>CONFIRMER RÉCEPTION</h1>
      </header>

      {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--status-error)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: 'var(--status-error)', fontSize: 13 }}>{error}</div>}

      <div className={styles.formCard}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Quantité réellement reçue *</label>
            <input type="number" className="input-field" min={0} value={receivedQty || ''} onChange={(e) => setReceivedQty(Number(e.target.value))} required />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Conformité emballage *</label>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                <input type="radio" name="packaging" checked={packagingOk} onChange={() => setPackagingOk(true)} />Conforme
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                <input type="radio" name="packaging" checked={!packagingOk} onChange={() => setPackagingOk(false)} />Problème
              </label>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>État général *</label>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              {['good', 'acceptable', 'bad'].map((v) => (
                <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  <input type="radio" name="condition" checked={condition === v} onChange={() => setCondition(v)} />
                  {v === 'good' ? 'Bon' : v === 'acceptable' ? 'Acceptable' : 'Mauvais'}
                </label>
              ))}
            </div>
          </div>
          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <label className={styles.label}>Observations</label>
            <textarea className={`input-field ${styles.textarea}`} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observations éventuelles..." />
          </div>
        </div>

        <div className={styles.formActions}>
          <Link href={`/transfers/${id}`} className="btn-secondary" style={{ padding: '0 2rem' }}>ANNULER</Link>
          <button className="btn-primary" style={{ padding: '0 2rem' }} onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Confirmation...' : '✅ CONFIRMER RÉCEPTION'}
          </button>
        </div>
      </div>
    </div>
  );
}
