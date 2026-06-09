'use client';

import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('./LocationPicker'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 300, background: '#f0f4f8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#64748B' }}>
      Chargement de la carte...
    </div>
  ),
});

export default LocationPicker;
export type { LocationPickerProps } from './LocationPicker';
