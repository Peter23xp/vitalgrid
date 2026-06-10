'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const textColor      = scrolled ? '#fff'                    : '#0F172A';
  const textColorMuted = scrolled ? 'rgba(255,255,255,0.75)'  : '#475569';
  const textColorHover = scrolled ? '#fff'                    : '#0F172A';

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? '#0F172A' : '#fff',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
      transition: 'background 0.3s, border-color 0.3s',
    }}>
      <div className="mk-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
        <Link href="/" style={{ fontFamily: 'var(--mk-font-display)', fontSize: 20, fontWeight: 800, color: textColor, letterSpacing: '-0.5px', textDecoration: 'none' }}>
          <span style={{ color: 'var(--mk-sage)' }}>Vital</span>Grid
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="mk-desktop-nav">
          {[
            { href: '#features',  label: 'Fonctionnalités' },
            { href: '#use-cases', label: 'Cas d\'usage' },
            { href: '#pricing',   label: 'Tarifs' },
          ].map((l) => (
            <a key={l.href} href={l.href}
              style={{ color: textColorMuted, fontSize: 14, fontWeight: 500, transition: 'color 0.15s', textDecoration: 'none' }}
              onMouseOver={(e) => (e.currentTarget.style.color = textColorHover)}
              onMouseOut={(e)  => (e.currentTarget.style.color = textColorMuted)}>
              {l.label}
            </a>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="mk-desktop-nav">
          <Link href="/login"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'transparent',
              color: textColor,
              border: `1px solid ${scrolled ? 'rgba(255,255,255,0.3)' : '#CBD5E1'}`,
              padding: '8px 18px', borderRadius: 8,
              fontFamily: 'var(--mk-font-display)', fontWeight: 500, fontSize: 14,
              textDecoration: 'none', transition: 'border-color 0.2s, background 0.2s', whiteSpace: 'nowrap',
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = scrolled ? '#fff' : '#0F172A'; e.currentTarget.style.background = scrolled ? 'rgba(255,255,255,0.08)' : '#F1F5F9'; }}
            onMouseOut={(e)  => { e.currentTarget.style.borderColor = scrolled ? 'rgba(255,255,255,0.3)' : '#CBD5E1'; e.currentTarget.style.background = 'transparent'; }}
          >
            Se connecter
          </Link>
          <Link href="/demo" className="mk-btn-primary" style={{ padding: '9px 20px', fontSize: 14 }}>
            Demander une démo
          </Link>
        </div>

        <button onClick={() => setMenuOpen((v) => !v)} className="mk-mobile-menu-btn" aria-label="Menu"
          style={{ display: 'none', color: textColor, padding: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div style={{ background: '#0F172A', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '16px 24px 24px' }}>
          {[
            { href: '#features',  label: 'Fonctionnalités' },
            { href: '#use-cases', label: 'Cas d\'usage' },
            { href: '#pricing',   label: 'Tarifs' },
          ].map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              style={{ display: 'block', color: 'rgba(255,255,255,0.8)', padding: '12px 0', fontSize: 16, borderBottom: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none' }}>
              {l.label}
            </a>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
            <Link href="/login" style={{ textAlign: 'center', padding: '12px', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, color: '#fff', textDecoration: 'none', fontFamily: 'var(--mk-font-display)', fontWeight: 500 }}>
              Se connecter
            </Link>
            <Link href="/demo" className="mk-btn-primary" style={{ textAlign: 'center', padding: '12px', justifyContent: 'center' }}>
              Demander une démo
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .mk-desktop-nav { display: none !important; }
          .mk-mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
