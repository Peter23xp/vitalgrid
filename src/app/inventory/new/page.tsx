'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Camera, Pencil, AlertCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

export default function AddResourcePage() {
  const router = useRouter();
  const [name, setName]               = useState('');
  const [dci, setDci]                 = useState('');
  const [category, setCategory]       = useState('');
  const [zone, setZone]               = useState('');
  const [unit, setUnit]               = useState('');
  const [quantity, setQuantity]       = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate]   = useState('');
  const [supplier, setSupplier]       = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [threshold, setThreshold]     = useState('');
  const [location, setLocation]       = useState('');
  const [notes, setNotes]             = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !unit || !quantity || !batchNumber || !expiryDate) {
      setError('Veuillez remplir tous les champs obligatoires (*)');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // 1. Créer la ressource
      const resource = await apiFetch<{ id: string }>('/api/inventory', {
        method: 'POST',
        body: JSON.stringify({
          name,
          dci:            dci || null,
          category,
          zone:           zone || null,
          unit_of_measure: unit,
          alert_threshold: threshold ? Number(threshold) : 0,
          location:       location || null,
          notes:          notes || null,
          facility_id:    '',
        }),
      });

      // 2. Ajouter le lot (batch) avec la quantité
      await apiFetch(`/api/inventory/${resource.id}/batches`, {
        method: 'POST',
        body: JSON.stringify({
          batch_number:  batchNumber,
          quantity:      Number(quantity),
          expiry_date:   expiryDate,
          supplier:      supplier || null,
          order_number:  orderNumber || null,
        }),
      });

      router.push(`/inventory/${resource.id}`);
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
          <Link href="/inventory" className={styles.backLink}>← Inventaire</Link>
          <h1 className={styles.title}>AJOUTER UNE RESSOURCE</h1>
        </div>
      </header>

      <div className={styles.scanMethods}>
        <button type="button" className={styles.scanBtn}>
          <Camera size={16} /> Scanner code-barres
        </button>
        <span className={styles.orText}>── ou ──</span>
        <button type="button" className={`${styles.scanBtn} ${styles.activeBtn}`}>
          <Pencil size={16} /> Saisie manuelle
        </button>
      </div>

      <form className={styles.formCard} onSubmit={handleSubmit}>
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--status-error)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: 'var(--status-error)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div className={styles.formGrid}>
          <div className={styles.formGroupFull}>
            <label className={styles.label}>Nom / Dénomination *</label>
            <input type="text" className="input-field" placeholder="Ex: Poches de Sang — Groupe O Négatif" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className={styles.formGroupFull}>
            <label className={styles.label}>DCI (Dénomination Commune Internationale)</label>
            <input type="text" className="input-field" placeholder="Ex: Paracétamol" value={dci} onChange={(e) => setDci(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Catégorie *</label>
            <select className={`input-field ${styles.select}`} required value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Sélectionner...</option>
              <option value="sang">Sang</option>
              <option value="medicaments">Médicaments</option>
              <option value="vaccins">Vaccins</option>
              <option value="materiel">Matériel</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Zone de stockage</label>
            <select className={`input-field ${styles.select}`} value={zone} onChange={(e) => setZone(e.target.value)}>
              <option value="">Sélectionner...</option>
              <option value="pharmacie">Pharmacie Centrale</option>
              <option value="urgences">Urgences</option>
              <option value="banque">Banque de Sang</option>
              <option value="bloc">Bloc Opératoire</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Unité de mesure *</label>
            <select className={`input-field ${styles.select}`} required value={unit} onChange={(e) => setUnit(e.target.value)}>
              <option value="">Sélectionner...</option>
              <option value="Unité(s)">Unité(s)</option>
              <option value="Dose(s)">Dose(s)</option>
              <option value="Poche(s)">Poche(s)</option>
              <option value="Boîte(s)">Boîte(s)</option>
              <option value="Flacon(s)">Flacon(s)</option>
              <option value="Ampoule(s)">Ampoule(s)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Quantité ajoutée *</label>
            <input type="number" className="input-field" min="1" placeholder="0" required value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Numéro de lot *</label>
            <input type="text" className="input-field" placeholder="Ex: LOT-12345" required value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Date d&apos;expiration *</label>
            <input type="date" className="input-field" required value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Fournisseur</label>
            <input type="text" className="input-field" placeholder="Ex: Pharmacie centrale" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Numéro de commande</label>
            <input type="text" className="input-field" placeholder="Ex: CMD-99887" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Seuil d&apos;alerte</label>
            <input type="number" className="input-field" min="0" placeholder="Ex: 10" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Emplacement physique</label>
            <input type="text" className="input-field" placeholder="Ex: Étagère A2" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>

          <div className={styles.formGroupFull}>
            <label className={styles.label}>Notes / Observations (optionnel)</label>
            <textarea className={`input-field ${styles.textarea}`} rows={3} placeholder="Détails supplémentaires..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <div className={styles.formActions}>
          <Link href="/inventory" className="btn-outline" style={{ padding: '0.75rem 2rem' }}>ANNULER</Link>
          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '0.75rem 2rem' }}
            disabled={submitting}
          >
            {submitting ? 'Enregistrement...' : 'ENREGISTRER'}
          </button>
        </div>
      </form>
    </div>
  );
}
