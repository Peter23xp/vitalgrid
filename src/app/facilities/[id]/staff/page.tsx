import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default async function StaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href={`/facilities/${id}`} className={styles.backLink}>← Établissement</Link>
          <h1 className={styles.title}>GESTION DU PERSONNEL</h1>
        </div>
        <div className={styles.headerActions}>
          <button className="btn-primary">+ Inviter un agent</button>
        </div>
      </header>

      <div className={styles.summary}>
        8 agents · <span className={styles.pendingCount}>1 invitation en attente</span>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>NOM</th>
              <th>EMAIL</th>
              <th>RÔLE</th>
              <th>ZONE</th>
              <th>STATUT</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--brand-slate)' }}>
                <p style={{ fontSize: 13 }}>Aucun agent configuré</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.inviteCard}>
        <h3 className={styles.inviteTitle}>Inviter un agent</h3>
        <form className={styles.inviteForm}>
          <div className={styles.inviteField}>
            <label className={styles.label}>Email *</label>
            <input type="email" className="input-field" placeholder="agent@etablissement.cd" required />
          </div>
          <div className={styles.inviteField}>
            <label className={styles.label}>Rôle *</label>
            <select className={`input-field ${styles.select}`} required>
              <option value="">Sélectionner...</option>
              <option value="field-agent">Field Agent</option>
              <option value="facility-manager">Facility Manager</option>
              <option value="ngo-coordinator">NGO Coordinator</option>
            </select>
          </div>
          <div className={styles.inviteField}>
            <label className={styles.label}>Zone</label>
            <select className={`input-field ${styles.select}`}>
              <option value="">Sélectionner...</option>
              <option value="urgences">Urgences</option>
              <option value="pharmacie">Pharmacie</option>
              <option value="banque-sang">Banque de Sang</option>
              <option value="toutes">Toutes</option>
            </select>
          </div>
          <div className={styles.inviteAction}>
            <button type="button" className="btn-primary">Envoyer invitation</button>
          </div>
        </form>
      </div>
    </div>
  );
}
