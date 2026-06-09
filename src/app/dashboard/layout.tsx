import React from 'react';
import Link from 'next/link';
import {
  Menu, Bell, User,
  LayoutDashboard, Briefcase, Globe2, ShieldCheck,
  Package, AlertTriangle, Clock, Upload, Tag,
  ArrowLeftRight, Plus, History, Megaphone,
  BellRing, Thermometer, ClipboardList,
  Map, TrendingUp, FileWarning, BarChart2, Download,
  Building2, MapPin,
  Users, Lock, Settings, KeyRound, ScrollText, CreditCard, Activity
} from 'lucide-react';
import styles from './layout.module.css';
import { AuthProvider } from '@/contexts/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.navbar}>
        <div className={styles.navLeft}>
          <button className={styles.menuBtn} aria-label="Menu">
            <Menu size={20} />
          </button>
          <Link href="/dashboard" className={styles.brand}>
            <span className={styles.brandAccent}>Vital</span>Grid
          </Link>
          <div className={styles.divider} />
        </div>

        <div className={styles.navRight}>
          <Link href="/alerts" className={styles.notificationBtn} aria-label="Alertes">
            <Bell size={18} />
          </Link>
          <Link href="/admin/organization" className={styles.userProfile} aria-label="Profil">
            <User size={16} />
          </Link>
        </div>
      </header>

      <div className={styles.body}>
        <nav className={styles.sidebar} aria-label="Navigation principale">
          <div className={styles.sidebarInner}>

            <div className={styles.navGroup}>
              <span className={styles.sectionHeader}>Tableau de bord</span>
              <Link href="/dashboard" className={styles.navLink}><LayoutDashboard size={15} />Vue d&apos;ensemble</Link>
              <Link href="/dashboard/field" className={styles.navLink}><Briefcase size={15} />Terrain</Link>
              <Link href="/dashboard/ngo" className={styles.navLink}><Globe2 size={15} />ONG</Link>
              <Link href="/dashboard/admin" className={styles.navLink}><ShieldCheck size={15} />Super Admin</Link>
            </div>

            <div className={styles.navGroup}>
              <span className={styles.sectionHeader}>Inventaire</span>
              <Link href="/inventory" className={styles.navLink}><Package size={15} />Ressources</Link>
              <Link href="/inventory/low-stock" className={styles.navLink}><AlertTriangle size={15} />Stock bas</Link>
              <Link href="/inventory/expiry" className={styles.navLink}><Clock size={15} />Expirations</Link>
              <Link href="/inventory/import" className={styles.navLink}><Upload size={15} />Importer</Link>
              <Link href="/inventory/categories" className={styles.navLink}><Tag size={15} />Catégories</Link>
            </div>

            <div className={styles.navGroup}>
              <span className={styles.sectionHeader}>Transferts</span>
              <Link href="/transfers" className={styles.navLink}><ArrowLeftRight size={15} />Mes transferts</Link>
              <Link href="/transfers/new" className={styles.navLink}><Plus size={15} />Nouvelle demande</Link>
              <Link href="/transfers/history" className={styles.navLink}><History size={15} />Historique</Link>
              <Link href="/transfers/broadcast" className={styles.navLink}><Megaphone size={15} />Diffusion urgence</Link>
            </div>

            <div className={styles.navGroup}>
              <span className={styles.sectionHeader}>Alertes</span>
              <Link href="/alerts" className={styles.navLink}><BellRing size={15} />Centre alertes</Link>
              <Link href="/alerts/cold-chain" className={styles.navLink}><Thermometer size={15} />Chaîne du froid</Link>
              <Link href="/alerts/history" className={styles.navLink}><ClipboardList size={15} />Historique</Link>
            </div>

            <div className={styles.navGroup}>
              <span className={styles.sectionHeader}>Analytics</span>
              <Link href="/analytics/map" className={styles.navLink}><Map size={15} />Carte régionale</Link>
              <Link href="/analytics/forecast" className={styles.navLink}><TrendingUp size={15} />Prévisions</Link>
              <Link href="/analytics/expiry-risk" className={styles.navLink}><FileWarning size={15} />Risques expiration</Link>
              <Link href="/analytics/transfers" className={styles.navLink}><BarChart2 size={15} />Efficacité</Link>
              <Link href="/analytics/export" className={styles.navLink}><Download size={15} />Export & API</Link>
            </div>

            <div className={styles.navGroup}>
              <span className={styles.sectionHeader}>Établissements</span>
              <Link href="/facilities" className={styles.navLink}><Building2 size={15} />Liste</Link>
              <Link href="/facilities/map" className={styles.navLink}><MapPin size={15} />Carte</Link>
            </div>

            <div className={styles.navGroup}>
              <span className={styles.sectionHeader}>Administration</span>
              <Link href="/admin/users" className={styles.navLink}><Users size={15} />Utilisateurs</Link>
              <Link href="/admin/organizations" className={styles.navLink}><Building2 size={15} />Organisations</Link>
              <Link href="/admin/roles" className={styles.navLink}><Lock size={15} />Rôles</Link>
              <Link href="/admin/organization" className={styles.navLink}><Settings size={15} />Organisation</Link>
              <Link href="/admin/api-keys" className={styles.navLink}><KeyRound size={15} />Clés API</Link>
              <Link href="/admin/audit-log" className={styles.navLink}><ScrollText size={15} />Journal audit</Link>
              <Link href="/admin/billing" className={styles.navLink}><CreditCard size={15} />Facturation</Link>
              <Link href="/admin/system-status" className={styles.navLink}><Activity size={15} />Statut système</Link>
            </div>

          </div>
        </nav>

        <AuthProvider>
          <main className={styles.pageContent}>
            {children}
          </main>
        </AuthProvider>
      </div>
    </div>
  );
}
