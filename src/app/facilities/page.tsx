'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Map, Search, Building2 } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Facility {
  id: string;
  name: string;
  type: string;
  region: string | null;
  status: string;
}

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '25' });
    if (search) params.set('search', search);
    if (type) params.set('type', type);
    apiFetch<{ data: Facility[]; total: number }>(`/api/facilities?${params}`)
      .then((r) => { setFacilities(r.data); setTotal(r.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, type]);

  useEffect(() => { load(); }, [load]);

  const BADGE_MAP: Record<string, string> = {
    active: 'success', critical: 'critical', warning: 'warning', offline: 'info',
  };
  const STATUS_LABEL: Record<string, string> = {
    active: 'OK', critical: 'CRITIQUE', warning: 'AVERTISSEMENT', offline: 'HORS-LIGNE',
  };

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/dashboard" className={styles.backLink}>← Dashboard</Link>
          <h1 className={styles.title}>ÉTABLISSEMENTS</h1>
        </div>
        <div className={styles.headerActions}>
          <Link href="/facilities/map" className="btn-secondary">
            <Map size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Vue carte
          </Link>
          <Link href="/facilities/new" className="btn-primary">+ Ajouter</Link>
        </div>
      </header>

      <div className={styles.filtersBar}>
        <div className={styles.searchBox}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Rechercher établissement..."
            className={`input-field ${styles.searchInput}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          <select className={`input-field ${styles.select}`} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Type : Tous</option>
            <option value="Hôpital">Hôpital</option>
            <option value="Clinique">Clinique</option>
            <option value="Centre de Santé">Centre de Santé</option>
          </select>
          <select className={`input-field ${styles.select}`}><option>Région : Toutes</option></select>
          <select className={`input-field ${styles.select}`}><option>Statut : Tous</option></select>
        </div>
      </div>

      <div className={styles.resultsInfo}>
        {loading ? 'Chargement...' : `${total} établissement${total !== 1 ? 's' : ''}`}
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr><th>ÉTABLISSEMENT</th><th>TYPE</th><th>RÉGION</th><th>STATUT</th><th>ACTIONS</th></tr>
          </thead>
          <tbody>
            {!loading && facilities.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)' }}>
                  <Building2 size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.35 }} />
                  <p style={{ fontSize: 13 }}>Aucun établissement configuré</p>
                </td>
              </tr>
            ) : facilities.map((f) => (
              <tr key={f.id} className={styles.row}>
                <td className={styles.facilityName}>{f.name}</td>
                <td>{f.type}</td>
                <td>{f.region ?? '—'}</td>
                <td><span className={`badge ${BADGE_MAP[f.status] ?? 'info'}`}>{STATUS_LABEL[f.status] ?? f.status}</span></td>
                <td><Link href={`/facilities/${f.id}`} className={styles.actionLink}>Voir</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
