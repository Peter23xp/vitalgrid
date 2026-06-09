import React from 'react';
import Link from 'next/link';

const COL = [
  {
    title: 'Produit',
    links: [
      { href: '#features', label: 'Fonctionnalités' },
      { href: '#pricing',  label: 'Tarifs' },
      { href: '/demo',     label: 'Demander une démo' },
      { href: '/register', label: 'Créer un compte' },
    ],
  },
  {
    title: 'Entreprise',
    links: [
      { href: '#about',   label: 'À propos' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { href: '/legal/cgu',             label: 'Conditions d\'utilisation' },
      { href: '/legal/confidentialite', label: 'Confidentialité' },
    ],
  },
];

export default function MarketingFooter() {
  return (
    <footer style={{ background: '#0F172A', color: 'rgba(255,255,255,0.6)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="mk-container" style={{ padding: '64px 24px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ fontFamily: 'var(--mk-font-display)', fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 12 }}>
              <span style={{ color: 'var(--mk-sage)' }}>Vital</span>Grid
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 280 }}>
              Coordination des ressources médicales et humanitaires entre établissements, en temps réel.
            </p>
          </div>
          {COL.map((col) => (
            <div key={col.title}>
              <p style={{ color: '#fff', fontWeight: 600, fontSize: 13, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: 'var(--mk-font-mono)' }}>
                {col.title}
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', transition: 'color 0.15s' }}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, fontSize: 13 }}>
          © 2026 VitalGrid. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
