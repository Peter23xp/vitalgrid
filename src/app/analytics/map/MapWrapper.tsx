'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { StockPoint } from '@/components/StockMap';

const StockMap = dynamic(() => import('@/components/StockMap'), {
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
}

export default function StockMapWrapper() {
  const [points, setPoints] = useState<StockPoint[]>([]);
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    fetch('/api/facilities?limit=200', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((res) => {
        const data: ApiFacility[] = res.data ?? [];
        const mapped: StockPoint[] = data
          .filter((f) => f.lat != null && f.lng != null && isFinite(Number(f.lat)) && isFinite(Number(f.lng)))
          .map((f) => ({
            id:     f.id,
            name:   f.name,
            lat:    Number(f.lat),
            lng:    Number(f.lng),
            stock:  0,
            status: f.status === 'critical' ? 'critical'
                  : f.status === 'warning'  ? 'warning'
                  : 'ok',
          }));
        setPoints(mapped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const center: [number, number] = points.length
    ? [
        points.reduce((s, p) => s + p.lat, 0) / points.length,
        points.reduce((s, p) => s + p.lng, 0) / points.length,
      ]
    : [-1.5, 29.2];

  const zoom = points.length > 1 ? 6 : points.length === 1 ? 10 : 5;

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
      <StockMap
        points={points}
        resourceLabel="unités en stock"
        center={center}
        zoom={zoom}
        height="100%"
      />
      {!loading && points.length === 0 && (
        <div style={{
          position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: 'white', borderRadius: 8, padding: '10px 20px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.12)', fontSize: 13, color: '#64748B', zIndex: 500,
        }}>
          Aucun établissement avec coordonnées GPS. Ajoutez des coordonnées lors de la création.
        </div>
      )}
    </div>
  );
}
