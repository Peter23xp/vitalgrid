import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VitalGrid - Réseau Global de Ressources Critiques",
  description: "Plateforme B2B de Mutualisation et Répartition des Ressources Médicales & Humanitaires",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <main className="animate-fade-in">
          {children}
        </main>
      </body>
    </html>
  );
}
