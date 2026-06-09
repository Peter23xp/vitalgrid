'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Package, Bell, ArrowLeftRight, Thermometer, Map, ScrollText, Building2, Globe2, Briefcase } from 'lucide-react';
import HeroSVG from '@/components/marketing/HeroSVG';
import styles from './page.module.css';

const FEATURES = [
  { icon: <Package size={20} />,        title: 'Inventaire temps réel',           desc: 'Stock par facility, lots avec dates d\'expiration, seuils d\'alerte personnalisables. Mise à jour instantanée à chaque mouvement.' },
  { icon: <ArrowLeftRight size={20} />, title: 'Transferts inter-établissements',  desc: 'Demande, approbation, suivi logistique et confirmation de réception — le tout avec garantie ACID sur chaque transaction.' },
  { icon: <Bell size={20} />,           title: 'Alertes intelligentes',            desc: 'Stock bas, expiration proche, température hors zone. Les alertes critiques remontent en temps réel et déclenchent des actions.' },
  { icon: <Thermometer size={20} />,    title: 'Chaîne du froid IoT',              desc: 'Capteurs connectés via DynamoDB. Graphique de température en continu. Alerte automatique si la plage 2-8°C est dépassée.' },
  { icon: <Map size={20} />,            title: 'Carte régionale',                  desc: 'Visualisation des stocks disponibles par zone géographique. Identifiez les surplus et les pénuries en un coup d\'œil.' },
  { icon: <ScrollText size={20} />,     title: 'Audit trail immuable',             desc: 'Chaque action tracée dans une base append-only. Conformité aux standards OMS, UNICEF et bailleurs de fonds internationaux.' },
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
              { num: '44',   accent: false, label: 'Écrans couverts' },
              { num: '< 2',  accent: true,  label: 'Minutes pour un transfert urgent' },
              { num: 'ACID', accent: true,  label: 'Garantie d\'intégrité DSQL' },
              { num: 'WCAG', accent: false, label: 'AA · Accessibilité inclusive' },
            ].map((s, i) => (
              <div key={i} className={styles.statBox}>
                <div className={`${styles.statNum} ${s.accent ? styles.statNumAccent : ''}`}>{s.num}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      <section id="pricing" className="mk-section">
        <div className="mk-container">
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <span className="mk-label">Tarifs</span>
            <h2 style={{ fontFamily: 'var(--mk-font-display)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: 'var(--mk-navy)' }}>
              Simple et transparent
            </h2>
            <p style={{ fontSize: 16, color: 'var(--mk-slate)', marginTop: 12 }}>
              Commencez gratuitement. Passez à l&apos;échelle quand vous êtes prêt.
            </p>
          </div>
          <div className={styles.pricingGrid}>
            {[
              { plan: 'Freemium', price: 'Gratuit', period: 'Pour toujours', desc: 'Idéal pour les petites structures qui débutent.', features: ['≤ 5 établissements', '≤ 20 utilisateurs', 'Inventaire & transferts', 'Alertes de base'], cta: 'Commencer gratuitement', featured: false },
              { plan: 'Standard', price: '$199', period: 'par mois', desc: 'Pour les réseaux de taille moyenne avec des besoins avancés.', features: ['≤ 50 établissements', 'Utilisateurs illimités', 'Toutes les fonctionnalités', 'Support email prioritaire', 'Exports & API'], cta: 'Demander un accès', featured: true },
              { plan: 'Enterprise', price: 'Sur devis', period: '', desc: 'Pour les ONG et ministères avec des exigences spécifiques.', features: ['Établissements illimités', 'SLA personnalisé', 'SSO SAML / LDAP', 'Support dédié 24/7', 'Formation & onboarding'], cta: 'Contacter l\'équipe', featured: false },
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
