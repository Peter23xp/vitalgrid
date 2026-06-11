'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { Package, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Facility {
  id: string;
  name: string;
  type: string;
  region: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  status: string;
  bed_capacity: number | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  storage_zones: { id: string; name: string }[] | string;
}

export default function FacilityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading]   = useState(true);

  // GPS edit state
  const [editGps, setEditGps] = useState(false);
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');
  const [saving, setSaving]     = useState(false);
  const [gpsMsg, setGpsMsg]     = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    apiFetch<Facility>(`/api/facilities/${id}`)
      .then((f) => {
        setFacility(f);
        setLatInput(f.lat?.toString() ?? '');
        setLngInput(f.lng?.toString() ?? '');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function saveGps() {
    if (!facility) return;
    const lat = latInput ? parseFloat(latInput) : null;
    const lng = lngInput ? parseFloat(lngInput) : null;
    if ((latInput && isNaN(lat!)) || (lngInput && isNaN(lng!))) {
      setGpsMsg({ ok: false, text: 'Coordonnées invalides' });
      return;
    }
    setSaving(true);
    setGpsMsg(null);
    try {
      const updated = await apiFetch<Facility>(`/api/facilities/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ lat, lng }),
      });
      setFacility(updated);
      setEditGps(false);
      setGpsMsg({ ok: true, text: 'Coordonnées mises à jour — visible sur la carte' });
    } catch (e) {
      setGpsMsg({ ok: false, text: (e as Error).message });
    } finally {
      setSaving(false);
    }
  }

  const zones: { id: string; name: string }[] = (() => {
    if (!facility?.storage_zones) return [];
    if (typeof facility.storage_zones === 'string') {
      try { return JSON.parse(facility.storage_zones); } catch { return []; }
    }
    return facility.storage_zones as { id: string; name: string }[];
  })();

  const hasGps = facility?.lat != null && facility?.lng != null;

  if (loading) {
    return (
      <div className={`animate-fade-in ${styles.container}`}>
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--brand-slate)', fontSize: 14 }}>
          Chargement...
        </div>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className={`animate-fade-in ${styles.container}`}>
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--status-error)', fontSize: 14 }}>
          Établissement introuvable.
        </div>
      </div>
    );
  }

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/facilities" className={styles.backLink}>← Établissements</Link>
          <h1 className={styles.title}>{facility.name.toUpperCase()}</h1>
        </div>
        <div className={styles.headerActions}>
          <Link href="/facilities/new" className="btn-secondary">+ Ajouter</Link>
        </div>
      </header>

      <div className={styles.heroCard}>
        <div className={styles.heroMain}>
          <h2 className={styles.heroName}>{facility.name}</h2>
          <p className={styles.heroMeta}>{facility.type} · {facility.region ?? '—'}</p>
        </div>
        <div className={styles.heroStatus}>
          <span className={`badge ${facility.status === 'active' ? 'success' : 'warning'}`}>
            {facility.status === 'active' ? 'Actif' : facility.status}
          </span>
        </div>
      </div>

      <div className={styles.metricsRow}>
        <div className={styles.metricCard}>
          <h3 className={styles.metricLabel}>LITS</h3>
          <div className={styles.metricValue}>{facility.bed_capacity ?? '—'}</div>
          <p className={styles.metricDesc}>capacité</p>
        </div>
        <div className={styles.metricCard}>
          <h3 className={styles.metricLabel}>ZONES STOCK</h3>
          <div className={styles.metricValue}>{zones.length}</div>
          <p className={styles.metricDesc}>zones</p>
        </div>
        <div className={styles.metricCard}>
          <h3 className={styles.metricLabel}>GPS</h3>
          <div className={styles.metricValue} style={{ fontSize: 20, color: hasGps ? 'var(--status-success)' : 'var(--status-warning)' }}>
            {hasGps ? '✓' : '—'}
          </div>
          <p className={styles.metricDesc}>{hasGps ? 'visible sur carte' : 'non configuré'}</p>
        </div>
      </div>

      <div className={styles.infoGrid}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Informations</h3>
          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Adresse</span>
              <span className={styles.infoValue}>{facility.address ?? '—'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Contact</span>
              <span className={styles.infoValue}>{facility.contact_name ?? '—'} · {facility.contact_phone ?? '—'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>{facility.contact_email ?? '—'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Capacité lits</span>
              <span className={styles.infoValue}>{facility.bed_capacity ?? '—'}</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>
            Coordonnées GPS
            <span
              style={{ fontSize: 12, color: 'var(--brand-sage)', marginLeft: 12, cursor: 'pointer', fontWeight: 500 }}
              onClick={() => { setEditGps(!editGps); setGpsMsg(null); }}
            >
              {editGps ? 'Annuler' : 'Modifier'}
            </span>
          </h3>

          {gpsMsg && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13,
              background: gpsMsg.ok ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
              color: gpsMsg.ok ? 'var(--status-success)' : 'var(--status-error)',
              border: `1px solid ${gpsMsg.ok ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}>
              {gpsMsg.ok ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {gpsMsg.text}
            </div>
          )}

          <div className={styles.infoCard}>
            {!editGps ? (
              <>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Latitude</span>
                  <span className={`${styles.infoValue} mono`}>{facility.lat ?? <em style={{ color: 'var(--brand-slate)' }}>non défini</em>}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Longitude</span>
                  <span className={`${styles.infoValue} mono`}>{facility.lng ?? <em style={{ color: 'var(--brand-slate)' }}>non défini</em>}</span>
                </div>
                {!hasGps && (
                  <div style={{ padding: '10px 0 4px', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--status-warning)', fontSize: 12 }}>
                    <MapPin size={13} />
                    Cet établissement n&apos;apparaît pas sur la carte — ajoutez les coordonnées GPS.
                  </div>
                )}
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand-slate)', display: 'block', marginBottom: 4 }}>
                      LATITUDE
                    </label>
                    <input
                      type="number" step="any" className="input-field"
                      placeholder="-1.6792"
                      value={latInput}
                      onChange={(e) => setLatInput(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand-slate)', display: 'block', marginBottom: 4 }}>
                      LONGITUDE
                    </label>
                    <input
                      type="number" step="any" className="input-field"
                      placeholder="29.2284"
                      value={lngInput}
                      onChange={(e) => setLngInput(e.target.value)}
                    />
                  </div>
                </div>
                <p style={{ fontSize: 11, color: 'var(--brand-slate)' }}>
                  Utilisez Google Maps : clic droit sur le lieu → copier les coordonnées
                </p>
                <button
                  className="btn-primary"
                  style={{ alignSelf: 'flex-start', padding: '8px 20px', fontSize: 13 }}
                  disabled={saving}
                  onClick={saveGps}
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer les coordonnées'}
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      <section className={styles.section} style={{ marginTop: 8 }}>
        <h3 className={styles.sectionTitle}>Zones de stockage</h3>
        <div className={styles.zonesCard}>
          {zones.length === 0 ? (
            <span style={{ color: 'var(--brand-slate)', fontSize: 13 }}>Aucune zone configurée</span>
          ) : (
            <div className={styles.zonesWrap}>
              {zones.map((z) => (
                <span key={z.id} className="badge info">{z.name}</span>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Inventaire actuel</h3>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr><th>NOM</th><th>STATUT</th><th>QTÉ</th><th>ACTIONS</th></tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4}>
                  <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)' }}>
                    <Package size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }} />
                    <p style={{ fontSize: 13 }}>
                      <Link href="/inventory" style={{ color: 'var(--brand-sage)' }}>Voir l&apos;inventaire complet →</Link>
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className={styles.pageActions}>
        <Link href={`/facilities/${id}/staff`} className="btn-secondary">Gérer le personnel</Link>
        <Link href="/facilities/map" className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <MapPin size={14} /> Voir sur la carte
        </Link>
      </div>
    </div>
  );
}
