# VitalGrid Plan B — Frontend Wiring

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connecter les 16 pages frontend aux routes API DSQL réelles, remplaçant tous les états vides par des données vivantes.

**Architecture:** Chaque page devient un Client Component (`'use client'`) qui appelle l'API via un hook `useFetch` centralisé. Le `tenant_id` est injecté depuis `NEXT_PUBLIC_TENANT_ID` dans chaque requête via le header `x-tenant-id`. Les pages conservent leur layout exact — seuls les états vides sont remplacés.

**Tech Stack:** Next.js 16, React 19, CSS Modules, Lucide React, fetch natif

---

## Task 0 : Hook utilitaire + env var

**Files:**
- Create: `src/lib/api-client.ts`
- Modify: `.env.local`

- [ ] Ajouter dans `.env.local` :

```
NEXT_PUBLIC_TENANT_ID=00000000-0000-0000-0000-000000000000
NEXT_PUBLIC_FACILITY_ID=00000000-0000-0000-0000-000000000001
```

> Ces UUIDs seront remplacés par les vrais IDs une fois la migration lancée.

- [ ] Créer `src/lib/api-client.ts` :

```typescript
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? '';

export function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  return fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': TENANT_ID,
      ...(init?.headers ?? {}),
    },
  }).then(async (res) => {
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  });
}
```

- [ ] Build check : `npm run build`

---

## Task 1 : Dashboard Facility Manager

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] Remplacer le contenu de `src/app/dashboard/page.tsx` par :

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeftRight, Timer, Package, ChevronRight, PackageX, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Summary {
  totalResources: number;
  criticalAlerts: number;
  activeTransfers: number;
  expiringIn7Days: number;
}

interface Alert {
  id: string;
  title: string;
  severity: string;
  description: string | null;
  created_at: string;
  resource_id: string | null;
}

interface Transfer {
  id: string;
  ref: string;
  resource_id: string;
  quantity: number;
  status: string;
  requesting_facility_id: string;
  source_facility_id: string | null;
  created_at: string;
}

