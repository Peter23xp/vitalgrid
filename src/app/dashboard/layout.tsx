'use client';

import React from 'react';
import Link from 'next/link';
import {
  Menu, Bell, User, LogOut,
  LayoutDashboard, Briefcase, Globe2, ShieldCheck,
  Package, AlertTriangle, Clock, Upload, Tag,
  ArrowLeftRight, Plus, History, Megaphone,
  BellRing, Thermometer, ClipboardList,
  Map, TrendingUp, FileWarning, BarChart2, Download,
  Building2, MapPin,
  Users, Lock, Settings, KeyRound, ScrollText, CreditCard, Activity, Inbox
} from 'lucide-react';
import { AuthProvider, useAuth } from '@/contexts/auth';
import type { Role } from '@/lib/types';
import styles from './layout.module.css';

// ─── Navigation par rôle ─────────────────────────────────────

type NavItem = { href: string; label: string; icon: React.ReactNode };
type NavGroup = { title: string; items: NavItem[] };

function getNavGroups(role: Role): NavGroup[] {
  const dashboard: NavGroup = {
    title: 'Tableau de bord',
    items: [
      { href: '/dashboard',       label: 'Vue d\'ensemble',  icon: <LayoutDashboard size={15} /> },
    ],
  };

  const inventory: NavGroup = {
    title: 'Inventaire',
    items: [
      { href: '/inventory',           label: 'Ressources',    icon: <Package size={15} /> },
      { href: '/inventory/low-stock', label: 'Stock bas',     icon: <AlertTriangle size={15} /> },
      { href: '/inventory/expiry',    label: 'Expirations',   icon: <Clock size={15} /> },
      { href: '/inventory/new',       label: 'Ajouter',       icon: <Plus size={15} /> },
    ],
  };

  const inventoryFM: NavGroup = {
    title: 'Inventaire',
    items: [
      { href: '/inventory',           label: 'Ressources',    icon: <Package size={15} /> },
      { href: '/inventory/low-stock', label: 'Stock bas',     icon: <AlertTriangle size={15} /> },
      { href: '/inventory/expiry',    label: 'Expirations',   icon: <Clock size={15} /> },
      { href: '/inventory/new',       label: 'Ajouter',       icon: <Plus size={15} /> },
      { href: '/inventory/import',    label: 'Importer CSV',  icon: <Upload size={15} /> },
      { href: '/inventory/categories',label: 'Catégories',    icon: <Tag size={15} /> },
    ],
  };

  const transfers: NavGroup = {
    title: 'Transferts',
    items: [
      { href: '/transfers',     label: 'Mes transferts',  icon: <ArrowLeftRight size={15} /> },
      { href: '/transfers/new', label: 'Nouvelle demande', icon: <Plus size={15} /> },
    ],
  };

  const transfersFM: NavGroup = {
    title: 'Transferts',
    items: [
      { href: '/transfers',         label: 'Transferts',       icon: <ArrowLeftRight size={15} /> },
      { href: '/transfers/new',     label: 'Nouvelle demande', icon: <Plus size={15} /> },
      { href: '/transfers/history', label: 'Historique',       icon: <History size={15} /> },
      { href: '/transfers/broadcast', label: 'Diffusion urgence', icon: <Megaphone size={15} /> },
    ],
  };

  const alerts: NavGroup = {
    title: 'Alertes',
    items: [
      { href: '/alerts',            label: 'Centre alertes',   icon: <BellRing size={15} /> },
      { href: '/alerts/cold-chain', label: 'Chaîne du froid',  icon: <Thermometer size={15} /> },
      { href: '/alerts/history',    label: 'Historique',       icon: <ClipboardList size={15} /> },
    ],
  };

  const analytics: NavGroup = {
    title: 'Analytics',
    items: [
      { href: '/analytics/map',         label: 'Carte régionale',    icon: <Map size={15} /> },
      { href: '/analytics/forecast',    label: 'Prévisions',         icon: <TrendingUp size={15} /> },
      { href: '/analytics/expiry-risk', label: 'Risques expiration', icon: <FileWarning size={15} /> },
      { href: '/analytics/transfers',   label: 'Efficacité',         icon: <BarChart2 size={15} /> },
      { href: '/analytics/export',      label: 'Export & API',       icon: <Download size={15} /> },
    ],
  };

  const facilities: NavGroup = {
    title: 'Établissements',
    items: [
      { href: '/facilities',     label: 'Liste',  icon: <Building2 size={15} /> },
      { href: '/facilities/map', label: 'Carte',  icon: <MapPin size={15} /> },
    ],
  };

  const admin: NavGroup = {
    title: 'Administration',
    items: [
      { href: '/admin/users',           label: 'Utilisateurs',    icon: <Users size={15} /> },
      { href: '/admin/organizations',   label: 'Organisations',   icon: <Building2 size={15} /> },
      { href: '/admin/roles',           label: 'Rôles',           icon: <Lock size={15} /> },
      { href: '/admin/api-keys',        label: 'Clés API',        icon: <KeyRound size={15} /> },
      { href: '/admin/audit-log',       label: 'Journal audit',   icon: <ScrollText size={15} /> },
      { href: '/admin/access-requests', label: 'Demandes accès',  icon: <Inbox size={15} /> },
      { href: '/admin/billing',         label: 'Facturation',     icon: <CreditCard size={15} /> },
      { href: '/admin/system-status',   label: 'Statut système',  icon: <Activity size={15} /> },
    ],
  };

  const orgSettings: NavGroup = {
    title: 'Paramètres',
    items: [
      { href: '/settings/organization', label: 'Mon organisation', icon: <Settings size={15} /> },
    ],
  };

  switch (role) {
    case 'super_admin':
      return [
        { ...dashboard, items: [{ href: '/dashboard/admin', label: 'Vue globale', icon: <ShieldCheck size={15} /> }] },
        admin,
      ];

    case 'facility_manager':
      return [
        { ...dashboard, items: [{ href: '/dashboard', label: 'Vue d\'ensemble', icon: <LayoutDashboard size={15} /> }] },
        inventoryFM,
        transfersFM,
        alerts,
        analytics,
        orgSettings,
      ];

    case 'field_agent':
      return [
        { ...dashboard, items: [{ href: '/dashboard/field', label: 'Mon espace', icon: <Briefcase size={15} /> }] },
        inventory,
        transfers,
        { ...alerts, items: alerts.items.slice(0, 1) },
      ];

    case 'ngo_coordinator':
      return [
        { ...dashboard, items: [{ href: '/dashboard/ngo', label: 'Vue régionale', icon: <Globe2 size={15} /> }] },
        facilities,
        { ...transfersFM, items: transfersFM.items.filter((i) => i.href !== '/transfers/new') },
        analytics,
      ];

    case 'auditor':
      return [
        { ...dashboard, items: [{ href: '/analytics/map', label: 'Carte régionale', icon: <Map size={15} /> }] },
        analytics,
        { title: 'Audit', items: [{ href: '/admin/audit-log', label: 'Journal d\'audit', icon: <ScrollText size={15} /> }] },
      ];

    default:
      return [dashboard];
  }
}

