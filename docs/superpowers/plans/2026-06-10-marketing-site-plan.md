# VitalGrid Marketing Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer le site public VitalGrid — landing page professionnelle, formulaire démo, et page d'inscription avec approbation manuelle.

**Architecture:** Route group `(marketing)` isolé du dashboard avec son propre layout (Sora + Noto Sans, navbar sticky, footer). Pages publiques sans auth. SVG animé pour le hero. 2 API routes: demo-request (SendGrid) et access-requests (DSQL + SendGrid).

**Tech Stack:** Next.js 16 App Router, React 19, CSS Modules, Lucide React, Google Fonts (Sora + Noto Sans), DSQL, SendGrid

---

## Task 0 : Structure de base — route group + layout + fonts

**Files:**
- Create: `src/app/(marketing)/layout.tsx`
- Create: `src/app/(marketing)/globals.css`

- [ ] Créer `src/app/(marketing)/globals.css` — tokens marketing (Sora + Noto Sans, palette dark) :

```css
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Noto+Sans:wght@400;500;600&display=swap');

:root {
  --mk-navy:      #0F172A;
  --mk-navy-90:   #1E293B;
  --mk-navy-80:   #334155;
  --mk-sage:      #059669;
  --mk-sage-light:#D1FAE5;
  --mk-white:     #FFFFFF;
  --mk-off-white: #F8FAFC;
  --mk-slate:     #64748B;
  --mk-border:    rgba(255,255,255,0.1);

  --mk-font-display: 'Sora', sans-serif;
  --mk-font-body:    'Noto Sans', sans-serif;
  --mk-font-mono:    'Fira Code', monospace;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--mk-font-body);
  background: var(--mk-white);
  color: var(--mk-navy);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a { color: inherit; text-decoration: none; }
button { cursor: pointer; font-family: var(--mk-font-body); border: none; background: none; }

.mk-btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--mk-sage); color: var(--mk-white);
  padding: 12px 28px; border-radius: 8px;
  font-family: var(--mk-font-display); font-weight: 600; font-size: 15px;
  transition: background 0.2s, transform 0.15s;
  white-space: nowrap;
}
.mk-btn-primary:hover { background: #047857; transform: translateY(-1px); }

.mk-btn-outline {
  display: inline-flex; align-items: center; gap: 8px;
  background: transparent; color: var(--mk-white);
  border: 1px solid rgba(255,255,255,0.3);
  padding: 11px 24px; border-radius: 8px;
  font-family: var(--mk-font-display); font-weight: 500; font-size: 15px;
  transition: border-color 0.2s, background 0.2s;
  white-space: nowrap;
}
.mk-btn-outline:hover { border-color: var(--mk-white); background: rgba(255,255,255,0.08); }

.mk-btn-outline-dark {
  display: inline-flex; align-items: center; gap: 8px;
  background: transparent; color: var(--mk-navy);
  border: 1px solid var(--mk-navy-80);
  padding: 11px 24px; border-radius: 8px;
  font-family: var(--mk-font-display); font-weight: 500; font-size: 15px;
  transition: border-color 0.2s;
}
.mk-btn-outline-dark:hover { border-color: var(--mk-navy); }

.mk-section { padding: 96px 0; }
.mk-section-dark { background: var(--mk-navy); color: var(--mk-white); }
.mk-container { max-width: 1140px; margin: 0 auto; padding: 0 24px; }
.mk-label {
  display: inline-block;
  font-family: var(--mk-font-mono); font-size: 11px; font-weight: 500;
  text-transform: uppercase; letter-spacing: 1.5px;
  color: var(--mk-sage); margin-bottom: 16px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

- [ ] Créer `src/app/(marketing)/layout.tsx` :

```tsx
import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';

export const metadata: Metadata = {
  title: 'VitalGrid — Coordination des ressources médicales en temps réel',
  description: 'Plateforme B2B de mutualisation et redistribution des ressources médicales et humanitaires entre établissements. Stock bas, transferts, alertes — tout coordonné.',
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <MarketingNav />
        {children}
        <MarketingFooter />
      </body>
    </html>
  );
}
```

- [ ] Build check : `npm run build`

---

## Task 1 : MarketingNav + MarketingFooter

**Files:**
- Create: `src/components/marketing/MarketingNav.tsx`
- Create: `src/components/marketing/MarketingFooter.tsx`

- [ ] Créer `src/components/marketing/MarketingNav.tsx` :

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function MarketingNav() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

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
```

- [ ] Créer `src/components/marketing/MarketingFooter.tsx` :

