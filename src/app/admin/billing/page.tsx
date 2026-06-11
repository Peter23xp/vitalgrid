'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Building2, TrendingUp, CreditCard, Users } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface SubRow {
  org_id: string;
  org_name: string;
  country_code: string;
  plan: string;
  status: string;
  mrr_usd_cents: number;
  renewal_at: string | null;
  trial_ends_at: string | null;
  notes: string | null;
  facilitiesCount: number;
  usersCount: number;
  planInfo: { label: string; priceUsd: number };
}

interface BillingData {
  data: SubRow[];
  totalMrr: number;
}

const PLAN_BADGE: Record<string, string> = {
  freemium:   'info',
  standard:   'warning',
  enterprise: 'success',
};

const STATUS_BADGE: Record<string, string> = {
  active:    'success',
  trial:     'warning',
  suspended: 'critical',
  cancelled: 'critical',
};

const STATUS_LABEL: Record<string, string> = {
  active:    'Actif',
  trial:     'Essai',
  suspended: 'Suspendu',
  cancelled: 'Annulé',
};

export default function AdminBillingPage() {
  const [data, setData]       = useState<SubRow[]>([]);
  const [totalMrr, setTotalMrr] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editRow, setEditRow] = useState<SubRow | null>(null);
  const [saving, setSaving]   = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch<BillingData>('/api/admin/billing')
      .then((r) => { setData(r.data); setTotalMrr(r.totalMrr); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!editRow) return;
    setSaving(true);
    try {
      await apiFetch('/api/admin/billing', {
        method: 'PATCH',
        body: JSON.stringify({
          orgId:        editRow.org_id,
          plan:         editRow.plan,
          status:       editRow.status,
          mrrUsdCents:  editRow.mrr_usd_cents,
          renewalAt:    editRow.renewal_at || null,
          notes:        editRow.notes || null,
        }),
      });
      setData((prev) => prev.map((r) => r.org_id === editRow.org_id ? { ...r, ...editRow } : r));
      setEditRow(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  const mrrFormatted = (totalMrr / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const paying  = data.filter((r) => r.plan !== 'freemium').length;
  const active  = data.filter((r) => r.status === 'active').length;

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/dashboard/admin" className={styles.backLink}>← Admin</Link>
          <h1 className={styles.title}>FACTURATION &amp; ABONNEMENTS</h1>
        </div>
      </header>

      {/* KPIs plateforme */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: 'rgba(5,150,105,0.1)', color: 'var(--brand-sage)' }}>
            <TrendingUp size={18} />
          </div>
          <div className={styles.kpiValue}>{loading ? '—' : mrrFormatted}</div>
          <p className={styles.kpiLabel}>MRR total plateforme</p>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: 'rgba(14,165,233,0.1)', color: 'var(--status-info)' }}>
            <Building2 size={18} />
          </div>
          <div className={styles.kpiValue}>{loading ? '—' : data.length}</div>
          <p className={styles.kpiLabel}>Organisations totales</p>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: 'rgba(234,179,8,0.1)', color: 'var(--status-warning)' }}>
            <CreditCard size={18} />
          </div>
          <div className={styles.kpiValue}>{loading ? '—' : paying}</div>
          <p className={styles.kpiLabel}>Abonnements payants</p>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--status-success)' }}>
            <Users size={18} />
          </div>
          <div className={styles.kpiValue}>{loading ? '—' : active}</div>
          <p className={styles.kpiLabel}>Comptes actifs</p>
        </div>
      </div>

      {/* Table organisations × abonnements */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ORGANISATION</th>
              <th>PAYS</th>
              <th>PLAN</th>
              <th>STATUT</th>
              <th>MRR</th>
              <th>FACILITIES</th>
              <th>USERS</th>
              <th>RENOUVELLEMENT</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {!loading && data.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--brand-slate)' }}>
                  <Building2 size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.35 }} />
                  <p style={{ fontSize: 13 }}>Aucune organisation</p>
                </td>
              </tr>
            ) : data.map((row) => (
              <tr key={row.org_id} className={styles.row}>
                <td className={styles.orgName}>{row.org_name}</td>
                <td className="mono" style={{ fontSize: 12, textTransform: 'uppercase' }}>{row.country_code}</td>
                <td>
                  <span className={`badge ${PLAN_BADGE[row.plan] ?? 'info'}`}>
                    {row.planInfo.label}
                  </span>
                </td>
                <td>
                  <span className={`badge ${STATUS_BADGE[row.status] ?? 'info'}`}>
                    {STATUS_LABEL[row.status] ?? row.status}
                  </span>
                </td>
                <td className="mono" style={{ fontSize: 13 }}>
                  {row.mrr_usd_cents > 0
                    ? `$${(row.mrr_usd_cents / 100).toFixed(0)}/mo`
                    : <span style={{ color: 'var(--brand-slate)' }}>—</span>}
                </td>
                <td style={{ textAlign: 'center' }}>{row.facilitiesCount}</td>
                <td style={{ textAlign: 'center' }}>{row.usersCount}</td>
                <td style={{ fontSize: 12, color: 'var(--brand-slate)' }}>
                  {row.renewal_at
                    ? new Date(row.renewal_at).toLocaleDateString('fr-FR')
                    : '—'}
                </td>
                <td>
                  <button className={styles.editBtn} onClick={() => setEditRow({ ...row })}>
                    Modifier
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal edit */}
      {editRow && (
        <div className={styles.modalOverlay} onClick={() => setEditRow(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{editRow.org_name}</h2>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Plan</label>
                <select
                  className="input-field"
                  value={editRow.plan}
                  onChange={(e) => setEditRow({ ...editRow, plan: e.target.value })}
                >
                  <option value="freemium">Freemium — Gratuit</option>
                  <option value="standard">Standard — $199/mois</option>
                  <option value="enterprise">Enterprise — Sur devis</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Statut</label>
                <select
                  className="input-field"
                  value={editRow.status}
                  onChange={(e) => setEditRow({ ...editRow, status: e.target.value })}
                >
                  <option value="active">Actif</option>
                  <option value="trial">Essai</option>
                  <option value="suspended">Suspendu</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>MRR (USD cents)</label>
                <input
                  type="number"
                  className="input-field"
                  value={editRow.mrr_usd_cents}
                  onChange={(e) => setEditRow({ ...editRow, mrr_usd_cents: parseInt(e.target.value) || 0 })}
                />
                <span className={styles.hint}>
                  = ${(editRow.mrr_usd_cents / 100).toFixed(2)}/mois
                </span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Date de renouvellement</label>
                <input
                  type="date"
                  className="input-field"
                  value={editRow.renewal_at ? editRow.renewal_at.slice(0, 10) : ''}
                  onChange={(e) => setEditRow({ ...editRow, renewal_at: e.target.value || null })}
                />
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label className={styles.label}>Notes internes</label>
                <textarea
                  className={`input-field ${styles.textarea}`}
                  value={editRow.notes ?? ''}
                  onChange={(e) => setEditRow({ ...editRow, notes: e.target.value || null })}
                  placeholder="Contact commercial, conditions spéciales..."
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className="btn-secondary" onClick={() => setEditRow(null)}>Annuler</button>
              <button className="btn-primary" disabled={saving} onClick={save}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
