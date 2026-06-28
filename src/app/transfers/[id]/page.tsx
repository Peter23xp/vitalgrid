'use client';

import React, { useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';
import { Share2, History, Check, Truck, PackageCheck, XCircle, AlertCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Transfer {
  id: string; ref: string; quantity: number; status: string;
  priority: string; is_emergency: boolean; motif: string | null;
  requesting_facility_id: string; source_facility_id: string | null;
  driver_name: string | null; driver_phone: string | null;
  vehicle_ref: string | null; created_at: string; updated_at: string;
  resource_id: string;
  resource_name: string | null;
  resource_unit: string | null;
  resource_category: string | null;
  requesting_facility_name: string | null;
  source_facility_name: string | null;
}

interface Me {
  facilityId: string | null;
  role: string;
}

function TransferActions({ transfer, me, acting, showTransitForm, driverName, driverPhone, vehicleRef,
  onSetShowTransitForm, onSetDriverName, onSetDriverPhone, onSetVehicleRef, onAct, transferId }: {
  transfer: Transfer; me: Me | null; acting: boolean; showTransitForm: boolean;
  driverName: string; driverPhone: string; vehicleRef: string;
  onSetShowTransitForm: (v: boolean) => void;
  onSetDriverName: (v: string) => void;
  onSetDriverPhone: (v: string) => void;
  onSetVehicleRef: (v: string) => void;
  onAct: (status: string, extra?: Record<string, string>) => void;
  transferId: string;
}) {
  // Roles without a fixed facility (ngo_coordinator, super_admin) can do everything
  const noFacilityRoles = ['super_admin', 'ngo_coordinator', 'auditor'];
  const viewerFac = me?.facilityId ?? null;
  const isOmnipotent = !viewerFac || noFacilityRoles.includes(me?.role ?? '');
  const isSource    = isOmnipotent || viewerFac === transfer.source_facility_id;
  const isRequester = isOmnipotent || viewerFac === transfer.requesting_facility_id;

  if (transfer.status === 'pending') return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {isSource && (
        <button className="btn-primary" style={{ flex: 1 }} disabled={acting} onClick={() => onAct('confirmed')}>
          <Check size={14} style={{ marginRight: 6 }} />
          {acting ? 'En cours...' : 'APPROUVER'}
        </button>
      )}
      {isRequester && (
        <button className="btn-outline" style={{ flex: 1, color: 'var(--status-error)', borderColor: 'var(--status-error)' }} disabled={acting} onClick={() => onAct('cancelled')}>
          <XCircle size={14} style={{ marginRight: 6 }} />
          ANNULER MA DEMANDE
        </button>
      )}
      {!isSource && !isRequester && (
        <p style={{ fontSize: 13, color: 'var(--brand-slate)', padding: '12px 0' }}>
          En attente d&apos;approbation par l&apos;établissement source.
        </p>
      )}
    </div>
  );

  if (transfer.status === 'confirmed') {
    if (!isSource) return (
      <p style={{ fontSize: 13, color: 'var(--brand-slate)', padding: '12px 0' }}>
        Transfert approuvé — en attente d&apos;expédition par l&apos;établissement source.
      </p>
    );
    return !showTransitForm ? (
      <button className="btn-primary" style={{ width: '100%', padding: '14px' }} onClick={() => onSetShowTransitForm(true)}>
        <Truck size={14} style={{ marginRight: 6 }} />
        MARQUER EN TRANSIT
      </button>
    ) : (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 10, padding: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Informations transport</p>
        <div style={{ display: 'grid', gap: 10, marginBottom: 12 }}>
          <input className="input-field" placeholder="Nom du chauffeur" value={driverName} onChange={(e) => onSetDriverName(e.target.value)} />
          <input className="input-field" placeholder="Téléphone" value={driverPhone} onChange={(e) => onSetDriverPhone(e.target.value)} />
          <input className="input-field" placeholder="Réf. véhicule (ex: KIN-4521-A)" value={vehicleRef} onChange={(e) => onSetVehicleRef(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-primary" style={{ flex: 1 }} disabled={acting}
            onClick={() => onAct('in_transit', { driver_name: driverName, driver_phone: driverPhone, vehicle_ref: vehicleRef })}>
            <Truck size={14} style={{ marginRight: 6 }} />
            {acting ? 'En cours...' : 'CONFIRMER DÉPART'}
          </button>
          <button className="btn-outline" onClick={() => onSetShowTransitForm(false)}>Annuler</button>
        </div>
      </div>
    );
  }

  if (transfer.status === 'in_transit') {
    if (!isSource) return (
      <p style={{ fontSize: 13, color: 'var(--brand-slate)', padding: '12px 0' }}>
        Transfert en transit — en attente de livraison.
      </p>
    );
    return (
      <button className="btn-primary" style={{ width: '100%', padding: '14px' }} disabled={acting} onClick={() => onAct('delivered')}>
        <PackageCheck size={14} style={{ marginRight: 6 }} />
        {acting ? 'En cours...' : 'MARQUER LIVRÉ'}
      </button>
    );
  }

  if (transfer.status === 'delivered') {
    // Only the requesting facility (destination) confirms receipt
    if (!isRequester) return (
      <p style={{ fontSize: 13, color: 'var(--brand-slate)', padding: '12px 0' }}>
        Livré — en attente de confirmation de réception par l&apos;établissement destinataire.
      </p>
    );
    return (
      <Link href={`/transfers/${transferId}/receive`} className="btn-primary" style={{ display: 'block', textAlign: 'center', padding: '14px' }}>
        CONFIRMER LA RÉCEPTION
      </Link>
    );
  }

  return null;
}

const STATUS_BADGE: Record<string, string> = {
  pending: 'warning', confirmed: 'info', in_transit: 'info',
  delivered: 'warning', completed: 'success', incident: 'critical',
};

export default function TransferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState('');
  const [showTransitForm, setShowTransitForm] = useState(false);
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [vehicleRef, setVehicleRef] = useState('');

  const act = useCallback(async (status: string, extra?: Record<string, string>) => {
    setActing(true);
    setActionError('');
    try {
      await apiFetch(`/api/transfers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, ...extra }),
      });
      // Re-fetch the enriched GET to keep resource/facility names after status change
      const fresh = await apiFetch<Transfer>(`/api/transfers/${id}`);
      setTransfer(fresh);
      setShowTransitForm(false);
    } catch (e: unknown) {
      setActionError((e as Error).message);
    } finally {
      setActing(false);
    }
  }, [id]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    const title = transfer ? `Transfert ${transfer.ref}` : 'Transfert VitalGrid';
    const text = transfer
      ? `Transfert ${transfer.ref} — ${transfer.quantity} unités — ${transfer.status.toUpperCase()}`
      : 'Transfert VitalGrid';

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // user cancelled — do nothing
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [transfer]);

  useEffect(() => {
    Promise.all([
      apiFetch<Transfer>(`/api/transfers/${id}`),
      fetch('/api/auth/me', { credentials: 'same-origin' }).then(r => r.json()),
    ]).then(([t, m]) => {
      setTransfer(t);
      setMe({ facilityId: m.facilityId ?? null, role: m.role ?? '' });
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/transfers" className={styles.backLink}>← Transferts</Link>
          <h1 className={styles.title}>{transfer ? `TRANSFERT ${transfer.ref}` : 'TRANSFERT'}</h1>
        </div>
        <button
          className="btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={handleShare}
        >
          {copied ? <Check size={14} /> : <Share2 size={14} />}
          {copied ? 'Lien copié !' : 'Partager'}
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
          {/* ── En-tête ressource + statut ── */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 10, padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--brand-navy)', marginBottom: 4 }}>
                  {transfer.resource_name ?? '—'}
                </p>
                <p style={{ fontSize: 13, color: 'var(--brand-slate)' }}>
                  {transfer.resource_category} · {transfer.quantity} {transfer.resource_unit ?? 'unités'}
                  {transfer.is_emergency && <span className="badge critical" style={{ marginLeft: 8 }}>URGENCE</span>}
                </p>
              </div>
              <span className={`badge ${STATUS_BADGE[transfer.status] ?? 'info'}`} style={{ fontSize: 12 }}>
                {transfer.status.toUpperCase()}
              </span>
            </div>

            {/* Route source → destination */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', marginBottom: 12 }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: 11, color: 'var(--brand-slate)', marginBottom: 2 }}>SOURCE</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-navy)' }}>{transfer.source_facility_name ?? '—'}</p>
              </div>
              <div style={{ fontSize: 20, color: 'var(--brand-sage)', fontWeight: 700 }}>→</div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: 11, color: 'var(--brand-slate)', marginBottom: 2 }}>DESTINATION</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-navy)' }}>{transfer.requesting_facility_name ?? '—'}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px', fontSize: 13 }}>
              <div><span style={{ color: 'var(--brand-slate)' }}>Priorité</span><br /><strong>{transfer.priority}</strong></div>
              <div><span style={{ color: 'var(--brand-slate)' }}>Créé le</span><br /><strong>{new Date(transfer.created_at).toLocaleString('fr-FR')}</strong></div>
              {transfer.motif && <div style={{ gridColumn: '1/-1' }}><span style={{ color: 'var(--brand-slate)' }}>Motif</span><br /><strong>{transfer.motif}</strong></div>}
            </div>
          </div>

          {/* ── Logistique transport (si disponible) ── */}
          {(transfer.driver_name || transfer.vehicle_ref) && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 10, padding: 20, marginBottom: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--brand-slate)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transport</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px', fontSize: 13 }}>
                {transfer.driver_name && <div><span style={{ color: 'var(--brand-slate)' }}>Chauffeur</span><br /><strong>{transfer.driver_name}</strong></div>}
                {transfer.driver_phone && <div><span style={{ color: 'var(--brand-slate)' }}>Téléphone</span><br /><a href={`tel:${transfer.driver_phone}`} style={{ color: 'var(--brand-sage)' }}>{transfer.driver_phone}</a></div>}
                {transfer.vehicle_ref && <div><span style={{ color: 'var(--brand-slate)' }}>Véhicule</span><br /><strong>{transfer.vehicle_ref}</strong></div>}
              </div>
            </div>
          )}

          {/* ── Actions selon statut ── */}
          {actionError && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--status-error)', borderRadius: 8, padding: '10px 14px', marginBottom: 12, color: 'var(--status-error)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={14} /> {actionError}
            </div>
          )}

          <TransferActions
            transfer={transfer}
            me={me}
            acting={acting}
            showTransitForm={showTransitForm}
            driverName={driverName}
            driverPhone={driverPhone}
            vehicleRef={vehicleRef}
            onSetShowTransitForm={setShowTransitForm}
            onSetDriverName={setDriverName}
            onSetDriverPhone={setDriverPhone}
            onSetVehicleRef={setVehicleRef}
            onAct={act}
            transferId={id}
          />
        </div>
      )}
    </div>
  );
}