export default function FacilityManagerDashboard() {
  const facilityId = process.env.NEXT_PUBLIC_FACILITY_ID ?? '';
  const [summary, setSummary] = useState<Summary | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  });

  useEffect(() => {
    if (!facilityId || facilityId === '00000000-0000-0000-0000-000000000001') {
      setLoading(false);
      return;
    }
    Promise.all([
      apiFetch<Summary>(`/api/dashboard/summary?facilityId=${facilityId}`),
      apiFetch<{ data: Alert[] }>(`/api/alerts?facilityId=${facilityId}&read=false&severity=critical&limit=3`),
      apiFetch<{ data: Transfer[] }>(`/api/transfers?facilityId=${facilityId}&status=in_transit`),
    ]).then(([s, a, t]) => {
      setSummary(s);
      setAlerts(a.data);
      setTransfers(t.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [facilityId]);

  return (
    <div className={`animate-fade-in ${styles.dashboard}`}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.welcomeTitle}>Tableau de bord</h1>
          <p className={styles.welcomeSubtitle}>{currentDate}</p>
        </div>
        <Link href="/alerts" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={15} />
          Voir les alertes
        </Link>
      </header>

      <section className={styles.metricsGrid}>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(5,150,105,0.1)', color: 'var(--brand-sage)' }}>
            <Package size={18} />
          </div>
          <div className={styles.metricValue}>{loading ? '--' : (summary?.totalResources ?? '--')}</div>
          <p className={styles.metricLabel}>Ressources en stock</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--status-error)' }}>
            <AlertTriangle size={18} />
          </div>
          <div className={styles.metricValue}>{loading ? '--' : (summary?.criticalAlerts ?? '--')}</div>
          <p className={styles.metricLabel}>Alertes critiques</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(14,165,233,0.1)', color: 'var(--status-info)' }}>
            <ArrowLeftRight size={18} />
          </div>
          <div className={styles.metricValue}>{loading ? '--' : (summary?.activeTransfers ?? '--')}</div>
          <p className={styles.metricLabel}>Transferts en cours</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(234,179,8,0.1)', color: 'var(--status-warning)' }}>
            <Timer size={18} />
          </div>
          <div className={styles.metricValue}>{loading ? '--' : (summary?.expiringIn7Days ?? '--')}</div>
          <p className={styles.metricLabel}>Expirent dans 7 jours</p>
        </div>
      </section>

      <div className={styles.mainGrid}>
        <div className={styles.columnLeft}>
          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Alertes prioritaires</h2>
              <Link href="/alerts" className={styles.seeAll}>Tout voir <ChevronRight size={14} /></Link>
            </div>
            {loading || alerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)' }}>
                <PackageX size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }} />
                <p style={{ fontSize: 13 }}>{loading ? 'Chargement...' : 'Aucune alerte active'}</p>
              </div>
            ) : (
              <div className={styles.list}>
                {alerts.map((alert) => (
                  <div key={alert.id} className={styles.listItem}>
                    <div className={styles.itemInfo}>
                      <span className={styles.statusDot} style={{ background: alert.severity === 'critical' ? 'var(--status-error)' : 'var(--status-warning)' }} />
                      <div>
                        <p className={styles.itemTitle}>{alert.title}</p>
                        <p className={styles.itemDesc}>{alert.description ?? ''}</p>
                      </div>
                    </div>
                    {alert.resource_id && (
                      <Link href={`/transfers/new?resource=${alert.resource_id}`} className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px', height: 32 }}>
                        Demander
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Transferts en cours</h2>
              <Link href="/transfers" className={styles.seeAll}>Tout voir <ChevronRight size={14} /></Link>
            </div>
            {loading || transfers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)' }}>
                <ArrowLeftRight size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }} />
                <p style={{ fontSize: 13 }}>{loading ? 'Chargement...' : 'Aucun transfert en cours'}</p>
              </div>
            ) : (
              <div className={styles.list}>
                {transfers.map((t) => (
                  <div key={t.id} className={styles.listItem}>
                    <div className={styles.itemInfo}>
                      <div className={styles.transferDirIcon} style={{ color: 'var(--status-info)' }}>
                        {t.requesting_facility_id === facilityId ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                      </div>
                      <div>
                        <p className={styles.itemTitle}><span className="mono">{t.ref}</span></p>
                        <p className={styles.itemDesc}>{t.quantity} unités</p>
                      </div>
                    </div>
                    <span className="badge info">{t.status}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className={styles.columnRight}>
          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Dernières activités</h2>
            </div>
            <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--brand-slate)' }}>
              <Clock size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }} />
              <p style={{ fontSize: 13 }}>Disponible après connexion DB</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
```

- [ ] Build check : `npm run build`

---

## Task 2 : Page Inventaire — liste

**Files:**
- Modify: `src/app/inventory/page.tsx`

- [ ] Remplacer `src/app/inventory/page.tsx` par :

```tsx
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
```

- [ ] Build check : `npm run build`

---

## Task 3 : Page Transferts — liste

**Files:**
- Modify: `src/app/transfers/page.tsx`

- [ ] Remplacer `src/app/transfers/page.tsx` par :

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, ArrowLeftRight } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Transfer {
  id: string;
  ref: string;
  quantity: number;
  status: string;
  requesting_facility_id: string;
  source_facility_id: string | null;
  created_at: string;
  is_emergency: boolean;
}

const STATUS_TAB: Record<string, string[]> = {
  active: ['in_transit', 'confirmed'],
  pending: ['pending'],
  completed: ['completed', 'incident', 'cancelled'],
};

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'active' | 'pending' | 'completed'>('active');

  useEffect(() => {
    setLoading(true);
    apiFetch<{ data: Transfer[] }>('/api/transfers?limit=50')
      .then((r) => setTransfers(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = transfers.filter((t) => STATUS_TAB[tab].includes(t.status));
  const counts = {
    active: transfers.filter((t) => STATUS_TAB.active.includes(t.status)).length,
    pending: transfers.filter((t) => STATUS_TAB.pending.includes(t.status)).length,
  };

  const BADGE_MAP: Record<string, string> = {
    pending: 'warning', confirmed: 'info', in_transit: 'info',
    delivered: 'warning', completed: 'success', incident: 'critical', cancelled: 'info',
  };

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/dashboard" className={styles.backLink}>← Dashboard</Link>
          <h1 className={styles.title}>MES TRANSFERTS</h1>
        </div>
        <Link href="/transfers/new" className="btn-primary">
          <Plus size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />Nouveau
        </Link>
      </header>

      <div className={styles.tabBar}>
        {(['active', 'pending', 'completed'] as const).map((t) => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'active' ? `En cours (${counts.active})` : t === 'pending' ? `En attente (${counts.pending})` : 'Complétés'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--brand-slate)', fontSize: 13 }}>Chargement...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--brand-slate)' }}>
          <ArrowLeftRight size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }} />
          <p style={{ fontSize: 13 }}>Aucun transfert dans cette catégorie</p>
        </div>
      ) : (
        <section className={styles.section}>
          <div className={styles.cardList}>
            {filtered.map((t) => (
              <div key={t.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.cardRef}>
                    <span className={`mono ${styles.refCode}`}>{t.ref}</span>
                    {t.is_emergency && <span className="badge critical" style={{ marginLeft: 8 }}>URGENCE</span>}
                  </div>
                  <span className={`badge ${BADGE_MAP[t.status] ?? 'info'}`}>{t.status.toUpperCase()}</span>
                </div>
                <div className={styles.cardRoute}>
                  <span className={styles.routeValue}>{t.quantity} unités</span>
                </div>
                <div className={styles.cardActions}>
                  <Link href={`/transfers/${t.id}`} className="btn-secondary" style={{ fontSize: '0.85rem', height: '36px', padding: '0 1rem' }}>
                    Voir détails
                  </Link>
                  {t.status === 'delivered' && (
                    <Link href={`/transfers/${t.id}/receive`} className="btn-primary" style={{ fontSize: '0.85rem', height: '36px', padding: '0 1rem' }}>
                      Confirmer réception
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

- [ ] Build check : `npm run build`

---

## Task 4 : Page Alertes — liste

**Files:**
- Modify: `src/app/alerts/page.tsx`

- [ ] Remplacer `src/app/alerts/page.tsx` par :

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Settings, BellOff } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Alert {
  id: string;
  title: string;
  description: string | null;
  severity: string;
  alert_type: string;
  is_read: boolean;
  resource_id: string | null;
  transfer_id: string | null;
  created_at: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'critical' | 'warning'>('all');

  const load = () => {
    setLoading(true);
    apiFetch<{ data: Alert[]; unreadCount: number }>('/api/alerts?limit=50')
      .then((r) => setAlerts(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markRead = (id: string) => {
    apiFetch(`/api/alerts/${id}/read`, { method: 'PATCH' })
      .then(() => setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, is_read: true } : a)))
      .catch(console.error);
  };

  const filtered = alerts.filter((a) => tab === 'all' || a.severity === tab);
  const unread = alerts.filter((a) => !a.is_read);
  const counts = {
    all: alerts.length,
    critical: alerts.filter((a) => a.severity === 'critical').length,
    warning: alerts.filter((a) => a.severity === 'warning').length,
  };

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/dashboard" className={styles.backLink}>← Dashboard</Link>
          <h1 className={styles.title}>ALERTES</h1>
        </div>
        <div className={styles.headerActions}>
          <Link href="/alerts/rules/new" className="btn-outline">
            <Settings size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            Règles
          </Link>
        </div>
      </header>

      <div className={styles.summary}>
        <span className={styles.pulseDot}></span>
        <span>{unread.length} alerte{unread.length !== 1 ? 's' : ''} non lue{unread.length !== 1 ? 's' : ''}</span>
      </div>

      <div className={styles.tabBar}>
        {(['all', 'critical', 'warning'] as const).map((t) => (
          <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>
            {t === 'all' ? `Toutes (${counts.all})` : t === 'critical' ? `Critiques (${counts.critical})` : `Avertissements (${counts.warning})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--brand-slate)', fontSize: 13 }}>Chargement...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--brand-slate)' }}>
          <BellOff size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }} />
          <p style={{ fontSize: 13 }}>Aucune alerte active</p>
        </div>
      ) : (
        <section className={styles.section}>
          {filtered.map((alert) => (
            <div
              key={alert.id}
              className={`${styles.alertCard} ${alert.severity === 'critical' ? styles.alertCritical : styles.alertWarning}`}
              style={{ opacity: alert.is_read ? 0.6 : 1 }}
            >
              <div className={styles.alertHeader}>
                <span className={`badge ${alert.severity === 'critical' ? 'critical' : 'warning'}`}>
                  {alert.severity === 'critical' ? 'CRITIQUE' : 'AVERTISSEMENT'}
                </span>
                <span className={`${styles.timestamp} mono`}>
                  {new Date(alert.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h3 className={styles.alertTitle}>{alert.title}</h3>
              {alert.description && <p className={styles.alertSubtitle}>{alert.description}</p>}
              <div className={styles.alertActions}>
                {alert.resource_id && (
                  <Link href={`/inventory/${alert.resource_id}`} className="btn-secondary">Voir ressource</Link>
                )}
                {alert.transfer_id && (
                  <Link href={`/transfers/${alert.transfer_id}`} className="btn-secondary">Voir transfert</Link>
                )}
                {!alert.is_read && (
                  <button className={styles.btnMark} onClick={() => markRead(alert.id)}>✓ Marquer lu</button>
                )}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
```

- [ ] Build check : `npm run build`

---

## Task 5 : Page Facilities — liste

**Files:**
- Modify: `src/app/facilities/page.tsx`

- [ ] Remplacer `src/app/facilities/page.tsx` par :

```tsx
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
          <select className={`input-field ${styles.select}`}>
            <option>Région : Toutes</option>
          </select>
          <select className={`input-field ${styles.select}`}>
            <option>Statut : Tous</option>
          </select>
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
```

- [ ] Build check : `npm run build`

---

## Task 6 : Page Admin — Utilisateurs & Journal d'audit

**Files:**
- Modify: `src/app/admin/users/page.tsx`
- Modify: `src/app/admin/audit-log/page.tsx`

- [ ] Ajouter `'use client'` et fetch dans `src/app/admin/users/page.tsx` — remplacer l'import React et la ligne `export default` par :

```tsx
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
                <td className={styles.actions}>
                  <button className={styles.actionBtn}>Modifier</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] Ajouter `'use client'` et fetch dans `src/app/admin/audit-log/page.tsx` — remplacer le fichier par :

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ScrollText } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface AuditEntry {
  id: string;
  user_label: string | null;
  action: string;
  detail: string | null;
  result: string;
  created_at: string;
}

export default function AdminAuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch<{ data: AuditEntry[]; total: number }>('/api/admin/audit-log?limit=50')
      .then((r) => { setEntries(r.data); setTotal(r.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/dashboard/admin" className={styles.backLink}>← Admin</Link>
          <h1 className={styles.title}>JOURNAL D&apos;AUDIT</h1>
        </div>
        <button className="btn-secondary">Exporter</button>
      </header>

      <div className={styles.infoBanner}>
        Journal immuable — Aurora DSQL append-only. Aucune entrée ne peut être modifiée ou supprimée.
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr><th>HORODATAGE</th><th>UTILISATEUR</th><th>ACTION</th><th>DÉTAIL</th><th>RÉSULTAT</th></tr>
          </thead>
          <tbody>
            {!loading && entries.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--brand-slate)' }}>
                  <ScrollText size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.35 }} />
                  <p style={{ fontSize: 13 }}>Aucun log disponible</p>
                </td>
              </tr>
            ) : entries.map((e) => (
              <tr key={e.id} className={styles.row}>
                <td className="mono" style={{ fontSize: 12 }}>{new Date(e.created_at).toLocaleString('fr-FR')}</td>
                <td>{e.user_label ?? '[système]'}</td>
                <td>{e.action}</td>
                <td style={{ fontSize: 12, color: 'var(--brand-slate)' }}>{e.detail ?? '—'}</td>
                <td><span className={`badge ${e.result === 'success' ? 'success' : 'critical'}`}>{e.result === 'success' ? '✓ Succès' : '✗ Refusé'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {total > 0 && <p style={{ fontSize: 12, color: 'var(--brand-slate)', padding: '12px 0' }}>{total} entrées au total</p>}
    </div>
  );
}
```

- [ ] Build check : `npm run build`
- [ ] Commit :

```bash
git add src/lib/api-client.ts src/app/dashboard/page.tsx src/app/inventory/page.tsx src/app/transfers/page.tsx src/app/alerts/page.tsx src/app/facilities/page.tsx src/app/admin/users/page.tsx src/app/admin/audit-log/page.tsx .env.local
git commit -m "feat: wire 7 frontend pages to real DSQL API routes"
```

---

## Task 7 : Inventory detail + transfers detail

**Files:**
- Modify: `src/app/inventory/[id]/page.tsx`
- Modify: `src/app/transfers/[id]/page.tsx`

- [ ] Remplacer `src/app/inventory/[id]/page.tsx` par :

```tsx
'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Pencil, ArrowLeftRight, FileDown, AlertCircle, Layers, MapPin, History } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Resource {
  id: string; name: string; category: string; zone: string | null;
  total_quantity: number; alert_threshold: number; unit_of_measure: string;
  facility_id: string; notes: string | null;
}
interface Batch { id: string; batch_number: string; quantity: number; expiry_date: string; }
interface Movement { id: string; delta: number; reason: string; location: string | null; created_at: string; }

export default function ResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [resource, setResource] = useState<Resource | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<Resource>(`/api/inventory/${id}`),
      apiFetch<Batch[]>(`/api/inventory/${id}/batches`),
      apiFetch<Movement[]>(`/api/inventory/${id}/movements`),
    ]).then(([r, b, m]) => { setResource(r); setBatches(b); setMovements(m); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const isCritical = resource && resource.total_quantity <= resource.alert_threshold;

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/inventory" className={styles.backLink}>← Inventaire</Link>
          <h1 className={styles.title}>DÉTAIL RESSOURCE</h1>
        </div>
        <div className={styles.headerActions}>
          <Link href={`/inventory/new?edit=${id}`} className="btn-outline">
            <Pencil size={14} style={{ marginRight: 4 }} />Modifier
          </Link>
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--brand-slate)', fontSize: 13 }}>Chargement...</div>
      ) : !resource ? (
        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--brand-slate)' }}>
          <AlertCircle size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }} />
          <p style={{ fontSize: 13 }}>Ressource introuvable</p>
        </div>
      ) : (
        <>
          <section className={styles.resourceIdentity}>
            <h2 className={styles.resourceName}>{resource.name}</h2>
            <p className={styles.resourceMeta}>ID: {resource.id} · Catégorie: {resource.category} · Zone: {resource.zone ?? '—'}</p>
          </section>

          <div className={styles.mainGrid}>
            <div className={styles.column}>
              <div className={`${styles.statusCard} ${isCritical ? styles.cardCritical : ''}`}>
                <h3 className={styles.statusHeader}>
                  <AlertCircle size={16} style={{ marginRight: 6 }} />
                  {isCritical ? 'STOCK CRITIQUE' : 'STOCK'}
                </h3>
                <div className={styles.statusDetails}>
                  <div className={styles.detailRow}><span className={styles.detailLabel}>Quantité actuelle</span><span className={styles.detailValue}>{resource.total_quantity} {resource.unit_of_measure}</span></div>
                  <div className={styles.detailRow}><span className={styles.detailLabel}>Seuil d&apos;alerte</span><span className={styles.detailValue}>{resource.alert_threshold}</span></div>
                </div>
              </div>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Lots en stock</h3>
                {batches.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--brand-slate)' }}>
                    <Layers size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.35 }} />
                    <p style={{ fontSize: 13 }}>Aucun lot</p>
                  </div>
                ) : (
                  <div className={styles.list}>
                    {batches.map((b) => (
                      <div key={b.id} className={styles.listItem}>
                        <span className={styles.lotName}>{b.batch_number}</span>
                        <span className={styles.lotQty}>Qté: {b.quantity}</span>
                        <span className={styles.lotExpiry}>Expire: {b.expiry_date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Disponibilité à proximité</h3>
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--brand-slate)' }}>
                  <MapPin size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.35 }} />
                  <p style={{ fontSize: 13 }}>Disponible après connexion DB</p>
                </div>
              </section>
            </div>

            <div className={styles.column}>
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Historique (30 jours)</h3>
                {movements.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--brand-slate)' }}>
                    <History size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.35 }} />
                    <p style={{ fontSize: 13 }}>Aucun mouvement</p>
                  </div>
                ) : (
                  <table className={styles.historyTable}>
                    <tbody>
                      {movements.map((m) => (
                        <tr key={m.id}>
                          <td className={styles.dateCell}>{new Date(m.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</td>
                          <td className={m.delta > 0 ? styles.deltaPositive : styles.deltaNegative}>{m.delta > 0 ? `+${m.delta}` : m.delta}</td>
                          <td>{m.reason}</td>
                          <td className={styles.metaCell}>{m.location ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>

              <div className={styles.actionGroup}>
                <Link href={`/transfers/new?resource=${id}`} className="btn-primary" style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <ArrowLeftRight size={15} />Demander un transfert
                </Link>
                <button className="btn-outline" style={{ width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <FileDown size={15} />Exporter historique
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] Remplacer `src/app/transfers/[id]/page.tsx` par :

```tsx
'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Share2, History } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Transfer {
  id: string; ref: string; quantity: number; status: string;
  priority: string; is_emergency: boolean; motif: string | null;
  requesting_facility_id: string; source_facility_id: string | null;
  driver_name: string | null; driver_phone: string | null;
  vehicle_ref: string | null; created_at: string; updated_at: string;
}

const STATUS_BADGE: Record<string, string> = {
  pending: 'warning', confirmed: 'info', in_transit: 'info',
  delivered: 'warning', completed: 'success', incident: 'critical',
};

export default function TransferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Transfer>(`/api/transfers/${id}`)
      .then(setTransfer)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/transfers" className={styles.backLink}>← Transferts</Link>
          <h1 className={styles.title}>{transfer ? `TRANSFERT ${transfer.ref}` : 'TRANSFERT'}</h1>
        </div>
        <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Share2 size={14} />Partager
        </button>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--brand-slate)', fontSize: 13 }}>Chargement...</div>
      ) : !transfer ? (
        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--brand-slate)' }}>
          <History size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }} />
          <p style={{ fontSize: 13 }}>Transfert introuvable</p>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              {transfer.quantity} unités · Priorité: {transfer.priority}
              {transfer.is_emergency && <span className="badge critical" style={{ marginLeft: 8 }}>URGENCE</span>}
            </p>
            <span className={`badge ${STATUS_BADGE[transfer.status] ?? 'info'}`}>
              {transfer.status.toUpperCase()}
            </span>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 10, padding: 20, marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Détails logistiques</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', fontSize: 13 }}>
              <div><span style={{ color: 'var(--brand-slate)' }}>Motif</span><br /><strong>{transfer.motif ?? '—'}</strong></div>
              {transfer.driver_name && <div><span style={{ color: 'var(--brand-slate)' }}>Transporteur</span><br /><strong>{transfer.driver_name}</strong></div>}
              {transfer.driver_phone && <div><span style={{ color: 'var(--brand-slate)' }}>Téléphone</span><br /><a href={`tel:${transfer.driver_phone}`} style={{ color: 'var(--brand-sage)' }}>{transfer.driver_phone}</a></div>}
              {transfer.vehicle_ref && <div><span style={{ color: 'var(--brand-slate)' }}>Véhicule</span><br /><strong>{transfer.vehicle_ref}</strong></div>}
              <div><span style={{ color: 'var(--brand-slate)' }}>Créé le</span><br /><strong>{new Date(transfer.created_at).toLocaleString('fr-FR')}</strong></div>
            </div>
          </div>

          {transfer.status === 'delivered' && (
            <Link href={`/transfers/${id}/receive`} className="btn-primary" style={{ display: 'block', textAlign: 'center', padding: '14px' }}>
              CONFIRMER LA RÉCEPTION
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] Build check : `npm run build`
- [ ] Commit :

```bash
git add src/app/inventory/[id]/page.tsx src/app/transfers/[id]/page.tsx
git commit -m "feat: wire inventory detail and transfer detail pages to DSQL API"
```

---

## Task 8 : Low-stock, expiry, receive form

**Files:**
- Modify: `src/app/inventory/low-stock/page.tsx`
- Modify: `src/app/inventory/expiry/page.tsx`
- Modify: `src/app/transfers/[id]/receive/page.tsx`

- [ ] Ajouter `'use client'` + fetch dans `src/app/inventory/low-stock/page.tsx` — remplacer le début :

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Settings, AlertTriangle, Megaphone } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Resource {
  id: string; name: string; total_quantity: number; alert_threshold: number; category: string;
}

export default function LowStockPage() {
  const facilityId = process.env.NEXT_PUBLIC_FACILITY_ID ?? '';
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!facilityId || facilityId === '00000000-0000-0000-0000-000000000001') { setLoading(false); return; }
    apiFetch<Resource[]>(`/api/inventory/low-stock?facilityId=${facilityId}`)
      .then(setResources).catch(console.error).finally(() => setLoading(false));
  }, [facilityId]);

  const critical = resources.filter((r) => r.total_quantity <= r.alert_threshold);
  const low = resources.filter((r) => r.total_quantity > r.alert_threshold && r.total_quantity <= r.alert_threshold * 1.5);

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/inventory" className={styles.backLink}>← Inventaire</Link>
          <h1 className={styles.title}>ALERTES STOCK BAS</h1>
        </div>
        <Link href="/alerts/rules/new" className="btn-outline">
          <Settings size={14} style={{ marginRight: 4 }} />Configurer seuils
        </Link>
      </header>

      <p style={{ marginBottom: 20, color: 'var(--brand-slate)', fontSize: 14 }}>
        {loading ? 'Chargement...' : `${resources.length} ressource${resources.length !== 1 ? 's' : ''} en dessous du seuil`}
      </p>

      {!loading && critical.length === 0 && low.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--brand-slate)' }}>
          <AlertTriangle size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }} />
          <p style={{ fontSize: 13 }}>Aucune ressource sous le seuil</p>
        </div>
      )}

      {critical.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>CRITIQUES ({critical.length})</h2>
          <div className={styles.cardElevated}>
            {critical.map((r) => (
              <div key={r.id} className={styles.listItem}>
                <div className={styles.itemInfo}>
                  <span className={styles.statusDot} style={{ background: 'var(--status-error)' }} />
                  <div>
                    <p className={styles.itemName}>{r.name}</p>
                    <p className={styles.itemDesc}>{r.total_quantity} / seuil {r.alert_threshold}</p>
                  </div>
                </div>
                <Link href={`/transfers/new?resource=${r.id}`} className="btn-secondary" style={{ fontSize: 12, height: 32, padding: '0 12px' }}>
                  Demander
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {low.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>FAIBLES ({low.length})</h2>
          <div className={styles.cardElevated}>
            {low.map((r) => (
              <div key={r.id} className={styles.listItem}>
                <div className={styles.itemInfo}>
                  <span className={styles.statusDot} style={{ background: 'var(--status-warning)' }} />
                  <div>
                    <p className={styles.itemName}>{r.name}</p>
                    <p className={styles.itemDesc}>{r.total_quantity} / seuil {r.alert_threshold}</p>
                  </div>
                </div>
                <Link href={`/inventory/${r.id}`} className="btn-secondary" style={{ fontSize: 12, height: 32, padding: '0 12px' }}>
                  Voir
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      <div style={{ marginTop: 24 }}>
        <Link href="/transfers/broadcast" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          <Megaphone size={15} />Broadcast urgence régionale
        </Link>
      </div>
    </div>
  );
}
```

- [ ] Ajouter `'use client'` + fetch dans `src/app/inventory/expiry/page.tsx` — remplacer le début :

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, Megaphone } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface BatchRow {
  id: string; batch_number: string; quantity: number; expiry_date: string;
  resource_name: string; unit_of_measure: string; resource_id: string;
}

export default function ExpiryPage() {
  const facilityId = process.env.NEXT_PUBLIC_FACILITY_ID ?? '';
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [daysAhead, setDaysAhead] = useState(7);

  useEffect(() => {
    if (!facilityId || facilityId === '00000000-0000-0000-0000-000000000001') { setLoading(false); return; }
    setLoading(true);
    apiFetch<BatchRow[]>(`/api/inventory/expiry?facilityId=${facilityId}&daysAhead=${daysAhead}`)
      .then(setBatches).catch(console.error).finally(() => setLoading(false));
  }, [facilityId, daysAhead]);

  const daysLeft = (date: string) => Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/inventory" className={styles.backLink}>← Inventaire</Link>
          <h1 className={styles.title}>SUIVI DES EXPIRATIONS</h1>
        </div>
        <button className="btn-outline">Exporter liste</button>
      </header>

      <div className={styles.horizonTabs}>
        {[7, 30, 90].map((d) => (
          <button key={d} className={`${styles.horizonBtn} ${daysAhead === d ? styles.horizonActive : ''}`} onClick={() => setDaysAhead(d)}>
            {d} jours
          </button>
        ))}
      </div>

      <p style={{ marginBottom: 20, color: 'var(--brand-slate)', fontSize: 14 }}>
        {loading ? 'Chargement...' : `${batches.length} ressource${batches.length !== 1 ? 's' : ''} expirent dans moins de ${daysAhead} jours`}
      </p>

      {!loading && batches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--brand-slate)' }}>
          <Clock size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }} />
          <p style={{ fontSize: 13 }}>Aucune ressource dans cette période</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead><tr><th>RESSOURCE</th><th>LOT</th><th>QTÉ</th><th>EXPIRE</th><th>JOURS</th><th>ACTION</th></tr></thead>
            <tbody>
              {batches.map((b) => {
                const days = daysLeft(b.expiry_date);
                const cls = days <= 3 ? 'critical' : days <= 7 ? 'warning' : 'info';
                return (
                  <tr key={b.id} className={styles.row}>
                    <td>{b.resource_name}</td>
                    <td className="mono">{b.batch_number}</td>
                    <td>{b.quantity} {b.unit_of_measure}</td>
                    <td>{b.expiry_date}</td>
                    <td><span className={`badge ${cls}`}>J+{days}</span></td>
                    <td><Link href={`/transfers/broadcast?resource=${b.resource_id}`} className="btn-secondary" style={{ fontSize: 12, height: 30, padding: '0 10px' }}>Redistribuer</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <Link href="/transfers/broadcast" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          <Megaphone size={15} />Créer broadcast de don d&apos;urgence
        </Link>
      </div>
    </div>
  );
}
```

- [ ] Rendre `src/app/transfers/[id]/receive/page.tsx` fonctionnel — ajouter `'use client'` et le POST :

```tsx
'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

export default function ReceivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [receivedQty, setReceivedQty] = useState(0);
  const [packagingOk, setPackagingOk] = useState(true);
  const [condition, setCondition] = useState('good');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!receivedQty) { setError('La quantité reçue est requise'); return; }
    setSubmitting(true);
    setError('');
    try {
      await apiFetch(`/api/transfers/${id}/receive`, {
        method: 'POST',
        body: JSON.stringify({ received_qty: receivedQty, packaging_ok: packagingOk, condition, notes }),
      });
      router.push('/transfers');
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <Link href={`/transfers/${id}`} className={styles.backLink}>← Transfert {id.slice(0, 8)}...</Link>
        <h1 className={styles.title}>CONFIRMER RÉCEPTION</h1>
      </header>

      {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--status-error)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: 'var(--status-error)', fontSize: 13 }}>{error}</div>}

      <div className={styles.formCard}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Quantité réellement reçue *</label>
            <input type="number" className="input-field" min={0} value={receivedQty || ''} onChange={(e) => setReceivedQty(Number(e.target.value))} required />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Conformité emballage *</label>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                <input type="radio" name="packaging" checked={packagingOk} onChange={() => setPackagingOk(true)} />Conforme
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                <input type="radio" name="packaging" checked={!packagingOk} onChange={() => setPackagingOk(false)} />Problème
              </label>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>État général *</label>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              {['good', 'acceptable', 'bad'].map((v) => (
                <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  <input type="radio" name="condition" checked={condition === v} onChange={() => setCondition(v)} />
                  {v === 'good' ? 'Bon' : v === 'acceptable' ? 'Acceptable' : 'Mauvais'}
                </label>
              ))}
            </div>
          </div>
          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <label className={styles.label}>Observations</label>
            <textarea className={`input-field ${styles.textarea}`} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observations éventuelles..." />
          </div>
        </div>

        <div className={styles.formActions}>
          <Link href={`/transfers/${id}`} className="btn-secondary" style={{ padding: '0 2rem' }}>ANNULER</Link>
          <button className="btn-primary" style={{ padding: '0 2rem' }} onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Confirmation...' : '✅ CONFIRMER RÉCEPTION'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] Build check : `npm run build`
- [ ] Commit final Plan B :

```bash
git add src/app/inventory/low-stock/page.tsx src/app/inventory/expiry/page.tsx src/app/transfers/[id]/receive/page.tsx
git commit -m "feat: wire low-stock, expiry, and transfer receipt form to DSQL API"
```
