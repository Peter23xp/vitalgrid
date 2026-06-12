'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Megaphone } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Facility {
  id: string;
  name: string;
  region: string | null;
  org_name: string;
}

export default function BroadcastPage() {
  const router = useRouter();

  const [resourceType, setResourceType] = useState('');
  const [facilityId, setFacilityId]     = useState('');
  const [minQty, setMinQty]             = useState('');
  const [region, setRegion]             = useState('');
  const [delay, setDelay]               = useState('');
  const [message, setMessage]           = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState('');
  const [facilities, setFacilities]     = useState<Facility[]>([]);

  useEffect(() => {
    fetch('/api/facilities/regional?limit=200', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((res) => setFacilities(res.data ?? []))
      .catch(console.error);
  }, []);

  const regions = Array.from(
    new Set(facilities.map((f) => f.region).filter(Boolean) as string[])
  ).sort();

  const targetCount = region
    ? facilities.filter((f) => f.region === region).length
    : facilities.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await apiFetch('/api/broadcasts', {
        method: 'POST',
        body: JSON.stringify({
          resourceType,
          facilityId,
          minQty: Number(minQty),
          region,
          delay,
          message,
        }),
      });
      router.push('/transfers');
    } catch (e: unknown) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/dashboard" className={styles.backLink}>← Dashboard</Link>
          <h1 className={styles.title}>BROADCAST D&apos;URGENCE RÉGIONALE</h1>
        </div>
      </header>

      <div className={styles.warningBanner}>
        <AlertTriangle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
        Cet appel sera envoyé à TOUS les établissements de la région sélectionnée
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--status-error)', borderRadius: 8, padding: '10px 14px', marginBottom: 12, color: 'var(--status-error)', fontSize: 13 }}>
          {error}
        </div>
      )}

      <form className={styles.formCard} onSubmit={handleSubmit}>
        <div className={styles.formGrid}>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="resource">Ressource en pénurie *</label>
            <select
              id="resource"
              className={`input-field ${styles.select}`}
              required
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
            >
              <option value="">Sélectionner...</option>
              <option value="sang-o-">Sang O-</option>
              <option value="quinine">Quinine inj.</option>
              <option value="vaccins-vpo">Vaccins VPO</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="facility">Établissement demandeur *</label>
            <select
              id="facility"
              className={`input-field ${styles.select}`}
              required
              value={facilityId}
              onChange={(e) => setFacilityId(e.target.value)}
            >
              <option value="">Sélectionner un établissement...</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>{f.name}{f.org_name ? ` — ${f.org_name}` : ''}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="qty">Quantité minimale *</label>
            <input
              id="qty"
              type="number"
              className="input-field"
              min="1"
              placeholder="Ex: 10"
              required
              value={minQty}
              onChange={(e) => setMinQty(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="region">Région de diffusion *</label>
            <select
              id="region"
              className={`input-field ${styles.select}`}
              required
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="">Sélectionner une région...</option>
              <option value="__all__">Tout le pays</option>
              {regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="delay">Délai de réponse souhaité *</label>
            <select
              id="delay"
              className={`input-field ${styles.select}`}
              required
              value={delay}
              onChange={(e) => setDelay(e.target.value)}
            >
              <option value="">Sélectionner...</option>
              <option value="1h">1 heure</option>
              <option value="2h">2 heures</option>
              <option value="4h">4 heures</option>
              <option value="24h">24 heures</option>
            </select>
          </div>

          <div className={styles.formGroupFull}>
            <label className={styles.label} htmlFor="message">Message d&apos;urgence</label>
            <textarea
              id="message"
              className={`input-field ${styles.textarea}`}
              rows={4}
              placeholder="Décrivez la situation d'urgence..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>

          <div className={styles.formGroupFull}>
            <div className={styles.infoRow}>
              <span className={styles.infoIcon}>ℹ</span>
              <span>Établissements qui recevront le broadcast&nbsp;: <strong>{targetCount}</strong></span>
            </div>
          </div>

          <div className={styles.formGroupFull}>
            <label className={styles.label}>Canaux de diffusion</label>
            <div className={styles.channelRow}>
              <label className={styles.channelOption}>
                <input type="checkbox" defaultChecked />
                <span>App Push</span>
              </label>
              <label className={styles.channelOption}>
                <input type="checkbox" defaultChecked />
                <span>Email</span>
              </label>
              <label className={styles.channelOption}>
                <input type="checkbox" />
                <span>SMS (si configuré)</span>
              </label>
            </div>
          </div>

        </div>

        <div className={styles.formActions}>
          <Link href="/dashboard" className="btn-secondary" style={{padding: '0 2rem'}}>ANNULER</Link>
          <button
            type="submit"
            className={`btn-primary ${styles.btnBroadcast}`}
            disabled={submitting}
          >
            <Megaphone size={15} style={{ marginRight: 6 }} /> {submitting ? 'Envoi...' : 'ENVOYER LE BROADCAST'}
          </button>
        </div>
      </form>
    </div>
  );
}
