'use client';

import React from 'react';
import countries from 'i18n-iso-countries';
import frLocale from 'i18n-iso-countries/langs/fr.json';

countries.registerLocale(frLocale);

interface Props {
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export default function CountrySelect({ value, onChange, placeholder = 'Sélectionner un pays...', required, className }: Props) {
  const countryList = Object.entries(countries.getNames('fr', { select: 'official' }))
    .sort(([, a], [, b]) => a.localeCompare(b, 'fr'));

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className={className}
    >
      <option value="">{placeholder}</option>
      {countryList.map(([code, name]) => (
        <option key={code} value={code}>{name}</option>
      ))}
    </select>
  );
}
