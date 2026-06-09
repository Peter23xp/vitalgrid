'use client';

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

const EMPTY: StockPoint[] = [];

export default function StockMapWrapper() {
  return (
    <div style={{ height: '100%' }}>
      <StockMap
        points={EMPTY}
        resourceLabel="unités"
        center={[-1.5, 29.2]}
        zoom={8}
        height="100%"
      />
    </div>
  );
}
