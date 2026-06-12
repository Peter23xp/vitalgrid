'use client';

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type Props = {
  lat: number;
  lng: number;
  name: string;
  region?: string | null;
  status?: string;
  height?: string;
};

const statusColor = (s?: string) => {
  if (s === 'critical') return '#EF4444';
  if (s === 'warning')  return '#EAB308';
  if (s === 'offline')  return '#94A3B8';
  return '#22C55E';
};

export default function FacilityMiniMap({ lat, lng, name, region, status, height = '280px' }: Props) {
  const color = statusColor(status);
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={13}
      style={{ height, width: '100%', borderRadius: 12 }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CircleMarker
        center={[lat, lng]}
        radius={14}
        pathOptions={{ color, fillColor: color, fillOpacity: 0.85, weight: 2 }}
      >
        <Popup>
          <div style={{ minWidth: 160, fontFamily: 'DM Sans, sans-serif', fontSize: 13 }}>
            <p style={{ fontWeight: 700, marginBottom: 4, color: '#0F172A' }}>{name}</p>
            {region && <p style={{ color: '#64748B', fontSize: 12 }}>{region}</p>}
            <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
              {lat.toFixed(4)}, {lng.toFixed(4)}
            </p>
          </div>
        </Popup>
      </CircleMarker>
    </MapContainer>
  );
}
