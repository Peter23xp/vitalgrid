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
      <head>
        {/* Preconnect before font requests — eliminates FOUT delay */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600&family=Fira+Code:wght@400;500&display=swap"
        />
        {/* Preload hero background image — eliminates flash on first paint */}
        <link rel="preload" as="image" href="/assets/Facility Manager.jpg" />
      </head>
      <body>
        <MarketingNav />
        {children}
        <MarketingFooter />
      </body>
    </html>
  );
}
