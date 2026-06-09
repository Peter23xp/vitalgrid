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

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? '#0F172A' : 'transparent',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
      transition: 'background 0.3s, border-color 0.3s',
    }}>
      <div className="mk-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
        <Link href="/" style={{ fontFamily: 'var(--mk-font-display)', fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
          <span style={{ color: 'var(--mk-sage)' }}>Vital</span>Grid
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="mk-desktop-nav">
          {[
            { href: '#features',  label: 'Fonctionnalités' },
            { href: '#use-cases', label: 'Cas d\'usage' },
            { href: '#pricing',   label: 'Tarifs' },
          ].map((l) => (
            <a key={l.href} href={l.href} style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: 500, transition: 'color 0.15s' }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseOut={(e)  => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}>
              {l.label}
            </a>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="mk-desktop-nav">
          <Link href="/login" className="mk-btn-outline" style={{ padding: '8px 18px', fontSize: 14 }}>Se connecter</Link>
          <Link href="/demo" className="mk-btn-primary" style={{ padding: '9px 20px', fontSize: 14 }}>Demander une démo</Link>
        </div>

        <button onClick={() => setMenuOpen((v) => !v)} className="mk-mobile-menu-btn" aria-label="Menu"
          style={{ display: 'none', color: '#fff', padding: 8 }}>
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
              style={{ display: 'block', color: 'rgba(255,255,255,0.8)', padding: '12px 0', fontSize: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {l.label}
            </a>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
            <Link href="/login" className="mk-btn-outline" style={{ textAlign: 'center', padding: '12px' }}>Se connecter</Link>
            <Link href="/demo" className="mk-btn-primary" style={{ textAlign: 'center', padding: '12px', justifyContent: 'center' }}>Demander une démo</Link>
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
