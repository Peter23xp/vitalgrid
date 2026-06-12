'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Package, X, MapPin, AlertCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Resource {
  id: string;
  name: string;
  category: string;
  unit_of_measure: string;
  total_quantity: number;
  alert_threshold: number;
}

interface Facility {
  id: string;
  name: string;
  region: string | null;
  type: string;
}

function NewTransferForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [resourceSearch, setResourceSearch] = useState('');
  const [resourceResults, setResourceResults] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [quantity, setQuantity] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState('');
  const [transportNotes, setTransportNotes] = useState('');
  const [coldChain, setColdChain] = useState(false);
  const [securedTransport, setSecuredTransport] = useState(false);
  const [fragile, setFragile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  // Charger les établissements régionaux (toutes orgs du même pays)
  useEffect(() => {
    fetch('/api/facilities/regional?limit=200', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((res) => setFacilities(res.data ?? []))
      .catch(console.error);
  }, []);

  // Pré-remplir depuis les query params (?resource=id&sourceFacilityId=id)
  useEffect(() => {
    const resourceId = searchParams.get('resource');
    if (resourceId) {
      apiFetch<Resource>(`/api/inventory/${resourceId}`)
        .then(setSelectedResource)
        .catch(console.error);
    }
    const sourceFacilityId = searchParams.get('sourceFacilityId');
    if (sourceFacilityId) setSelectedFacility(sourceFacilityId);
  }, [searchParams]);

  // Recherche de ressources
  const searchResources = useCallback(() => {
    if (resourceSearch.length < 2) { setResourceResults([]); return; }
    apiFetch<{ data: Resource[] }>(`/api/inventory?search=${encodeURIComponent(resourceSearch)}&limit=8`)
      .then((r) => setResourceResults(r.data))
      .catch(console.error);
  }, [resourceSearch]);

  useEffect(() => {
    const timer = setTimeout(searchResources, 300);
    return () => clearTimeout(timer);
  }, [searchResources]);

  const handleSubmit = async () => {
    if (!selectedResource || !quantity || !selectedFacility) {
      setError('Ressource, quantité et établissement source sont requis');
      return;
    }
    setSubmitting(true);
    setError('');

    const notes = [
      coldChain ? 'Chaîne du froid (2-8°C)' : '',
      securedTransport ? 'Transport sécurisé' : '',
      fragile ? 'Matériel fragile' : '',
      transportNotes,
    ].filter(Boolean).join(' · ');

    try {
      const transfer = await apiFetch<{ id: string; ref: string }>('/api/transfers', {
        method: 'POST',
        body: JSON.stringify({
          resource_id:             selectedResource.id,
          quantity:                Number(quantity),
          requesting_facility_id:  selectedFacility,
          source_facility_id:      selectedFacility,
          priority:                urgency.toUpperCase(),
          is_emergency:            urgency === 'critique',
          transport_notes:         notes || null,
        }),
      });
      router.push(`/transfers/${transfer.id}`);
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
          <Link href="/transfers" className={styles.backLink}>← Transferts</Link>
          <h1 className={styles.title}>NOUVELLE DEMANDE DE TRANSFERT</h1>
        </div>
      </header>

      <form className={styles.formCard} onSubmit={(e) => e.preventDefault()}>
        <div className={styles.stepper}>
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={styles.step}>
                <div className={`${styles.stepIndicator} ${step >= s ? styles.stepActive : ''}`}>{s}</div>
                <span className={styles.stepLabel}>
                  {s === 1 ? 'Ressource' : s === 2 ? 'Établissement' : 'Logistique'}
                </span>
              </div>
              {s < 3 && <div className={styles.stepDivider} />}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--status-error)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: 'var(--status-error)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div className={styles.formGrid}>

          {/* ── Étape 1 : Ressource ── */}
          <div className={styles.formGroupFull}>
            <label className={styles.label}>Ressource *</label>
            {!selectedResource ? (
              <div className={styles.searchWrapper}>
                <Search size={14} className={styles.searchIcon} />
                <input
                  type="text"
                  className={`input-field ${styles.searchInput}`}
                  placeholder="Rechercher par nom ou DCI..."
                  value={resourceSearch}
                  onChange={(e) => setResourceSearch(e.target.value)}
                />
                {resourceResults.length > 0 && (
                  <div className={styles.searchDropdown}>
                    {resourceResults.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        className={styles.searchResult}
                        onClick={() => { setSelectedResource(r); setResourceResults([]); setResourceSearch(''); setStep(2); }}
                      >
                        <Package size={14} style={{ flexShrink: 0 }} />
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</p>
                          <p style={{ fontSize: 12, color: 'var(--brand-slate)' }}>{r.category} · {r.total_quantity} {r.unit_of_measure} en stock</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.selectedResourceCard}>
                <div className={styles.resourceHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Package size={16} style={{ color: 'var(--brand-sage)' }} />
                    <span className={styles.resourceName}>{selectedResource.name}</span>
                  </div>
                  <button type="button" className={styles.clearBtn} onClick={() => { setSelectedResource(null); setStep(1); }}>
                    <X size={14} />
                  </button>
                </div>
                <p className={styles.resourceMeta}>
                  {selectedResource.category} · {selectedResource.unit_of_measure} · {selectedResource.total_quantity} en stock
                </p>
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Quantité demandée *</label>
            <input
              type="number"
              className="input-field"
              min="1"
              placeholder="Ex: 10"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Niveau d&apos;urgence *</label>
            <select className={`input-field ${styles.select}`} required defaultValue="normal" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
              <option value="critique">Critique (Livraison &lt; 4h)</option>
              <option value="eleve">Élevé (Livraison &lt; 24h)</option>
              <option value="normal">Normal (24-72h)</option>
            </select>
          </div>

          <div className={styles.divider} />

          {/* ── Étape 2 : Établissement source ── */}
          <div className={styles.formGroupFull}>
            <label className={styles.label}>Établissement source *</label>
            {facilities.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--brand-slate)', padding: '12px 0' }}>Chargement des établissements...</p>
            ) : (
              <div className={styles.facilitiesList}>
                {facilities.map((f) => (
                  <label key={f.id} className={styles.facilityOption}>
                    <input
                      type="radio"
                      name="source_facility"
                      value={f.id}
                      checked={selectedFacility === f.id}
                      onChange={() => { setSelectedFacility(f.id); setStep(3); }}
                    />
                    <div className={styles.facilityContent}>
                      <div className={styles.facilityHeader}>
                        <span className={styles.facilityName}>{f.name}</span>
                        <span style={{ fontSize: 12, color: 'var(--brand-slate)' }}>{f.type}</span>
                      </div>
                      {f.region && (
                        <div className={styles.facilityDetails}>
                          <MapPin size={12} />
                          <span>{f.region}</span>
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className={styles.divider} />

          {/* ── Étape 3 : Logistique ── */}
          <div className={styles.formGroupFull}>
            <label className={styles.label}>Conditions de transport</label>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkbox}>
                <input type="checkbox" checked={coldChain} onChange={(e) => setColdChain(e.target.checked)} />
                Chaîne du froid (2-8°C)
              </label>
              <label className={styles.checkbox}>
                <input type="checkbox" checked={securedTransport} onChange={(e) => setSecuredTransport(e.target.checked)} />
                Transport sécurisé / escorté
              </label>
              <label className={styles.checkbox}>
                <input type="checkbox" checked={fragile} onChange={(e) => setFragile(e.target.checked)} />
                Matériel fragile
              </label>
            </div>
          </div>

          <div className={styles.formGroupFull}>
            <label className={styles.label}>Motif de la demande (optionnel)</label>
            <textarea
              className={`input-field ${styles.textarea}`}
              rows={3}
              placeholder="Contexte de la demande..."
              value={transportNotes}
              onChange={(e) => setTransportNotes(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <Link href="/transfers" className="btn-outline" style={{ padding: '0 2rem' }}>ANNULER</Link>
          <button
            type="button"
            className="btn-primary"
            style={{ padding: '0 2rem' }}
            onClick={handleSubmit}
            disabled={submitting || !selectedResource || !quantity || !selectedFacility}
          >
            {submitting ? 'Envoi...' : 'SOUMETTRE LA DEMANDE'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewTransferPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: 'var(--brand-slate)', fontSize: 14 }}>Chargement...</div>}>
      <NewTransferForm />
    </Suspense>
  );
}
