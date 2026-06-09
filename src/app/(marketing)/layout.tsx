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
