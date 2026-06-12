'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Save, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Org {
  id: string; name: string; type: string; country_code: string;
}

export default function AdminOrganizationPage() {
  const [orgId, setOrgId]     = useState('');
  const [name, setName]       = useState('');
  const [type, setType]       = useState('ong');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((u) => {
        if (u.orgId) {
          setOrgId(u.orgId);
          return apiFetch<Org>(`/api/organizations/${u.orgId}`);
        }
      })
      .then((res) => {
        if (res) {
          setName(res.name ?? '');
          setType(res.type ?? 'ong');
          setCountry(res.country_code ?? '');
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!orgId) return;
    setSaving(true); setError(''); setSaved(false);
    try {
      await apiFetch(`/api/organizations/${orgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, country_code: country }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/dashboard/admin" className={styles.backLink}>← Admin</Link>
          <h1 className={styles.title}>PARAMÈTRES DE L&apos;ORGANISATION</h1>
        </div>
      </header>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--brand-slate)', fontSize: 14 }}>Chargement...</div>
      ) : (
        <>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Informations générales</h2>
            <div className={styles.formCard}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nom</label>
                  <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom de l'organisation" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Type</label>
                  <select className={`input-field ${styles.select}`} value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="ong">ONG Humanitaire</option>
                    <option value="gouvernement">Gouvernement</option>
                    <option value="hopital">Hôpital</option>
                    <option value="clinique">Clinique</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Code pays</label>
                  <input type="text" className="input-field" value={country} onChange={(e) => setCountry(e.target.value.toUpperCase())} placeholder="CD" maxLength={2} />
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Paramètres régionaux</h2>
            <div className={styles.formCard}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Devise</label>
                  <select className={`input-field ${styles.select}`}>
                    <option>USD - Dollar américain</option>
                    <option>EUR - Euro</option>
                    <option>CDF - Franc congolais</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Langue interface</label>
                  <select className={`input-field ${styles.select}`}>
                    <option>Français</option>
                    <option>English</option>
                    <option>Swahili</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Paramètres de sécurité</h2>
            <div className={styles.formCard}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Complexité MDP</label>
                  <select className={`input-field ${styles.select}`}>
                    <option>Élevée</option><option>Moyenne</option><option>Basique</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Expiration MDP</label>
                  <select className={`input-field ${styles.select}`}>
                    <option>90 jours</option><option>60 jours</option><option>30 jours</option><option>Jamais</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Durée de session</label>
                  <select className={`input-field ${styles.select}`}>
                    <option>8 heures</option><option>4 heures</option><option>24 heures</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--status-error)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: 'var(--status-error)' }}>
              {error}
            </div>
          )}

          <div className={styles.formActions}>
            <button className="btn-primary" onClick={save} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {saved ? <><CheckCircle2 size={15} /> SAUVEGARDÉ</> : <><Save size={15} /> {saving ? 'ENREGISTREMENT…' : 'ENREGISTRER LES MODIFICATIONS'}</>}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