```tsx
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
                    <Link href={l.href} style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', transition: 'color 0.15s' }}
                      onMouseOver={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
                      onMouseOut={(e: React.MouseEvent<HTMLAnchorElement>)  => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}>
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
      <style>{`
        @media (max-width: 768px) {
          footer .mk-container > div:first-child > div { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
```

- [ ] Build check : `npm run build`
- [ ] Commit :

```bash
git add src/app/\(marketing\)/ src/components/marketing/
git commit -m "feat: marketing layout + nav + footer (Sora/Noto, dark navy)"
```

---

## Task 2 : HeroSVG — schéma réseau animé

**Files:**
- Create: `src/components/marketing/HeroSVG.tsx`

- [ ] Créer `src/components/marketing/HeroSVG.tsx` :

```tsx
'use client';

import React, { useEffect, useRef } from 'react';

interface Node { x: number; y: number; label: string; critical?: boolean; }

const NODES: Node[] = [
  { x: 50,  y: 30,  label: 'HGR Goma',    critical: true },
  { x: 200, y: 80,  label: 'CS Masisi',   critical: true },
  { x: 350, y: 25,  label: 'Clinique A' },
  { x: 480, y: 90,  label: 'CBCA Goma' },
  { x: 130, y: 160, label: 'Hôpital B' },
  { x: 320, y: 150, label: 'CS Walikale' },
];

const TRANSFERS = [
  { from: 2, to: 0 }, // Clinique A → HGR Goma (critique)
  { from: 3, to: 1 }, // CBCA Goma → CS Masisi (critique)
  { from: 4, to: 0 }, // Hôpital B → HGR Goma
];

export default function HeroSVG() {
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    pathRefs.current.forEach((p, i) => {
      if (!p) return;
      const len = p.getTotalLength();
      p.style.strokeDasharray  = String(len);
      p.style.strokeDashoffset = String(len);
      p.style.animation = `drawPath 1.5s ease-out ${0.3 + i * 0.4}s forwards`;
    });
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: 580 }}>
      <style>{`
        @keyframes drawPath {
          to { stroke-dashoffset: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; r: 8; }
          50%       { opacity: 0.6; r: 10; }
        }
        @keyframes fadeDot {
          from { opacity: 0; transform: scale(0); }
          to   { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-svg-path { animation: none !important; stroke-dashoffset: 0 !important; }
        }
      `}</style>
      <svg viewBox="0 0 540 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {/* Transfer arcs */}
        {TRANSFERS.map((t, i) => {
          const from = NODES[t.from];
          const to   = NODES[t.to];
          const mx   = (from.x + to.x) / 2;
          const my   = Math.min(from.y, to.y) - 40;
          const d    = `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`;
          return (
            <path
              key={i}
              ref={(el) => { pathRefs.current[i] = el; }}
              className="hero-svg-path"
              d={d}
              stroke="#059669"
              strokeWidth={1.5}
              strokeOpacity={0.7}
              strokeDasharray="4 3"
            />
          );
        })}

        {/* Nodes */}
        {NODES.map((node, i) => (
          <g key={i} style={{ animation: `fadeDot 0.4s ease-out ${0.1 + i * 0.15}s both` }}>
            <circle
              cx={node.x} cy={node.y} r={node.critical ? 9 : 7}
              fill={node.critical ? '#EF4444' : '#059669'}
              opacity={0.9}
              style={node.critical ? { animation: 'pulse 2s ease-in-out infinite' } : {}}
            />
            <circle cx={node.x} cy={node.y} r={node.critical ? 16 : 13}
              fill={node.critical ? 'rgba(239,68,68,0.15)' : 'rgba(5,150,105,0.12)'}
            />
            <text x={node.x} y={node.y + 26}
              fill="rgba(255,255,255,0.65)"
              fontSize={9}
              fontFamily="var(--mk-font-mono)"
              textAnchor="middle"
            >
              {node.label}
            </text>
          </g>
        ))}

        {/* Legend */}
        <g transform="translate(400, 160)">
          <circle cx={8} cy={8} r={5} fill="#EF4444" opacity={0.9} />
          <text x={18} y={12} fill="rgba(255,255,255,0.5)" fontSize={9} fontFamily="var(--mk-font-mono)">Stock critique</text>
          <circle cx={8} cy={26} r={5} fill="#059669" opacity={0.9} />
          <text x={18} y={30} fill="rgba(255,255,255,0.5)" fontSize={9} fontFamily="var(--mk-font-mono)">Surplus disponible</text>
        </g>
      </svg>
    </div>
  );
}
```

- [ ] Build check : `npm run build`

---

## Task 3 : Landing page — toutes les sections

**Files:**
- Create: `src/app/(marketing)/page.tsx`
- Create: `src/app/(marketing)/page.module.css`

- [ ] Créer `src/app/(marketing)/page.module.css` :

```css
/* Hero */
.hero {
  min-height: 100vh;
  background: var(--mk-navy);
  display: flex;
  align-items: center;
  padding: 120px 0 80px;
  position: relative;
  overflow: hidden;
}
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 60% at 70% 50%, rgba(5,150,105,0.08) 0%, transparent 70%);
  pointer-events: none;
}
.heroGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
}
.heroTag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(5,150,105,0.12);
  border: 1px solid rgba(5,150,105,0.3);
  color: #34D399;
  font-family: var(--mk-font-mono);
  font-size: 11px;
  letter-spacing: 1px;
  padding: 5px 14px;
  border-radius: 20px;
  margin-bottom: 24px;
}
.heroHeadline {
  font-family: var(--mk-font-display);
  font-size: clamp(36px, 5vw, 64px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -1px;
  color: #fff;
  margin-bottom: 20px;
  text-wrap: balance;
}
.heroAccent { color: var(--mk-sage); }
.heroSub {
  font-size: 18px;
  color: rgba(255,255,255,0.65);
  line-height: 1.7;
  margin-bottom: 36px;
  max-width: 520px;
}
.heroCtas { display: flex; gap: 14px; flex-wrap: wrap; }

/* Problem section */
.problemGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
}
.problemCard {
  padding: 48px;
  background: var(--mk-navy-90);
}
.problemCard:first-child { border-radius: 12px 0 0 12px; }
.problemCard:last-child  { border-radius: 0 12px 12px 0; }
.problemIcon {
  width: 44px; height: 44px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 20px;
}
.problemTitle {
  font-family: var(--mk-font-display);
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 20px;
}
.problemList { list-style: none; display: flex; flex-direction: column; gap: 12px; }
.problemList li {
  display: flex; align-items: flex-start; gap: 10px;
  font-size: 14px; color: rgba(255,255,255,0.65); line-height: 1.5;
}
.problemList li::before { content: '—'; color: #EF4444; flex-shrink: 0; }

/* Features */
.featuresGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 48px;
}
.featureCard {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 28px;
  transition: box-shadow 0.2s, transform 0.2s;
}
.featureCard:hover { box-shadow: 0 8px 32px rgba(15,23,42,0.1); transform: translateY(-2px); }
.featureIcon {
  width: 44px; height: 44px;
  background: rgba(5,150,105,0.08);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: var(--mk-sage);
  margin-bottom: 16px;
}
.featureTitle {
  font-family: var(--mk-font-display);
  font-size: 16px; font-weight: 700;
  color: var(--mk-navy); margin-bottom: 8px;
}
.featureDesc { font-size: 14px; color: var(--mk-slate); line-height: 1.6; }

