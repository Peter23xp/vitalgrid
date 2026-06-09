'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Upload, Plus, Package } from 'lucide-react';
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
}

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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '25' });
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (status) params.set('status', status);
    apiFetch<PageResult>(`/api/inventory?${params}`)
      .then(setResult)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, category, status, page]);

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
          <select className={`input-field ${styles.select}`} value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <option value="">Catégorie: Tous</option>
            <option value="sang">Sang</option>
            <option value="medicaments">Médicaments</option>
            <option value="vaccins">Vaccins</option>
            <option value="materiel">Matériel</option>
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
            <tr><th>NOM</th><th>CATÉG.</th><th>QTÉ</th><th>SEUIL</th><th>STATUT</th></tr>
          </thead>
          <tbody>
            {!loading && resources.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)' }}>
                  <Package size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.35 }} />
                  <p style={{ fontSize: 13 }}>Aucune ressource. Commencez par ajouter des articles.</p>
                </td>
              </tr>
            ) : resources.map((r) => {
              const st = getStatusLabel(r);
              return (
                <tr key={r.id} className={styles.row}>
                  <td><Link href={`/inventory/${r.id}`} className={styles.resourceName}>{r.name}</Link></td>
                  <td>{r.category}</td>
                  <td>{r.total_quantity}</td>
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
