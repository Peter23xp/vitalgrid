'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2, Users, Database, Zap, ChevronRight,
  Shield, Globe2, Key, ScrollText, CreditCard,
  TrendingUp, AlertTriangle, CheckCircle2, Clock, Inbox
} from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth';
import styles from './page.module.css';

interface Summary {
  orgs: number;
  facilities: number;
  users: number;
  recentOrgs: { id: string; name: string; type: string; country_code: string; facilitiesCount: number }[];
}

const ADMIN_MODULES = [
  { href: '/admin/organizations', icon: <Globe2 size={20} />, label: 'Organisations', desc: 'Gérer toutes les organisations de la plateforme', color: 'rgba(5,150,105,0.1)', iconColor: 'var(--brand-sage)' },
  { href: '/admin/users',         icon: <Users size={20} />,    label: 'Utilisateurs',   desc: 'Comptes, rôles, invitations, accès', color: 'rgba(14,165,233,0.1)', iconColor: 'var(--status-info)' },
  { href: '/admin/roles',         icon: <Shield size={20} />,   label: 'Rôles & Permissions', desc: 'Matrice d\'accès par rôle', color: 'rgba(234,179,8,0.1)', iconColor: 'var(--status-warning)' },
  { href: '/admin/api-keys',      icon: <Key size={20} />,      label: 'Clés API',       desc: 'Tokens, scopes, intégrations DHIS2/ERP', color: 'rgba(239,68,68,0.1)', iconColor: 'var(--status-error)' },
  { href: '/admin/audit-log',     icon: <ScrollText size={20} />, label: 'Journal d\'audit', desc: 'Trace immuable de toutes les actions', color: 'rgba(15,23,42,0.06)', iconColor: 'var(--brand-navy)' },
  { href: '/admin/billing',       icon: <CreditCard size={20} />, label: 'Facturation',  desc: 'Plans, usage, factures', color: 'rgba(5,150,105,0.1)', iconColor: 'var(--brand-sage)' },
  { href: '/admin/system-status', icon: <Zap size={20} />,      label: 'Statut système', desc: 'Infrastructure, latences, santé des services', color: 'rgba(14,165,233,0.1)', iconColor: 'var(--status-info)' },
  { href: '/admin/import',          icon: <Database size={20} />, label: 'Import bulk',        desc: 'CSV, JSON, DHIS2 — import multi-org', color: 'rgba(15,23,42,0.06)', iconColor: 'var(--brand-navy)' },
  { href: '/admin/access-requests', icon: <Inbox size={20} />,    label: 'Demandes d\'accès',  desc: 'Demandes de démo et d\'accès plateforme', color: 'rgba(14,165,233,0.1)', iconColor: 'var(--status-info)' },
];

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Summary>('/api/admin/platform-summary')
      .then(setSummary).catch(console.error).finally(() => setLoading(false));
  }, []);

  const v = (n: number | undefined) => loading ? '—' : (n?.toLocaleString('fr-FR') ?? '—');

  return (
    <div className={styles.dashboard}>

      {/* Header — identité distincte Super Admin */}
      <header className={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ background: 'var(--brand-navy)', color: 'white', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.5px', textTransform: 'uppercase' as const }}>
              Super Admin
            </div>
            <span style={{ fontSize: 12, color: 'var(--brand-slate)' }}>{user?.name}</span>
          </div>
          <h1 className={styles.welcomeTitle}>Panneau de contrôle plateforme</h1>
          <p className={styles.welcomeSubtitle}>Vue globale · {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/admin/organizations" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <Globe2 size={15} />Organisations
          </Link>
          <Link href="/admin/system-status" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <CheckCircle2 size={15} />Statut système
          </Link>
        </div>
      </header>

      {/* Métriques plateforme — chiffres globaux, pas par facility */}
      <section className={styles.metricsGrid}>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(5,150,105,0.1)', color: 'var(--brand-sage)' }}><Globe2 size={18} /></div>
          <div className={styles.metricValue}>{v(summary?.orgs)}</div>
          <p className={styles.metricLabel}>Organisations</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(14,165,233,0.1)', color: 'var(--status-info)' }}><Building2 size={18} /></div>
          <div className={styles.metricValue}>{v(summary?.facilities)}</div>
          <p className={styles.metricLabel}>Établissements</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(234,179,8,0.1)', color: 'var(--status-warning)' }}><Users size={18} /></div>
          <div className={styles.metricValue}>{v(summary?.users)}</div>
          <p className={styles.metricLabel}>Utilisateurs actifs</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(15,23,42,0.06)', color: 'var(--brand-navy)' }}><Zap size={18} /></div>
          <div className={styles.metricValue}>—</div>
          <p className={styles.metricLabel}>Requêtes / 24h</p>
        </div>
      </section>

      <div className={styles.mainGrid}>
        {/* Colonne gauche — modules admin */}
        <div className={styles.columnLeft}>
          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Modules d&apos;administration</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--border-light)' }}>
              {ADMIN_MODULES.map((m) => (
                <Link key={m.href} href={m.href} style={{ textDecoration: 'none', background: 'var(--bg-card)', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 12, transition: 'background 0.12s' }}
                  onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-main)')}
                  onMouseOut={(e)  => (e.currentTarget.style.background = 'var(--bg-card)')}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: m.color, color: m.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {m.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-navy)', marginBottom: 2 }}>{m.label}</p>
                    <p style={{ fontSize: 11, color: 'var(--brand-slate)', lineHeight: 1.4 }}>{m.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Colonne droite — orgs récentes + santé infra */}
        <div className={styles.columnRight}>
          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Organisations récentes</h2>
              <Link href="/admin/organizations" className={styles.seeAll}>Tout voir <ChevronRight size={14} /></Link>
            </div>
            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--brand-slate)', fontSize: 13 }}>Chargement...</div>
            ) : !summary?.recentOrgs?.length ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--brand-slate)' }}>
                <Globe2 size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.35 }} />
                <p style={{ fontSize: 13 }}>Aucune organisation</p>
                <Link href="/admin/organizations" className="btn-primary" style={{ display: 'inline-flex', marginTop: 12, fontSize: 12, padding: '8px 16px' }}>
                  Créer une organisation
                </Link>
              </div>
            ) : (
              <div className={styles.orgList}>
                {summary.recentOrgs.map((o) => (
                  <Link key={o.id} href={`/admin/organizations/${o.id}`} className={styles.orgItem} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}
                    onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-main)')}
                    onMouseOut={(e)  => (e.currentTarget.style.background = '')}>
                    <div className={styles.orgAvatar}>{o.name.charAt(0).toUpperCase()}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className={styles.orgName} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.name}</p>
                      <p className={styles.orgMeta}>{Number(o.facilitiesCount)} facility · {o.country_code} · {o.type}</p>
                    </div>
                    <ChevronRight size={14} style={{ color: 'var(--brand-slate)', flexShrink: 0 }} />
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Santé infrastructure</h2>
              <Link href="/admin/system-status" className={styles.seeAll}>Détails <ChevronRight size={14} /></Link>
            </div>
            <div className={styles.healthList}>
              {[
                { name: 'Aurora DSQL', sub: 'Base de données principale', ok: true },
                { name: 'DynamoDB IoT', sub: 'Capteurs cold-chain', ok: true },
                { name: 'Vercel Edge', sub: 'Réseau mondial', ok: true },
              ].map((s) => (
                <div key={s.name} className={styles.healthItem}>
                  <div className={styles.healthLeft}>
                    <div className={styles.healthDot} style={{ background: s.ok ? 'var(--status-success)' : 'var(--status-error)' }} />
                    <div>
                      <p className={styles.healthName}>{s.name}</p>
                      <p className={styles.healthSub}>{s.sub}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: s.ok ? 'var(--status-success)' : 'var(--status-error)', fontWeight: 600 }}>
                    {s.ok ? 'OK' : 'ERREUR'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