/* Use cases tabs */
.tabsBar { display: flex; border-bottom: 1px solid #E2E8F0; margin-bottom: 40px; }
.tab {
  padding: 12px 24px; font-size: 14px; font-weight: 500;
  color: var(--mk-slate); border-bottom: 2px solid transparent;
  margin-bottom: -1px; cursor: pointer; background: none;
  font-family: var(--mk-font-display); transition: color 0.15s;
}
.tab:hover { color: var(--mk-navy); }
.tabActive { color: var(--mk-navy); border-bottom-color: var(--mk-sage); font-weight: 600; }
.tabContent { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
.useCaseList { list-style: none; display: flex; flex-direction: column; gap: 16px; }
.useCaseItem { display: flex; gap: 14px; }
.useCaseNum {
  width: 28px; height: 28px; border-radius: 50%;
  background: rgba(5,150,105,0.1); color: var(--mk-sage);
  font-family: var(--mk-font-mono); font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.useCaseText { font-size: 14px; color: #334155; line-height: 1.6; }

/* Stats */
.statsGrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2px;
  margin-top: 64px;
}
.statBox {
  padding: 40px 32px;
  background: rgba(255,255,255,0.04);
  text-align: center;
}
.statNum {
  font-family: var(--mk-font-display);
  font-size: clamp(40px, 5vw, 64px);
  font-weight: 800;
  color: #fff;
  line-height: 1;
  margin-bottom: 8px;
}
.statNumAccent { color: var(--mk-sage); }
.statLabel { font-size: 13px; color: rgba(255,255,255,0.5); font-family: var(--mk-font-mono); }

/* Testimonials */
.testimonialsGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 48px;
}
.testimonialCard {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 28px;
}
.testimonialQuote { font-size: 15px; color: #334155; line-height: 1.7; font-style: italic; margin-bottom: 20px; }
.testimonialAuthor { font-size: 13px; font-weight: 600; color: var(--mk-navy); }
.testimonialRole { font-size: 12px; color: var(--mk-slate); margin-top: 2px; }

/* Pricing */
.pricingGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 48px;
}
.pricingCard {
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 36px 28px;
  display: flex; flex-direction: column;
  transition: box-shadow 0.2s;
}
.pricingCard:hover { box-shadow: 0 8px 32px rgba(15,23,42,0.08); }
.pricingCardFeatured {
  border-color: var(--mk-sage);
  background: linear-gradient(to bottom, rgba(5,150,105,0.04), #fff);
}
.pricingPlan { font-family: var(--mk-font-display); font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--mk-sage); margin-bottom: 8px; }
.pricingPrice { font-family: var(--mk-font-display); font-size: 40px; font-weight: 800; color: var(--mk-navy); line-height: 1; margin-bottom: 4px; }
.pricingPeriod { font-size: 13px; color: var(--mk-slate); margin-bottom: 20px; }
.pricingDesc { font-size: 14px; color: var(--mk-slate); line-height: 1.6; margin-bottom: 24px; }
.pricingFeatures { list-style: none; display: flex; flex-direction: column; gap: 10px; flex: 1; margin-bottom: 28px; }
.pricingFeatures li { display: flex; gap: 10px; font-size: 14px; color: #334155; }
.pricingFeatures li::before { content: '✓'; color: var(--mk-sage); font-weight: 700; flex-shrink: 0; }

/* CTA section */
.ctaSection {
  background: var(--mk-navy);
  text-align: center;
  padding: 96px 0;
}
.ctaHeadline {
  font-family: var(--mk-font-display);
  font-size: clamp(32px, 4vw, 52px);
  font-weight: 800;
  color: #fff;
  margin-bottom: 16px;
  text-wrap: balance;
}
.ctaSub { font-size: 18px; color: rgba(255,255,255,0.6); margin-bottom: 36px; }

/* Responsive */
@media (max-width: 900px) {
  .heroGrid, .problemGrid, .tabContent, .testimonialsGrid, .pricingGrid { grid-template-columns: 1fr !important; }
  .problemCard:first-child { border-radius: 12px 12px 0 0; }
  .problemCard:last-child  { border-radius: 0 0 12px 12px; }
  .statsGrid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 640px) {
  .featuresGrid { grid-template-columns: 1fr; }
  .statsGrid { grid-template-columns: 1fr 1fr; }
}
```

- [ ] Créer `src/app/(marketing)/page.tsx` :

```tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Package, Bell, ArrowLeftRight, Thermometer, Map, ScrollText, Building2, Globe2, Briefcase } from 'lucide-react';
import HeroSVG from '@/components/marketing/HeroSVG';
import styles from './page.module.css';

const FEATURES = [
  { icon: <Package size={20} />,       title: 'Inventaire temps réel',          desc: 'Stock par facility, lots avec dates d\'expiration, seuils d\'alerte personnalisables. Mise à jour instantanée à chaque mouvement.' },
  { icon: <ArrowLeftRight size={20} />, title: 'Transferts inter-établissements', desc: 'Demande, approbation, suivi logistique et confirmation de réception — le tout avec garantie ACID sur chaque transaction.' },
  { icon: <Bell size={20} />,           title: 'Alertes intelligentes',          desc: 'Stock bas, expiration proche, température hors zone. Les alertes critiques remontent en temps réel et déclenchent des actions.' },
  { icon: <Thermometer size={20} />,    title: 'Chaîne du froid IoT',            desc: 'Capteurs connectés via DynamoDB. Graphique de température en continu. Alerte automatique si la plage 2-8°C est dépassée.' },
  { icon: <Map size={20} />,            title: 'Carte régionale',                desc: 'Visualisation des stocks disponibles par zone géographique. Identificez les surplus et les pénuries en un coup d\'œil.' },
  { icon: <ScrollText size={20} />,     title: 'Audit trail immuable',           desc: 'Chaque action tracée dans une base append-only. Conformité aux standards OMS, UNICEF et bailleurs de fonds internationaux.' },
];

const USE_CASES = {
  facility_manager: {
    icon: <Building2 size={20} />,
    label: 'Facility Manager',
    role: 'Directeur médical ou responsable logistique d\'un établissement',
    items: [
      'Consulter le stock de chaque département en temps réel',
      'Recevoir une alerte quand le sang O- passe sous le seuil critique',
      'Déclencher un transfert depuis un établissement surplus en 2 clics',
      'Approuver les demandes entrantes et suivre l\'ETA de livraison',
    ],
  },
  field_agent: {
    icon: <Briefcase size={20} />,
    label: 'Field Agent',
    role: 'Infirmier, pharmacien ou agent logistique terrain',
    items: [
      'Scanner un article à la réception pour mettre à jour le stock immédiatement',
      'Signaler un lot endommagé ou une anomalie de température',
      'Confirmer la réception d\'un transfert avec photo et signature PIN',
      'Voir les ressources critiques de sa zone d\'un seul écran',
    ],
  },
  ngo_coordinator: {
    icon: <Globe2 size={20} />,
    label: 'NGO Coordinator',
    role: 'Coordinateur régional supervisant plusieurs facilities',
    items: [
      'Vue carte de toutes les facilities avec leur statut stock en temps réel',
      'Identifier les surplus qui peuvent couvrir les pénuries critiques à 100 km',
      'Lancer un broadcast d\'urgence régional en cas de pénurie critique',
      'Générer des rapports d\'efficacité des transferts pour les bailleurs',
    ],
  },
};

const TESTIMONIALS = [
  { quote: 'VitalGrid nous a permis de réduire le gaspillage de médicaments de 40%. Les alertes d\'expiration nous donnent le temps de redistribuer avant qu\'il ne soit trop tard.', name: 'Dr. A. M.', role: 'Directeur médical, Hôpital de référence, Goma' },
  { quote: 'En tant que coordinatrice régionale, j\'avais besoin d\'une vue d\'ensemble sans dépendre des appels téléphoniques. Maintenant je vois tout sur un seul écran.', name: 'S. K.', role: 'Coordinatrice logistique, ONG internationale' },
  { quote: 'L\'audit trail nous a sauvé lors d\'une inspection. Chaque mouvement de médicament traçable jusqu\'au niveau du lot. Conforme à nos obligations de reporting.', name: 'M. B.', role: 'Responsable supply chain, Ministère de la Santé' },
];

type RoleKey = 'facility_manager' | 'field_agent' | 'ngo_coordinator';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<RoleKey>('facility_manager');
  const activeCase = USE_CASES[activeTab];

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="mk-container">
          <div className={styles.heroGrid}>
            <div>
              <div className={styles.heroTag}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34D399', display: 'inline-block' }} />
                Plateforme B2B · Ressources médicales
              </div>
              <h1 className={styles.heroHeadline}>
                Coordonnez les ressources{' '}
                <span className={styles.heroAccent}>médicales critiques</span>{' '}
                entre vos établissements.
              </h1>
              <p className={styles.heroSub}>
                VitalGrid connecte vos facilities en temps réel pour que chaque ressource critique trouve sa destination avant d&apos;expirer ou de manquer.
              </p>
              <div className={styles.heroCtas}>
                <Link href="/demo" className="mk-btn-primary">
                  Demander une démo <ArrowRight size={16} />
                </Link>
                <a href="#features" className="mk-btn-outline">
                  Découvrir la plateforme
                </a>
              </div>
            </div>
            <HeroSVG />
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="mk-section mk-section-dark">
        <div className="mk-container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="mk-label">Le problème</span>
            <h2 style={{ fontFamily: 'var(--mk-font-display)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: '#fff' }}>
              Deux problèmes. Une solution.
            </h2>
          </div>
          <div className={styles.problemGrid}>
            <div className={styles.problemCard}>
              <div className={styles.problemIcon} style={{ background: 'rgba(239,68,68,0.12)' }}>
                <Building2 size={20} color="#EF4444" />
              </div>
              <p className={styles.problemTitle}>Pour les hôpitaux &amp; cliniques</p>
              <ul className={styles.problemList}>
                <li>Le stock critique est découvert trop tard, souvent lors d&apos;une urgence</li>
                <li>Des médicaments expirent en entrepôt pendant que d&apos;autres manquent</li>
                <li>Les transferts se négocient par téléphone, sans traçabilité</li>
                <li>Aucune visibilité sur les stocks des autres établissements du réseau</li>
              </ul>
            </div>
            <div className={styles.problemCard}>
              <div className={styles.problemIcon} style={{ background: 'rgba(14,165,233,0.12)' }}>
                <Globe2 size={20} color="#0EA5E9" />
              </div>
              <p className={styles.problemTitle}>Pour les ONG &amp; coordinateurs</p>
              <ul className={styles.problemList}>
                <li>Aucune visibilité inter-facilities en temps réel sur la région</li>
                <li>Les décisions de redistribution se prennent sans données fiables</li>
                <li>L&apos;audit trail est inexistant, impossible de rendre compte aux bailleurs</li>
                <li>La chaîne du froid des vaccins n&apos;est pas monitorée en continu</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mk-section" style={{ background: 'var(--mk-off-white)' }}>
        <div className="mk-container">
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <span className="mk-label">Fonctionnalités</span>
            <h2 style={{ fontFamily: 'var(--mk-font-display)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: 'var(--mk-navy)' }}>
              Tout ce dont votre réseau a besoin
            </h2>
          </div>
          <div className={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <p className={styles.featureTitle}>{f.title}</p>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section id="use-cases" className="mk-section">
        <div className="mk-container">
          <div style={{ marginBottom: 40 }}>
            <span className="mk-label">Cas d&apos;usage</span>
            <h2 style={{ fontFamily: 'var(--mk-font-display)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: 'var(--mk-navy)' }}>
              Conçu pour chaque rôle
            </h2>
          </div>
          <div className={styles.tabsBar}>
            {(Object.keys(USE_CASES) as RoleKey[]).map((key) => (
              <button key={key} className={`${styles.tab} ${activeTab === key ? styles.tabActive : ''}`} onClick={() => setActiveTab(key)}>
                {USE_CASES[key].label}
              </button>
            ))}
          </div>
          <div className={styles.tabContent}>
            <div>
              <p style={{ fontSize: 13, color: 'var(--mk-slate)', marginBottom: 24, fontFamily: 'var(--mk-font-mono)' }}>{activeCase.role}</p>
              <ul className={styles.useCaseList}>
                {activeCase.items.map((item, i) => (
                  <li key={i} className={styles.useCaseItem}>
                    <span className={styles.useCaseNum}>{i + 1}</span>
                    <p className={styles.useCaseText}>{item}</p>
                  </li>
                ))}
              </ul>
              <Link href="/demo" className="mk-btn-primary" style={{ marginTop: 32, display: 'inline-flex' }}>
                Voir une démo <ArrowRight size={16} />
              </Link>
            </div>
            <div style={{ background: 'var(--mk-navy)', borderRadius: 16, padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280 }}>
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13, fontFamily: 'var(--mk-font-mono)' }}>
                {activeCase.icon}
                <p style={{ marginTop: 12 }}>Screenshot {activeCase.label}</p>
                <p style={{ marginTop: 4, fontSize: 11 }}>disponible en démo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mk-section mk-section-dark">
        <div className="mk-container">
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <span className="mk-label">La plateforme</span>
            <h2 style={{ fontFamily: 'var(--mk-font-display)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: '#fff' }}>
              Conçue pour la production
            </h2>
          </div>
          <div className={styles.statsGrid}>
            {[
              { num: '44',     accent: false, label: 'Écrans couverts'               },
              { num: '< 2',    accent: true,  label: 'Minutes pour un transfert urgent' },
              { num: 'ACID',   accent: true,  label: 'Garantie d\'intégrité DSQL'    },
              { num: 'WCAG',   accent: false, label: 'AA · Accessibilité inclusive'  },
            ].map((s, i) => (
              <div key={i} className={styles.statBox}>
                <div className={`${styles.statNum} ${s.accent ? styles.statNumAccent : ''}`}>{s.num}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mk-section" style={{ background: 'var(--mk-off-white)' }}>
        <div className="mk-container">
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <span className="mk-label">Témoignages</span>
            <h2 style={{ fontFamily: 'var(--mk-font-display)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: 'var(--mk-navy)' }}>
              Ce que disent nos utilisateurs
            </h2>
          </div>
          <div className={styles.testimonialsGrid}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className={styles.testimonialCard}>
                <p className={styles.testimonialQuote}>&ldquo;{t.quote}&rdquo;</p>
                <p className={styles.testimonialAuthor}>{t.name}</p>
                <p className={styles.testimonialRole}>{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mk-section">
        <div className="mk-container">
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <span className="mk-label">Tarifs</span>
            <h2 style={{ fontFamily: 'var(--mk-font-display)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: 'var(--mk-navy)' }}>
              Simple et transparent
            </h2>
            <p style={{ fontSize: 16, color: 'var(--mk-slate)', marginTop: 12, marginBottom: 0 }}>
              Commencez gratuitement. Passez à l&apos;échelle quand vous êtes prêt.
            </p>
          </div>
          <div className={styles.pricingGrid}>
            {[
              {
                plan: 'Freemium', price: 'Gratuit', period: 'Pour toujours',
                desc: 'Idéal pour les petites structures qui débutent.',
                features: ['≤ 5 établissements', '≤ 20 utilisateurs', 'Inventaire & transferts', 'Alertes de base'],
                cta: 'Commencer gratuitement', featured: false,
              },
              {
                plan: 'Standard', price: '$199', period: 'par mois',
                desc: 'Pour les réseaux de taille moyenne avec des besoins avancés.',
                features: ['≤ 50 établissements', 'Utilisateurs illimités', 'Toutes les fonctionnalités', 'Support email prioritaire', 'Exports & API'],
                cta: 'Demander un accès', featured: true,
              },
              {
                plan: 'Enterprise', price: 'Sur devis', period: '',
                desc: 'Pour les ONG et ministères avec des exigences spécifiques.',
                features: ['Établissements illimités', 'SLA personnalisé', 'SSO SAML / LDAP', 'Support dédié 24/7', 'Formation & onboarding'],
                cta: 'Contacter l\'équipe', featured: false,
              },
            ].map((p, i) => (
              <div key={i} className={`${styles.pricingCard} ${p.featured ? styles.pricingCardFeatured : ''}`}>
                {p.featured && <div style={{ background: 'var(--mk-sage)', color: '#fff', fontSize: 11, fontFamily: 'var(--mk-font-mono)', fontWeight: 700, letterSpacing: '1px', textAlign: 'center', padding: '5px', borderRadius: '8px 8px 0 0', margin: '-36px -28px 24px', textTransform: 'uppercase' }}>Recommandé</div>}
                <p className={styles.pricingPlan}>{p.plan}</p>
                <p className={styles.pricingPrice}>{p.price}</p>
                {p.period && <p className={styles.pricingPeriod}>{p.period}</p>}
                <p className={styles.pricingDesc}>{p.desc}</p>
                <ul className={styles.pricingFeatures}>
                  {p.features.map((f, j) => <li key={j}>{f}</li>)}
                </ul>
                <Link href="/demo" className={p.featured ? 'mk-btn-primary' : 'mk-btn-outline-dark'} style={{ textAlign: 'center', justifyContent: 'center' }}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className={styles.ctaSection}>
        <div className="mk-container">
          <h2 className={styles.ctaHeadline}>
            Prêt à coordonner vos ressources médicales&nbsp;?
          </h2>
          <p className={styles.ctaSub}>
            Rejoignez les équipes qui sauvent des ressources critiques chaque jour.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/demo" className="mk-btn-primary" style={{ padding: '14px 32px', fontSize: 16 }}>
              Demander une démo <ArrowRight size={18} />
            </Link>
            <Link href="/register" className="mk-btn-outline" style={{ padding: '14px 28px', fontSize: 16 }}>
              Créer un compte
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
```

- [ ] Build check : `npm run build`
- [ ] Commit :

```bash
git add src/app/\(marketing\)/page.tsx src/app/\(marketing\)/page.module.css src/components/marketing/HeroSVG.tsx
git commit -m "feat: marketing landing page — hero, problem, features, use cases, pricing, CTA"
```

---

## Task 4 : Pages /demo et /register + API routes

**Files:**
- Create: `src/app/(marketing)/demo/page.tsx`
- Create: `src/app/api/demo-request/route.ts`
- Create: `src/app/(marketing)/register/page.tsx`
- Create: `src/app/api/access-requests/route.ts`
- Create: `scripts/migrate-access-requests.ts`

- [ ] Créer `src/app/(marketing)/demo/page.tsx` :

```tsx
'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import CountrySelect from '@/components/CountrySelect';

export default function DemoPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', org: '', country: '', facilities: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting'); setError('');
    try {
      const res = await fetch('/api/demo-request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Erreur'); }
      setStatus('success');
    } catch (e: unknown) { setError((e as Error).message); setStatus('error'); }
  };

  const inputStyle = { width: '100%', height: 42, background: '#fff', border: '1px solid #E2E8F0', color: '#0F172A', padding: '0 14px', borderRadius: 8, fontSize: 14, fontFamily: 'var(--mk-font-body)' };
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 6, fontFamily: 'var(--mk-font-display)' };

  if (status === 'success') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', background: 'var(--mk-off-white)' }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <CheckCircle2 size={56} color="#059669" style={{ margin: '0 auto 20px' }} />
          <h1 style={{ fontFamily: 'var(--mk-font-display)', fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>Demande envoyée !</h1>
          <p style={{ fontSize: 16, color: '#64748B', lineHeight: 1.7 }}>
            L&apos;équipe VitalGrid vous contactera sous <strong>48h</strong> pour planifier votre démo personnalisée.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--mk-off-white)', padding: '120px 24px 80px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>
          <span style={{ fontFamily: 'var(--mk-font-mono)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#059669' }}>Démo</span>
          <h1 style={{ fontFamily: 'var(--mk-font-display)', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#0F172A', marginTop: 8 }}>
            Demandez votre démo personnalisée
          </h1>
          <p style={{ fontSize: 16, color: '#64748B', marginTop: 12, lineHeight: 1.7 }}>
            Un membre de l&apos;équipe VitalGrid vous contacte sous 48h pour une démonstration adaptée à votre contexte.
          </p>
        </div>

        {status === 'error' && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid #EF4444', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#EF4444', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: '40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><label style={labelStyle}>Prénom *</label><input type="text" style={inputStyle} required value={form.firstName} onChange={set('firstName')} /></div>
            <div><label style={labelStyle}>Nom *</label><input type="text" style={inputStyle} required value={form.lastName} onChange={set('lastName')} /></div>
          </div>
          <div><label style={labelStyle}>Email professionnel *</label><input type="email" style={inputStyle} required value={form.email} onChange={set('email')} placeholder="vous@organisation.org" /></div>
          <div><label style={labelStyle}>Organisation *</label><input type="text" style={inputStyle} required value={form.org} onChange={set('org')} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Pays *</label>
              <CountrySelect value={form.country} onChange={(v) => setForm((f) => ({ ...f, country: v }))} required className="" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Nombre d&apos;établissements</label>
              <select style={inputStyle} value={form.facilities} onChange={set('facilities')}>
                <option value="">Sélectionner...</option>
                <option value="1-5">1 à 5</option>
                <option value="6-20">6 à 20</option>
                <option value="21-50">21 à 50</option>
                <option value="50+">Plus de 50</option>
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Message (optionnel)</label>
            <textarea style={{ ...inputStyle, height: 100, padding: '10px 14px', resize: 'vertical' }} value={form.message} onChange={set('message')} placeholder="Décrivez votre contexte ou vos besoins spécifiques..." />
          </div>
          <button type="submit" className="mk-btn-primary" disabled={status === 'submitting'} style={{ justifyContent: 'center', padding: '14px' }}>
            {status === 'submitting' ? 'Envoi en cours...' : 'Envoyer la demande →'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] Créer `src/app/api/demo-request/route.ts` (créer le répertoire) :

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { firstName, lastName, email, org, country, facilities, message } = await req.json();
  if (!firstName || !lastName || !email || !org || !country) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
  }

  const apiKey = process.env.SENDGRID_API_KEY;
  const from   = process.env.EMAIL_FROM ?? 'noreply@vitalgrid.io';

  if (!apiKey) return NextResponse.json({ error: 'SendGrid non configuré' }, { status: 500 });

  const body = {
    personalizations: [{ to: [{ email: 'admin@vitalgrid.io' }] }],
    from:    { email: from, name: 'VitalGrid' },
    subject: `[Démo] ${firstName} ${lastName} — ${org}`,
    content: [{
      type: 'text/plain',
      value: `Nouvelle demande de démo\n\nNom: ${firstName} ${lastName}\nEmail: ${email}\nOrganisation: ${org}\nPays: ${country}\nFacilities: ${facilities || 'Non précisé'}\n\nMessage:\n${message || '—'}`,
    }],
  };

  const r = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method:  'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  if (!r.ok) {
    console.error('SendGrid error:', await r.text());
    return NextResponse.json({ error: 'Erreur d\'envoi email' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] Créer `src/app/(marketing)/register/page.tsx` :

```tsx
'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import CountrySelect from '@/components/CountrySelect';

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', org: '', role: '', country: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting'); setError('');
    try {
      const res = await fetch('/api/access-requests', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Erreur'); }
      setStatus('success');
    } catch (e: unknown) { setError((e as Error).message); setStatus('error'); }
  };

  const inputStyle = { width: '100%', height: 42, background: '#fff', border: '1px solid #E2E8F0', color: '#0F172A', padding: '0 14px', borderRadius: 8, fontSize: 14, fontFamily: 'var(--mk-font-body)' };
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 6, fontFamily: 'var(--mk-font-display)' };

  if (status === 'success') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', background: 'var(--mk-off-white)' }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <CheckCircle2 size={56} color="#059669" style={{ margin: '0 auto 20px' }} />
          <h1 style={{ fontFamily: 'var(--mk-font-display)', fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>Demande envoyée !</h1>
          <p style={{ fontSize: 16, color: '#64748B', lineHeight: 1.7 }}>
            L&apos;équipe VitalGrid examinera votre demande et vous contactera sous <strong>48h</strong> pour activer votre compte.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--mk-off-white)', padding: '120px 24px 80px' }}>
      <div style={{ maxWidth: 580, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>
          <span style={{ fontFamily: 'var(--mk-font-mono)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#059669' }}>Accès</span>
          <h1 style={{ fontFamily: 'var(--mk-font-display)', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#0F172A', marginTop: 8 }}>
            Demander l&apos;accès à VitalGrid
          </h1>
          <p style={{ fontSize: 15, color: '#64748B', marginTop: 12, lineHeight: 1.7 }}>
            L&apos;accès est soumis à approbation pour garantir la qualité du réseau. L&apos;équipe VitalGrid vous contactera sous 48h.
          </p>
        </div>

        {status === 'error' && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid #EF4444', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#EF4444', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: '40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><label style={labelStyle}>Prénom *</label><input type="text" style={inputStyle} required value={form.firstName} onChange={set('firstName')} /></div>
            <div><label style={labelStyle}>Nom *</label><input type="text" style={inputStyle} required value={form.lastName} onChange={set('lastName')} /></div>
          </div>
          <div><label style={labelStyle}>Email professionnel *</label><input type="email" style={inputStyle} required value={form.email} onChange={set('email')} placeholder="vous@organisation.org" /></div>
          <div><label style={labelStyle}>Organisation *</label><input type="text" style={inputStyle} required value={form.org} onChange={set('org')} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Rôle *</label>
              <select style={inputStyle} required value={form.role} onChange={set('role')}>
                <option value="">Sélectionner...</option>
                <option value="facility_manager">Facility Manager</option>
                <option value="ngo_coordinator">NGO Coordinator</option>
                <option value="directeur_medical">Directeur médical</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Pays *</label>
              <CountrySelect value={form.country} onChange={(v) => setForm((f) => ({ ...f, country: v }))} required className="" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Message (optionnel)</label>
            <textarea style={{ ...inputStyle, height: 80, padding: '10px 14px', resize: 'vertical' }} value={form.message} onChange={set('message')} placeholder="Décrivez votre organisation ou vos besoins..." />
          </div>
          <button type="submit" className="mk-btn-primary" disabled={status === 'submitting'} style={{ justifyContent: 'center', padding: '14px' }}>
            {status === 'submitting' ? 'Envoi en cours...' : 'Demander l\'accès →'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] Créer `src/app/api/access-requests/route.ts` (créer le répertoire) :

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { transact } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { firstName, lastName, email, org, role, country, message } = await req.json();
  if (!firstName || !lastName || !email || !org || !role || !country) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
  }

  try {
    await transact(async (client) => {
      await client.query(
        `INSERT INTO access_requests (first_name, last_name, email, organization, role, country_code, message)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [firstName, lastName, email, org, role, country, message || null]
      );
    });

    // Notifier l'admin par email
    const apiKey = process.env.SENDGRID_API_KEY;
    const from   = process.env.EMAIL_FROM ?? 'noreply@vitalgrid.io';

    if (apiKey) {
      await fetch('https://api.sendgrid.com/v3/mail/send', {
        method:  'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          personalizations: [{ to: [{ email: 'admin@vitalgrid.io' }] }],
          from:    { email: from, name: 'VitalGrid' },
          subject: `[Accès] ${firstName} ${lastName} — ${org}`,
          content: [{
            type: 'text/plain',
            value: `Nouvelle demande d'accès\n\nNom: ${firstName} ${lastName}\nEmail: ${email}\nOrganisation: ${org}\nRôle: ${role}\nPays: ${country}\n\nMessage:\n${message || '—'}`,
          }],
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error('access-requests error:', (e as Error).message);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
```

- [ ] Créer `scripts/migrate-access-requests.ts` :

```typescript
import { DsqlSigner } from '@aws-sdk/dsql-signer';
import { Client } from 'pg';

const ENDPOINT = process.env.DSQL_CLUSTER_ENDPOINT!;
const REGION   = process.env.DSQL_REGION ?? 'us-east-1';

async function run() {
  const signer = new DsqlSigner({ hostname: ENDPOINT, region: REGION });
  const token  = await signer.getDbConnectAdminAuthToken();
  const client = new Client({ host: ENDPOINT, port: 5432, database: 'postgres', user: 'admin', password: token, ssl: { rejectUnauthorized: true } });
  await client.connect();
  console.log('Connected to Aurora DSQL');

  const ddl = [
    `CREATE TABLE IF NOT EXISTS access_requests (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      first_name   VARCHAR(100) NOT NULL,
      last_name    VARCHAR(100) NOT NULL,
      email        VARCHAR(150) NOT NULL,
      organization VARCHAR(150) NOT NULL,
      role         VARCHAR(50)  NOT NULL,
      country_code VARCHAR(2)   NOT NULL,
      message      TEXT,
      status       VARCHAR(20)  NOT NULL DEFAULT 'pending',
      created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )`,
    `CREATE INDEX ASYNC IF NOT EXISTS idx_access_requests_status ON access_requests(status)`,
    `CREATE INDEX ASYNC IF NOT EXISTS idx_access_requests_created ON access_requests(created_at)`,
  ];

  for (const sql of ddl) {
    const label = sql.match(/(TABLE|INDEX\s+ASYNC\s+IF NOT EXISTS)\s+(?:IF NOT EXISTS\s+)?(\w+)/)?.[2] ?? '?';
    try { await client.query(sql); console.log(`  ✓ ${label}`); }
    catch (e: unknown) { console.error(`  ✗ ${label}: ${(e as Error).message}`); }
  }

  await client.end();
  console.log('\n✅ Migration access_requests complete\n');
}

run().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] Lancer la migration :

```bash
npx tsx --env-file=.env.local scripts/migrate-access-requests.ts
```

Résultat attendu :
```
Connected to Aurora DSQL
  ✓ access_requests
  ✓ idx_access_requests_status
  ✓ idx_access_requests_created

✅ Migration access_requests complete
```

- [ ] Build check final : `npm run build`
- [ ] Commit :

```bash
git add src/app/\(marketing\)/demo/ src/app/\(marketing\)/register/ src/app/api/demo-request/ src/app/api/access-requests/ scripts/migrate-access-requests.ts
git commit -m "feat: demo + register pages with DSQL storage and SendGrid notifications"
```
