'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export type StockPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  stock: number;
  status: 'critical' | 'warning' | 'ok';
  orgName?: string;
};

const STATUS_COLOR: Record<StockPoint['status'], string> = {
  critical: '#EF4444',
  warning:  '#EAB308',
  ok:       '#22C55E',
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
  points: StockPoint[];
  resourceLabel?: string;
  center?: [number, number];
  zoom?: number;
  height?: string;
};

export default function StockMap({
  points,
  resourceLabel = 'unités',
  center = [-1.5, 29.2],
  zoom = 8,
  height = '400px',
}: Props) {
  const maxStock = Math.max(...points.map((p) => p.stock), 1);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: '100%', borderRadius: 8 }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterMap center={center} zoom={zoom} />

      {points.map((p) => {
        return (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={makePinIcon(STATUS_COLOR[p.status])}
          >
            <Popup>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, minWidth: 160 }}>
                <p style={{ fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{p.name}</p>
                {p.orgName && (
                  <p style={{ color: '#059669', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{p.orgName}</p>
                )}
                <p style={{ color: STATUS_COLOR[p.status], fontWeight: 600 }}>
                  {p.stock} {resourceLabel}
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {points.length === 0 && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', pointerEvents: 'none', zIndex: 1000,
          background: 'rgba(255,255,255,0.7)',
        }}>
          <p style={{ fontSize: 14, color: '#64748B' }}>Aucune donnée de stock à afficher</p>
        </div>
      )}
    </MapContainer>
  );
}
