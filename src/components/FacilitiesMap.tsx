'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';

export type FacilityPin = {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  status: 'critical' | 'warning' | 'ok' | 'offline';
  shortages?: number;
  lastSync?: string;
  orgName?: string;
  tenantId?: string;
};

const STATUS_COLOR: Record<FacilityPin['status'], string> = {
  critical: '#EF4444',
  warning:  '#EAB308',
  ok:       '#22C55E',
  offline:  '#94A3B8',
};

function makePinIcon(color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="38" viewBox="0 0 28 38">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 24 14 24S28 23.333 28 14C28 6.268 21.732 0 14 0z"
            fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="14" cy="14" r="5" fill="white"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [28, 38],
    iconAnchor: [14, 38],
    popupAnchor: [0, -40],
  });
}

function RecenterMap({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (isFinite(center[0]) && isFinite(center[1])) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);
  return null;
}

type Props = {
  facilities: FacilityPin[];
  center?: [number, number];
  zoom?: number;
  height?: string;
};

export default function FacilitiesMap({
  facilities,
  center = [-1.5, 29.2],
  zoom = 8,
  height = '100%',
}: Props) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterMap center={center} zoom={zoom} />

      {facilities.map((f) => (
        <Marker
          key={f.id}
          position={[f.lat, f.lng]}
          icon={makePinIcon(STATUS_COLOR[f.status])}
        >
          <Popup>
            <div style={{ minWidth: 180, fontFamily: 'DM Sans, sans-serif', fontSize: 13 }}>
              <p style={{ fontWeight: 700, marginBottom: 4, color: '#0F172A' }}>{f.name}</p>
              {f.orgName && (
                <p style={{ color: '#059669', fontSize: 11, fontWeight: 600, marginBottom: 2 }}>{f.orgName}</p>
              )}
              <p style={{ color: '#64748B', marginBottom: 6, fontSize: 12 }}>{f.region}</p>
              {f.shortages !== undefined && f.shortages > 0 && (
                <p style={{ color: STATUS_COLOR[f.status], fontWeight: 600, marginBottom: 4 }}>
                  {f.shortages} pénurie{f.shortages > 1 ? 's' : ''}
                </p>
              )}
              {f.status === 'ok' && (
                <p style={{ color: '#22C55E', fontWeight: 600, marginBottom: 4 }}>Aucune alerte</p>
              )}
              {f.status === 'offline' && (
                <p style={{ color: '#94A3B8', fontWeight: 600, marginBottom: 4 }}>Hors-ligne</p>
              )}
              {f.lastSync && (
                <p style={{ color: '#94A3B8', fontSize: 11, marginBottom: 8 }}>
                  Sync : {f.lastSync}
                </p>
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Link
                  href={`/facilities/${f.id}`}
                  style={{ fontSize: 12, color: '#059669', fontWeight: 600, textDecoration: 'none' }}
                >
                  Voir détails
                </Link>
                <Link
                  href={`/transfers/new?sourceFacilityId=${f.id}`}
                  style={{ fontSize: 12, color: '#0EA5E9', fontWeight: 600, textDecoration: 'none' }}
                >
                  Demander →
                </Link>
                <Link
                  href={`/transfers/broadcast?facilityId=${f.id}`}
                  style={{ fontSize: 12, color: '#EF4444', fontWeight: 600, textDecoration: 'none' }}
                >
                  Broadcast
                </Link>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {facilities.length === 0 && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', pointerEvents: 'none', zIndex: 1000,
          background: 'rgba(255,255,255,0.7)',
        }}>
          <p style={{ fontSize: 14, color: '#64748B' }}>Aucun établissement à afficher</p>
        </div>
      )}
    </MapContainer>
  );
}
