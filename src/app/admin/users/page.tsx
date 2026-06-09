'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Users } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  facility_id: string | null;
  status: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '25' });
    if (search) params.set('search', search);
    apiFetch<{ data: User[]; total: number }>(`/api/admin/users?${params}`)
      .then((r) => { setUsers(r.data); setTotal(r.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/dashboard/admin" className={styles.backLink}>← Admin</Link>
          <h1 className={styles.title}>UTILISATEURS</h1>
        </div>
        <button className="btn-primary">+ Inviter</button>
      </header>

      <div className={styles.filtersBar}>
        <div className={styles.searchBox}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Rechercher utilisateur..."
            className={`input-field ${styles.searchInput}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.resultsInfo}>
        {loading ? 'Chargement...' : `${total} utilisateur${total !== 1 ? 's' : ''}`}
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr><th>NOM</th><th>EMAIL</th><th>RÔLE</th><th>STATUT</th><th>ACTIONS</th></tr>
          </thead>
          <tbody>
            {!loading && users.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--brand-slate)' }}>
                  <Users size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.35 }} />
                  <p style={{ fontSize: 13 }}>Aucun utilisateur</p>
                </td>
              </tr>
            ) : users.map((u) => (
              <tr key={u.id} className={styles.row}>
                <td className={styles.nameCell}>{u.name}</td>
                <td className="mono">{u.email}</td>
                <td>{u.role}</td>
                <td><span className={`badge ${u.status === 'active' ? 'success' : 'warning'}`}>{u.status === 'active' ? 'Actif' : u.status}</span></td>
                <td className={styles.actions}><button className={styles.actionBtn}>Modifier</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
