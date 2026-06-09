'use client';

import React, { useEffect } from 'react';
import { getRegions } from '@/lib/regions';

interface Props {
  countryCode: string;
  value: string;
  onChange: (region: string) => void;
  required?: boolean;
  className?: string;
}

export default function RegionSelect({ countryCode, value, onChange, required, className }: Props) {
  const regions = getRegions(countryCode);

  useEffect(() => {
    onChange('');
  }, [countryCode]);

  if (!regions) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Région / Province / État"
        className={className}
      />
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className={className}
    >
      <option value="">Sélectionner une région...</option>
      {regions.map((r) => (
        <option key={r} value={r}>{r}</option>
      ))}
    </select>
  );
}
