'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Plus, Search } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface OrgRow {
  id: string; name: string; type: string; country_code: string;
  facilitiesCount: number; usersCount: number;
  created_at: string;
}

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs]       = useState<OrgRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    apiFetch<OrgRow[]>('/api/admin/organizations')
      .then(setOrgs).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = orgs.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.country_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/dashboard/admin" className={styles.backLink}>← Admin</Link>
          <h1 className={styles.title}>ORGANISATIONS</h1>
        </div>
        <Link href="/onboarding" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={15} /> Nouvelle organisation
        </Link>
      </header>

      <div className={styles.searchBar}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-slate)' }} />
        <input
          type="text"
          className="input-field"
          style={{ paddingLeft: 36 }}
          placeholder="Rechercher une organisation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.resultsInfo}>
        {loading ? 'Chargement...' : `${filtered.length} organisation${filtered.length !== 1 ? 's' : ''}`}
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr><th>NOM</th><th>TYPE</th><th>PAYS</th><th>FACILITIES</th><th>USERS</th><th>ACTIONS</th></tr>
          </thead>
          <tbody>
            {!loading && filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--brand-slate)' }}>
                  <Building2 size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.35 }} />
                  <p style={{ fontSize: 13 }}>Aucune organisation</p>
                </td>
              </tr>
            ) : filtered.map((o) => (
              <tr key={o.id} className={styles.row}>
                <td className={styles.orgName}>{o.name}</td>
                <td>{o.type}</td>
                <td className="mono" style={{ fontSize: 12 }}>{o.country_code}</td>
                <td><span className="badge info">{o.facilitiesCount}</span></td>
                <td><span className="badge info">{o.usersCount}</span></td>
                <td><Link href={`/admin/organizations/${o.id}`} className={styles.actionLink}>Gérer</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