// ─── Sidebar client — lit le rôle depuis AuthContext ─────────

function Sidebar() {
  const { user } = useAuth();
  const groups = user ? getNavGroups(user.role) : [];
  const dashboardHref = user ? {
    super_admin:      '/dashboard/admin',
    facility_manager: '/dashboard',
    field_agent:      '/dashboard/field',
    ngo_coordinator:  '/dashboard/ngo',
    auditor:          '/analytics/map',
  }[user.role] ?? '/dashboard' : '/dashboard';

  return (
    <nav className={styles.sidebar} aria-label="Navigation principale">
      <div className={styles.sidebarInner}>
        {groups.map((group) => (
          <div key={group.title} className={styles.navGroup}>
            <span className={styles.sectionHeader}>{group.title}</span>
            {group.items.map((item) => (
              <Link key={item.href} href={item.href} className={styles.navLink}>
                {item.icon}{item.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </nav>
  );
}

// ─── Layout principal ────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardInner>{children}</DashboardInner>
    </AuthProvider>
  );
}

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  const profileHref = user?.role === 'super_admin'
    ? '/dashboard/admin'
    : '/settings/organization';

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.navbar}>
        <div className={styles.navLeft}>
          <button className={styles.menuBtn} aria-label="Menu">
            <Menu size={20} />
          </button>
          <Link href={user ? {
            super_admin:      '/dashboard/admin',
            facility_manager: '/dashboard',
            field_agent:      '/dashboard/field',
            ngo_coordinator:  '/dashboard/ngo',
            auditor:          '/analytics/map',
          }[user.role] ?? '/dashboard' : '/dashboard'} className={styles.brand}>
            <span className={styles.brandAccent}>Vital</span>Grid
          </Link>
          <div className={styles.divider} />
          {user && (
            <span className={styles.facilityName} style={{ fontSize: 12, color: 'var(--brand-slate)' }}>
              {user.name}
            </span>
          )}
        </div>

        <div className={styles.navRight}>
          <Link href="/alerts" className={styles.notificationBtn} aria-label="Alertes">
            <Bell size={18} />
          </Link>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link href={profileHref} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6, textDecoration: 'none', background: 'rgba(15,23,42,0.04)', border: '1px solid var(--border-light)', transition: 'background 0.15s' }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(15,23,42,0.08)')}
                onMouseOut={(e)  => (e.currentTarget.style.background = 'rgba(15,23,42,0.04)')}>
                <div className={styles.userProfile} style={{ width: 24, height: 24, fontSize: 11 }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--brand-navy)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </span>
              </Link>
              <button
                onClick={logout}
                aria-label="Se déconnecter"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 6, color: 'var(--brand-slate)', transition: 'background 0.15s, color 0.15s', background: 'none', border: 'none', cursor: 'pointer' }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = 'var(--status-error)'; }}
                onMouseOut={(e)  => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--brand-slate)'; }}
                title="Se déconnecter"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </header>

      <div className={styles.body}>
        <Sidebar />
        <main className={styles.pageContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
