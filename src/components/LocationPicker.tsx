'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Search } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface LocationPickerProps {
  lat?: number;
  lng?: number;
  address?: string;
  onLocationChange: (lat: number, lng: number, address: string) => void;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) { onMapClick(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

export default function LocationPicker({ lat, lng, address, onLocationChange }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    lat && lng ? [lat, lng] : null
  );
  const [search, setSearch]   = useState(address ?? '');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'fr' } }
      );
      const data = await res.json();
      const addr = data.display_name ?? '';
      setSearch(addr);
      onLocationChange(lat, lng, addr);
    } catch {
      onLocationChange(lat, lng, '');
    }
  }, [onLocationChange]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setPosition([lat, lng]);
    reverseGeocode(lat, lng);
  }, [reverseGeocode]);

  const handleSearchChange = (q: string) => {
    setSearch(q);
    clearTimeout(debounceRef.current);
    if (q.length < 3) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`,
          { headers: { 'Accept-Language': 'fr' } }
        );
        setResults(await res.json());
      } catch { setResults([]); }
    }, 500);
  };

  const selectResult = (r: NominatimResult) => {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    setPosition([lat, lng]);
    setSearch(r.display_name);
    setResults([]);
    onLocationChange(lat, lng, r.display_name);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ position: 'relative' }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-slate)', pointerEvents: 'none' }} />
        <input
          type="text"
          className="input-field"
          style={{ paddingLeft: 36 }}
          placeholder="Rechercher une adresse..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        {results.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 8, zIndex: 1000, boxShadow: 'var(--shadow-md)', maxHeight: 200, overflowY: 'auto' }}>
            {results.map((r, i) => (
              <button key={i} type="button" onClick={() => selectResult(r)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: 13, borderBottom: '1px solid var(--border-light)', background: 'none', cursor: 'pointer' }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-main)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
              >
                {r.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <MapContainer
        center={position ?? [-2, 28]}
        zoom={position ? 13 : 5}
        style={{ height: 280, borderRadius: 8, border: '1px solid var(--border-light)' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onMapClick={handleMapClick} />
        {position && <Marker position={position} />}
      </MapContainer>
      <p style={{ fontSize: 11, color: 'var(--brand-slate)' }}>Cliquez sur la carte ou recherchez une adresse pour définir la localisation</p>
    </div>
  );
}
