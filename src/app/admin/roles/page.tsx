import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const resources = [
  'Inventaire',
  'Transferts',
  'Alertes',
  'Établissements',
  'Analytics',
  'Utilisateurs',
  'Clés API',
  "Journal d'audit",
  'Facturation',
];

type PermSet = { r: boolean; w: boolean; d: boolean; e: boolean };

const matrix: Record<string, Record<string, PermSet>> = {
  'Inventaire':        { 'Super Admin': {r:true,w:true,d:true,e:true},  'Facility Manager': {r:true,w:true,d:false,e:true},  'Field Agent': {r:true,w:true,d:false,e:false},  'NGO Coord.': {r:true,w:false,d:false,e:true},   'Auditor': {r:true,w:false,d:false,e:true} },
  'Transferts':        { 'Super Admin': {r:true,w:true,d:true,e:true},  'Facility Manager': {r:true,w:true,d:false,e:true},  'Field Agent': {r:true,w:true,d:false,e:false},  'NGO Coord.': {r:true,w:false,d:false,e:true},   'Auditor': {r:true,w:false,d:false,e:true} },
  'Alertes':           { 'Super Admin': {r:true,w:true,d:true,e:true},  'Facility Manager': {r:true,w:true,d:false,e:false}, 'Field Agent': {r:true,w:false,d:false,e:false}, 'NGO Coord.': {r:true,w:true,d:false,e:false},   'Auditor': {r:true,w:false,d:false,e:false} },
  'Établissements':    { 'Super Admin': {r:true,w:true,d:true,e:true},  'Facility Manager': {r:true,w:true,d:false,e:true},  'Field Agent': {r:true,w:false,d:false,e:false}, 'NGO Coord.': {r:true,w:false,d:false,e:true},   'Auditor': {r:true,w:false,d:false,e:true} },
  'Analytics':         { 'Super Admin': {r:true,w:true,d:true,e:true},  'Facility Manager': {r:true,w:false,d:false,e:true}, 'Field Agent': {r:false,w:false,d:false,e:false},'NGO Coord.': {r:true,w:false,d:false,e:true},   'Auditor': {r:true,w:false,d:false,e:true} },
  'Utilisateurs':      { 'Super Admin': {r:true,w:true,d:true,e:true},  'Facility Manager': {r:true,w:false,d:false,e:false},'Field Agent': {r:false,w:false,d:false,e:false},'NGO Coord.': {r:false,w:false,d:false,e:false},  'Auditor': {r:true,w:false,d:false,e:true} },
  'Clés API':          { 'Super Admin': {r:true,w:true,d:true,e:true},  'Facility Manager': {r:false,w:false,d:false,e:false},'Field Agent': {r:false,w:false,d:false,e:false},'NGO Coord.': {r:false,w:false,d:false,e:false},  'Auditor': {r:true,w:false,d:false,e:false} },
  "Journal d'audit":   { 'Super Admin': {r:true,w:true,d:true,e:true},  'Facility Manager': {r:false,w:false,d:false,e:false},'Field Agent': {r:false,w:false,d:false,e:false},'NGO Coord.': {r:false,w:false,d:false,e:false},  'Auditor': {r:true,w:false,d:false,e:true} },
  'Facturation':       { 'Super Admin': {r:true,w:true,d:true,e:true},  'Facility Manager': {r:false,w:false,d:false,e:false},'Field Agent': {r:false,w:false,d:false,e:false},'NGO Coord.': {r:false,w:false,d:false,e:false},  'Auditor': {r:true,w:false,d:false,e:false} },
};

const roles = ['Super Admin', 'Facility Manager', 'Field Agent', 'NGO Coord.', 'Auditor'];

function Pill({ active, label }: { active: boolean; label: string }) {
  return active ? (
    <span className={styles.permPill}>{label}</span>
  ) : (
    <span className={styles.permPillOff}>—</span>
  );
}

export default function AdminRolesPage() {
  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/dashboard/admin" className={styles.backLink}>← Admin</Link>
          <h1 className={styles.title}>RÔLES & PERMISSIONS</h1>
        </div>
      </header>

      <p className={styles.subtitle}>Matrice des permissions — modifications en temps réel</p>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.resourceCol}>RESSOURCE</th>
              {roles.map(role => (
                <th key={role} className={styles.roleCol}>{role}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resources.map(resource => (
              <tr key={resource} className={styles.row}>
                <td className={styles.resourceCell}>{resource}</td>
                {roles.map(role => {
                  const perms = matrix[resource]?.[role] ?? {r:false,w:false,d:false,e:false};
                  return (
                    <td key={role} className={styles.permCell}>
                      <div className={styles.permGroup}>
                        <Pill active={perms.r} label="R" />
                        <Pill active={perms.w} label="W" />
                        <Pill active={perms.d} label="D" />
                        <Pill active={perms.e} label="E" />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.legend}>
        <span className={styles.legendItem}><span className={styles.permPill}>R</span> Lecture</span>
        <span className={styles.legendItem}><span className={styles.permPill}>W</span> Écriture</span>
        <span className={styles.legendItem}><span className={styles.permPill}>D</span> Suppression</span>
        <span className={styles.legendItem}><span className={styles.permPill}>E</span> Export</span>
      </div>

      <div className={styles.noteBar}>
        Les modifications sont sauvegardées automatiquement avec confirmation avant validation.
      </div>

      <div className={styles.dangerZone}>
        <button className={styles.resetBtn}>Réinitialiser aux valeurs par défaut</button>
      </div>
    </div>
  );
}
