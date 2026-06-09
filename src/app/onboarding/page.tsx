'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Upload, AlertCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

export default function OnboardingPage() {
  const router = useRouter();
  const [orgName, setOrgName]   = useState('');
  const [orgType, setOrgType]   = useState('');
  const [country, setCountry]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !orgType || !country) {
      setError('Nom, type et pays sont requis');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await apiFetch('/api/organizations', {
        method: 'POST',
        body: JSON.stringify({
          name:         orgName,
          type:         orgType,
          country_code: country,
        }),
      });
      router.push('/dashboard');
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Bienvenue sur VitalGrid</h1>
          <p className={styles.subtitle}>Configurez votre organisation en 3 étapes (5 min)</p>
        </div>

        <div className={styles.stepperNav}>
          <div className={styles.stepperLine}></div>
          <div className={`${styles.stepDot} ${styles.stepDotActive}`}>
            <span>●</span>
            <span className={styles.stepLabel}>Organisation</span>
          </div>
          <div className={styles.stepDot}>
            <span>○</span>
            <span className={styles.stepLabel}>Établissements</span>
          </div>
          <div className={styles.stepDot}>
            <span>○</span>
            <span className={styles.stepLabel}>Ressources</span>
          </div>
        </div>

        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>ÉTAPE 1 / 3 — Votre organisation</h2>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--status-error)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: 'var(--status-error)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>Nom de l&apos;organisation *</label>
              <input type="text" className="input-field" placeholder="Ex: Organisation humanitaire" required value={orgName} onChange={(e) => setOrgName(e.target.value)} />
            </div>

            <div className={styles.formGroup}>
              <label>Type d&apos;organisation *</label>
              <select className={`input-field ${styles.select}`} required value={orgType} onChange={(e) => setOrgType(e.target.value)}>
                <option value="">Sélectionner...</option>
                <option value="ong">ONG Humanitaire</option>
                <option value="hopital">Hôpital-réseau</option>
                <option value="distributeur">Distributeur</option>
                <option value="gouvernement">Gouvernement</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Pays principal *</label>
              <input type="text" className="input-field" placeholder="Code ISO — ex: CD, RW, BI" required maxLength={2} value={country} onChange={(e) => setCountry(e.target.value.toUpperCase().slice(0, 2))} />
            </div>

            <div className={styles.formGroup}>
              <label>Logo (optionnel)</label>
              <div className={styles.uploadBox}>
                <Upload size={24} className={styles.uploadIcon} />
                <span>Télécharger logo</span>
                <span className={styles.uploadMeta}>max 2MB PNG/SVG</span>
              </div>
            </div>

            <div className={styles.footer}>
              <Link href="/dashboard/admin" className={styles.skipLink}>PASSER</Link>
              <button type="submit" className={`btn-primary ${styles.continueBtn}`} disabled={submitting}>
                {submitting ? 'Création...' : 'CONTINUER →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
