'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, AlertCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

export default function FacilityNewPage() {
  const router = useRouter();
  const [name, setName]           = useState('');
  const [type, setType]           = useState('');
  const [countryCode, setCountry] = useState('');
  const [region, setRegion]       = useState('');
  const [address, setAddress]     = useState('');
  const [lat, setLat]             = useState('');
  const [lng, setLng]             = useState('');
  const [contactName, setContact] = useState('');
  const [phone, setPhone]         = useState('');
  const [email, setEmail]         = useState('');
  const [zones, setZones]         = useState('');
  const [beds, setBeds]           = useState('');
  const [notes, setNotes]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !type || !countryCode || !contactName || !phone) {
      setError('Veuillez remplir tous les champs obligatoires (*)');
      return;
    }
    setSubmitting(true);
    setError('');

    // Get org_id from session
    let orgId = '';
    try {
      const me = await apiFetch<{ orgId: string }>('/api/auth/me');
      orgId = me.orgId;
    } catch {
      setError('Session expirée — veuillez vous reconnecter');
      setSubmitting(false);
      return;
    }

    try {
      const facility = await apiFetch<{ id: string }>('/api/facilities', {
        method: 'POST',
        body: JSON.stringify({
          org_id:        orgId,
          name,
          type,
          country_code:  countryCode,
          region:        region || null,
          address:       address || null,
          lat:           lat ? Number(lat) : null,
          lng:           lng ? Number(lng) : null,
          contact_name:  contactName,
          contact_phone: phone,
          contact_email: email || null,
          storage_zones: zones ? zones.split(',').map((z) => z.trim()).filter(Boolean) : [],
          bed_capacity:  beds ? Number(beds) : null,
        }),
      });
      router.push(`/facilities/${facility.id}`);
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
          <Link href="/facilities" className={styles.backLink}>← Établissements</Link>
          <h1 className={styles.title}>AJOUTER UN ÉTABLISSEMENT</h1>
        </div>
      </header>

      <form className={styles.formCard} onSubmit={handleSubmit}>
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--status-error)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: 'var(--status-error)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div className={styles.formGrid}>
          <div className={styles.formGroupFull}>
            <label className={styles.label}>Nom établissement *</label>
            <input type="text" className="input-field" placeholder="Ex: Hôpital Général de Référence" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Type *</label>
            <select className={`input-field ${styles.select}`} required value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Sélectionner...</option>
              <option value="Hôpital">Hôpital</option>
              <option value="Clinique">Clinique</option>
              <option value="Centre de Santé">Centre de Santé</option>
              <option value="ONG">ONG</option>
              <option value="Dépôt">Dépôt</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Pays *</label>
            <input type="text" className="input-field" placeholder="Code ISO — ex: CD, RW, BI" required value={countryCode} onChange={(e) => setCountry(e.target.value.toUpperCase().slice(0, 2))} maxLength={2} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Région</label>
            <input type="text" className="input-field" placeholder="Ex: Nord-Kivu" value={region} onChange={(e) => setRegion(e.target.value)} />
          </div>

          <div className={styles.formGroupFull}>
            <label className={styles.label}>Adresse complète *</label>
            <textarea className={`input-field ${styles.textarea}`} rows={2} placeholder="Adresse complète de l'établissement" required value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Latitude</label>
            <input type="number" step="any" className="input-field" placeholder="-1.6792" value={lat} onChange={(e) => setLat(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Longitude</label>
            <input type="number" step="any" className="input-field" placeholder="29.2284" value={lng} onChange={(e) => setLng(e.target.value)} />
          </div>

          <div className={styles.formGroupFull}>
            <div className={styles.mapPicker}>
              <MapPin size={14} style={{ marginRight: 6 }} />
              Renseignez les coordonnées GPS ci-dessus
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Contact principal *</label>
            <input type="text" className="input-field" placeholder="Nom du responsable" required value={contactName} onChange={(e) => setContact(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Téléphone *</label>
            <input type="tel" className="input-field" placeholder="+243 81X XXX XXX" required value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Email contact</label>
            <input type="email" className="input-field" placeholder="contact@etablissement.cd" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Zones de stockage</label>
            <input type="text" className="input-field" placeholder="Pharmacie, Urgences, Banque de Sang..." value={zones} onChange={(e) => setZones(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Capacité lits</label>
            <input type="number" className="input-field" placeholder="Ex: 280" value={beds} onChange={(e) => setBeds(e.target.value)} />
          </div>

          <div className={styles.formGroupFull}>
            <label className={styles.label}>Notes (optionnel)</label>
            <textarea className={`input-field ${styles.textarea}`} rows={3} placeholder="Informations supplémentaires..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <div className={styles.formActions}>
          <Link href="/facilities" className="btn-outline" style={{ padding: '0.75rem 2rem' }}>ANNULER</Link>
          <button type="submit" className="btn-primary" style={{ padding: '0.75rem 2rem' }} disabled={submitting}>
            {submitting ? 'Enregistrement...' : 'ENREGISTRER'}
          </button>
        </div>
      </form>
    </div>
  );
}
