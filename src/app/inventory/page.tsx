'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Upload, Plus, Package, Building2 } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Resource {
  id: string;
  name: string;
  category: string;
  total_quantity: number;
  alert_threshold: number;
  zone: string | null;
  unit_of_measure: string;
  facility_id: string;
  facility_name?: string;
}

interface Facility { id: string; name: string; }

interface PageResult {
  data: Resource[];
  total: number;
  page: number;
  limit: number;
}

function getStatusLabel(r: Resource): { label: string; cls: string } {
  if (r.total_quantity <= r.alert_threshold) return { label: 'CRITIQUE', cls: 'critical' };
  if (r.total_quantity <= r.alert_threshold * 1.5) return { label: 'FAIBLE', cls: 'warning' };
  return { label: 'OK', cls: 'success' };
}

export default function InventoryPage() {
  const [result, setResult] = useState<PageResult | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [myFacilityId, setMyFacilityId] = useState<string | null>(null);
  const [myRole, setMyRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('');
  const [page, setPage] = useState(1);

  // Load user identity and facilities
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then(r => r.json())
      .then(u => {
        setMyRole(u.role ?? '');
        setMyFacilityId(u.facilityId ?? null);
        // Non-managers see only their own facility by default
        if (u.facilityId && u.role === 'facility_manager') setFacilityFilter('');
        else if (u.facilityId) setFacilityFilter(u.facilityId);
      });
    fetch('/api/facilities?limit=100', { credentials: 'same-origin' })
      .then(r => r.json())
      .then(res => setFacilities(res.data ?? []));
  }, []);

  const isManager = myRole === 'facility_manager' || myRole === 'super_admin' || myRole === 'ngo_coordinator';

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '25' });
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (status) params.set('status', status);
    if (facilityFilter) params.set('facilityId', facilityFilter);
    apiFetch<PageResult>(`/api/inventory?${params}`)
      .then(setResult)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, category, status, facilityFilter, page]);

  useEffect(() => { load(); }, [load]);

  const resources = result?.data ?? [];
  const total = result?.total ?? 0;

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/dashboard" className={styles.backLink}>← Dashboard</Link>
          <h1 className={styles.title}>INVENTAIRE</h1>
        </div>
        <div className={styles.headerActions}>
          <Link href="/inventory/import" className="btn-outline">
            <Upload size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />Import
          </Link>
          <Link href="/inventory/new" className="btn-primary">
            <Plus size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />Ajouter
          </Link>
        </div>
      </header>

      <div className={styles.filtersBar}>
        <div className={styles.searchBox}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Rechercher ressource..."
            className={`input-field ${styles.searchInput}`}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className={styles.filterGroup}>
          {isManager && facilities.length > 0 && (
            <select className={`input-field ${styles.select}`} value={facilityFilter} onChange={(e) => { setFacilityFilter(e.target.value); setPage(1); }}>
              <option value="">
                <Building2 size={13} />Tous les établissements
              </option>
              {facilities.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          )}
          <select className={`input-field ${styles.select}`} value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <option value="">Catégorie: Tous</option>
            <option value="vaccin">Vaccins</option>
            <option value="antipaludique">Antipaludiques</option>
            <option value="antibiotique">Antibiotiques</option>
            <option value="arv">ARV</option>
            <option value="injectable">Injectables</option>
            <option value="materiel">Matériel</option>
            <option value="diagnostic">Diagnostic</option>
          </select>
          <select className={`input-field ${styles.select}`} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">Statut: Tous</option>
            <option value="critical">Critique</option>
            <option value="ok">OK</option>
          </select>
        </div>
      </div>

      <div className={styles.resultsInfo}>
        {loading ? 'Chargement...' : `${total} ressource${total !== 1 ? 's' : ''}`}
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>NOM</th>
              {!facilityFilter && isManager && <th>ÉTABLISSEMENT</th>}
              <th>CATÉG.</th>
              <th>QTÉ</th>
              <th>SEUIL</th>
              <th>STATUT</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--brand-slate)', fontSize: 13 }}>Chargement...</td></tr>
            ) : resources.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)' }}>
                  <Package size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.35 }} />
                  <p style={{ fontSize: 13 }}>Aucune ressource.</p>
                </td>
              </tr>
            ) : resources.map((r) => {
              const st = getStatusLabel(r);
              return (
                <tr key={r.id} className={styles.row}>
                  <td><Link href={`/inventory/${r.id}`} className={styles.resourceName}>{r.name}</Link></td>
                  {!facilityFilter && isManager && (
                    <td style={{ fontSize: 12, color: 'var(--brand-slate)' }}>{r.facility_name ?? '—'}</td>
                  )}
                  <td>{r.category}</td>
                  <td><strong>{r.total_quantity}</strong> {r.unit_of_measure}</td>
                  <td>{r.alert_threshold}</td>
                  <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {total > 25 && (
        <div className={styles.pagination}>
          <div className={styles.pageButtons}>
            <button className={styles.pageBtn} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>&lt;</button>
            <button className={`${styles.pageBtn} ${styles.activePage}`}>{page}</button>
            <button className={styles.pageBtn} onClick={() => setPage((p) => p + 1)} disabled={page * 25 >= total}>&gt;</button>
          </div>
          <div className={styles.pageInfo}>25 par page · {total} total</div>
        </div>
      )}
    </div>
  );
}
