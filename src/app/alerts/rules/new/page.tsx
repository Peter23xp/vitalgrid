'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

export default function NewAlertRulePage() {
  const router = useRouter();
  const [resource, setResource]   = useState('');
  const [ruleType, setRuleType]   = useState('');
  const [threshold, setThreshold] = useState('');
  const [severity, setSeverity]   = useState('critical');
  const [push, setPush]           = useState(true);
  const [emailCh, setEmailCh]     = useState(true);
  const [sms, setSms]             = useState(false);
  const [webhook, setWebhook]     = useState(false);
  const [repeat, setRepeat]       = useState('once');
  const [active, setActive]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleType || !threshold) {
      setError('Type de règle et seuil sont requis');
      return;
    }
    setSubmitting(true);
    setError('');

    const channels: string[] = [];
    if (push)    channels.push('push');
    if (emailCh) channels.push('email');
    if (sms)     channels.push('sms');
    if (webhook) channels.push('webhook');

    try {
      const me = await apiFetch<{ facilityId: string | null }>('/api/auth/me');
      await apiFetch('/api/alerts/rules', {
        method: 'POST',
        body: JSON.stringify({
          facility_id:     me.facilityId,
          rule_type:       ruleType,
          threshold:       Number(threshold),
          severity,
          channels,
          repeat_interval: repeat,
          is_active:       active,
        }),
      });
      router.push('/alerts');
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/alerts" className={styles.backLink}>← Alertes</Link>
          <h1 className={styles.title}>CRÉER UNE RÈGLE D&apos;ALERTE</h1>
        </div>
      </header>

      <form className={styles.formCard} onSubmit={handleSubmit}>
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--status-error)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: 'var(--status-error)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="resource">Ressource cible</label>
          <input id="resource" type="text" className="input-field" placeholder="Rechercher ressource ou catégorie..." value={resource} onChange={(e) => setResource(e.target.value)} />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="ruleType">Type de règle *</label>
          <select id="ruleType" className={`input-field ${styles.select}`} required value={ruleType} onChange={(e) => setRuleType(e.target.value)}>
            <option value="">Sélectionner...</option>
            <option value="low_stock">Stock bas</option>
            <option value="expiry">Expiration proche</option>
            <option value="temperature">Température</option>
            <option value="sync_inactive">Inactivité sync</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="threshold">Seuil numérique *</label>
          <input id="threshold" type="number" className="input-field" placeholder="Ex: 10" required value={threshold} onChange={(e) => setThreshold(e.target.value)} />
          <p className={styles.helperText}>Quantité, jours, ou °C selon le type de règle</p>
        </div>

        <div className={styles.formGroup}>
          <label>Sévérité *</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input type="radio" name="severity" value="warning" checked={severity === 'warning'} onChange={() => setSeverity('warning')} className={styles.radioInput} />
              <span className={styles.radioText}>Avertissement</span>
            </label>
            <label className={styles.radioLabel}>
              <input type="radio" name="severity" value="critical" checked={severity === 'critical'} onChange={() => setSeverity('critical')} className={styles.radioInput} />
              <span className={styles.radioText}>Critique</span>
            </label>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Canaux de notification</label>
          <div className={styles.checkboxRow}>
            <label className={styles.checkboxLabel}><input type="checkbox" checked={push}    onChange={(e) => setPush(e.target.checked)}    className={styles.checkboxInput} /><span>App push</span></label>
            <label className={styles.checkboxLabel}><input type="checkbox" checked={emailCh} onChange={(e) => setEmailCh(e.target.checked)} className={styles.checkboxInput} /><span>Email</span></label>
            <label className={styles.checkboxLabel}><input type="checkbox" checked={sms}     onChange={(e) => setSms(e.target.checked)}     className={styles.checkboxInput} /><span>SMS</span></label>
            <label className={styles.checkboxLabel}><input type="checkbox" checked={webhook} onChange={(e) => setWebhook(e.target.checked)} className={styles.checkboxInput} /><span>Webhook</span></label>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="repeat">Répétition</label>
          <select id="repeat" className={`input-field ${styles.select}`} value={repeat} onChange={(e) => setRepeat(e.target.value)}>
            <option value="once">Une fois</option>
            <option value="hourly">Chaque heure</option>
            <option value="daily">Quotidien</option>
          </select>
        </div>

        <div className={styles.toggleRow}>
          <span className={styles.toggleRowLabel}>Activer immédiatement</span>
          <input type="checkbox" id="activateNow" className={styles.toggle} checked={active} onChange={(e) => setActive(e.target.checked)} />
          <label htmlFor="activateNow" className={styles.toggleLabel}></label>
        </div>

        <div className={styles.formActions}>
          <Link href="/alerts" className="btn-outline">ANNULER</Link>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Création...' : 'CRÉER LA RÈGLE'}
          </button>
        </div>
      </form>
    </div>
  );
}
