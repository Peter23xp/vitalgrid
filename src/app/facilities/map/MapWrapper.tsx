'use client';

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

const EMPTY: FacilityPin[] = [];

export default function MapWrapper() {
  return (
    <div style={{ height: '100%' }}>
      <FacilitiesMap
        facilities={EMPTY}
        center={[-1.5, 29.2]}
        zoom={8}
        height="100%"
      />
    </div>
  );
}
