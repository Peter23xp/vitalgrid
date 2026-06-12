'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
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
      <Marker position={[lat, lng]} icon={makePinIcon(color)}>
        <Popup>
          <div style={{ minWidth: 160, fontFamily: 'DM Sans, sans-serif', fontSize: 13 }}>
            <p style={{ fontWeight: 700, marginBottom: 4, color: '#0F172A' }}>{name}</p>
            {region && <p style={{ color: '#64748B', fontSize: 12 }}>{region}</p>}
            <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
              {Number(lat).toFixed(4)}, {Number(lng).toFixed(4)}
            </p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
