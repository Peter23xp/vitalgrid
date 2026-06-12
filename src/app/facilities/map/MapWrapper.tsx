'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { FacilityPin } from '@/components/FacilitiesMap';

const FacilitiesMap = dynamic(() => import('@/components/FacilitiesMap'), {
  ssr: false,
  loading: () => (
    <div style={{
      height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f0f4f8', color: '#64748B', fontSize: 14,
    }}>
      Chargement de la carte...
    </div>
  ),
});

interface ApiFacility {
  id: string;
  name: string;
  region: string | null;
  lat: number | null;
  lng: number | null;
  status: string;
  org_name?: string;
  tenant_id?: string;
}

export default function MapWrapper() {
  const [pins, setPins] = useState<FacilityPin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/facilities/regional?limit=200', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((res) => {
        const data: ApiFacility[] = res.data ?? [];
        const mapped: FacilityPin[] = data
          .filter((f) => f.lat != null && f.lng != null && isFinite(Number(f.lat)) && isFinite(Number(f.lng)))
          .map((f) => ({
            id:       f.id,
            name:     f.name,
            region:   f.region ?? '',
            lat:      Number(f.lat),
            lng:      Number(f.lng),
            status:   (['critical', 'warning', 'ok', 'offline'].includes(f.status)
                        ? f.status : 'ok') as FacilityPin['status'],
            orgName:  f.org_name,
            tenantId: f.tenant_id,
          }));
        setPins(mapped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Centre auto : moyenne des coordonnées, fallback Afrique centrale
  const center: [number, number] = pins.length
    ? [
        pins.reduce((s, p) => s + p.lat, 0) / pins.length,
        pins.reduce((s, p) => s + p.lng, 0) / pins.length,
      ]
    : [-1.5, 29.2];

  const zoom = pins.length > 1 ? 6 : pins.length === 1 ? 10 : 5;

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      {loading && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(248,250,252,0.8)', fontSize: 14, color: '#64748B',
        }}>
          Chargement des établissements...
        </div>
      )}
      <FacilitiesMap
        facilities={pins}
        center={center}
        zoom={zoom}
        height="100%"
      />
      {!loading && pins.length === 0 && (
        <div style={{
          position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: 'white', borderRadius: 8, padding: '10px 20px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.12)', fontSize: 13, color: '#64748B', zIndex: 500,
        }}>
          Aucun établissement avec coordonnées GPS. Ajoutez des coordonnées lat/lng lors de la création.
        </div>
      )}
    </div>
  );
}
