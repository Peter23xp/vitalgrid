'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export type StockPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  stock: number;
  status: 'critical' | 'warning' | 'ok';
};

const STATUS_COLOR: Record<StockPoint['status'], string> = {
  critical: '#EF4444',
  warning:  '#EAB308',
  ok:       '#22C55E',
};

function RecenterMap({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom); }, [map, center, zoom]);
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
        const radius = 8 + Math.round((p.stock / maxStock) * 24);
        return (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={radius}
            pathOptions={{
              color: STATUS_COLOR[p.status],
              fillColor: STATUS_COLOR[p.status],
              fillOpacity: 0.7,
              weight: 2,
            }}
          >
            <Popup>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, minWidth: 160 }}>
                <p style={{ fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{p.name}</p>
                <p style={{ color: STATUS_COLOR[p.status], fontWeight: 600 }}>
                  {p.stock} {resourceLabel}
                </p>
              </div>
            </Popup>
          </CircleMarker>
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
