import React from 'react';
import Link from 'next/link';
import { ArrowRight, Package, Bell, ArrowLeftRight, Thermometer, Map, ScrollText } from 'lucide-react';
import styles from './page.module.css';

const SPONSORS = [
  'UNICEF', 'OMS', 'MSF', 'Croix-Rouge', 'USAID', 'GAVI', 'Fonds Mondial',
  'UNFPA', 'OCHA', 'IRC', 'IMC', 'ACF', 'Médecins du Monde',
];

const FEATURES = [
  { photo: '/assets/INVENTAIRE TEMPS RÉEL.jpg',         icon: <Package size={18} />,        title: 'Inventaire temps réel',       desc: 'Stock par facility, lots avec dates d\'expiration, seuils d\'alerte. Chaque mouvement tracé instantanément.' },
  { photo: '/assets/TRANSFERTS INTER-FACILITIES.jpeg',  icon: <ArrowLeftRight size={18} />, title: 'Transferts inter-facilities', desc: 'De la demande à la confirmation de réception — garantie ACID sur chaque transaction de ressource critique.' },
  { photo: '/assets/CHAÎNE DU FROID IOT.jpg',           icon: <Thermometer size={18} />,    title: 'Chaîne du froid IoT',         desc: 'Capteurs connectés, graphique en continu. Alerte automatique si la plage 2-8°C est dépassée.' },
  { photo: '/assets/Alertes intelligentes.jpg',         icon: <Bell size={18} />,           title: 'Alertes intelligentes',       desc: 'Stock bas, expiration proche, anomalie de température. Les alertes critiques remontent en temps réel.' },
  { photo: '/assets/CARTE RÉGIONALE DES STOCKS.jpg',    icon: <Map size={18} />,            title: 'Carte régionale des stocks',  desc: 'Visualisez les surplus et pénuries par zone. Coordonnez les redistributions avant qu\'il soit trop tard.' },
  { photo: '/assets/AUDIT TRAIL IMMUABLE.jpeg',         icon: <ScrollText size={18} />,     title: 'Audit trail immuable',        desc: 'Chaque action tracée en base append-only. Conformité OMS, UNICEF, bailleurs de fonds internationaux.' },
];

const STEPS = [
  { n: '01', tag: 'Inscription',   title: 'Créez votre réseau',          desc: 'Configurez votre organisation, ajoutez vos établissements et invitez vos agents terrain en quelques minutes.' },
  { n: '02', tag: 'Opérations',    title: 'Coordonnez en temps réel',    desc: 'Chaque facility met à jour son stock, déclenche des demandes de transfert et reçoit des alertes automatiques.' },
  { n: '03', tag: 'Résultats',     title: 'Zéro gaspillage',             desc: 'Les ressources critiques trouvent leur destination avant d\'expirer. Chaque mouvement est tracé et auditable.' },
];

const ROLES = [
  { photo: '/assets/Facility Manager.jpg',  tag: 'Facility Manager', title: 'Votre établissement sous contrôle', items: ['Stock en temps réel par département', 'Alertes critiques avant rupture', 'Approbation de transferts en 2 clics', 'Rapports pour les audits'] },
  { photo: '/assets/FIELD AGENT.jpeg',      tag: 'Field Agent',      title: 'Saisie rapide sur le terrain',     items: ['Scanner un lot à la réception', 'Confirmer une livraison avec PIN', 'Signaler une anomalie en secondes', 'Vue critique de sa zone'] },
  { photo: '/assets/NGO COORDINATOR.jpg',   tag: 'NGO Coordinator',  title: 'Vision régionale complète',        items: ['Carte de toutes les facilities', 'Identifier surplus vs pénuries', 'Broadcast d\'urgence régional', 'Rapports bailleurs de fonds'] },
];

const TESTIMONIALS = [
  { text: 'VitalGrid nous a permis de réduire le gaspillage de médicaments de 40%. Les alertes d\'expiration nous donnent le temps de redistribuer avant qu\'il ne soit trop tard.', name: 'Dr. A. M.', role: 'Directeur médical · Hôpital de référence, Goma' },
  { text: 'En tant que coordinatrice régionale, j\'avais besoin d\'une vue d\'ensemble sans dépendre des appels téléphoniques. Maintenant je vois tout sur un seul écran.', name: 'S. K.', role: 'Coordinatrice logistique · ONG internationale' },
  { text: 'L\'audit trail nous a sauvé lors d\'une inspection. Chaque mouvement de médicament traçable jusqu\'au niveau du lot. Conforme à nos obligations de reporting.', name: 'M. B.', role: 'Responsable supply chain · Ministère de la Santé' },
];

export default function LandingPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className="mk-container">
          <div className={styles.heroContent}>
            <div className={styles.heroEyebrow}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', display: 'inline-block' }} />
              Plateforme B2B · Ressources médicales
            </div>
            <h1 className={styles.heroH1}>
              Coordonnez les<br />
              <span className={styles.heroAccent}>ressources critiques</span><br />
              entre vos facilities.
            </h1>
            <p className={styles.heroSub}>
              VitalGrid connecte vos établissements en temps réel pour que chaque poche de sang, vaccin ou médicament critique trouve sa destination avant d&apos;expirer ou de manquer.
            </p>
            <div className={styles.heroCtas}>
              <Link href="/demo" className="mk-btn-primary">
                Demander une démo <ArrowRight size={16} />
              </Link>
              <Link href="/register" className="mk-btn-outline-dark">
                Créer un compte gratuit
              </Link>
            </div>
            <div className={styles.heroStats}>
              {[
                { num: '44',      label: 'Écrans couverts' },
                { num: '< 2min',  label: 'Transfert urgent' },
                { num: 'ACID',    label: 'Intégrité garantie' },
                { num: 'WCAG AA', label: 'Accessibilité' },
              ].map((s) => (
                <div key={s.label} className={styles.heroStat}>
                  <span className={styles.heroStatNum}>{s.num}</span>
                  <span className={styles.heroStatLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section id="features" className="mk-section" style={{ background: '#F8FAFC' }}>
        <div className="mk-container">
          <span className={styles.sectionEyebrow}>Fonctionnalités</span>
          <h2 className={styles.sectionH2}>Tout ce dont votre réseau a besoin</h2>
          <div className={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <img src={f.photo} alt={f.title} className={styles.featurePhoto} loading="lazy" decoding="async" />
                <div className={styles.featureBody}>
                  <div className={styles.featureIcon}>{f.icon}</div>
                  <p className={styles.featureTitle}>{f.title}</p>
                  <p className={styles.featureDesc}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section className="mk-section mk-section-dark">
        <div className="mk-container">
          <span className={styles.sectionEyebrow}>Comment ça marche</span>
          <h2 className={`${styles.sectionH2} ${styles.sectionH2White}`}>Opérationnel en 3 étapes</h2>
          <div className={styles.stepsGrid}>
            {STEPS.map((s) => (
              <div key={s.n} className={styles.stepCard}>
                <span className={styles.stepNum}>{s.n}</span>
                <span className={styles.stepAccent}>{s.tag}</span>
                <p className={styles.stepTitle}>{s.title}</p>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ─────────────────────────────────────────── */}
      <section id="use-cases" className="mk-section" style={{ background: '#fff' }}>
        <div className="mk-container">
          <span className={styles.sectionEyebrow}>Cas d&apos;usage</span>
          <h2 className={styles.sectionH2}>Conçu pour chaque rôle</h2>
          <div className={styles.rolesGrid}>
            {ROLES.map((r, i) => (
              <div key={i} className={styles.roleCard}>
                <img src={r.photo} alt={r.tag} className={styles.rolePhoto} loading="lazy" />
                <div className={styles.roleBody}>
                  <span className={styles.roleTag}>{r.tag}</span>
                  <p className={styles.roleTitle}>{r.title}</p>
                  <ul className={styles.roleList}>
                    {r.items.map((item, j) => <li key={j}>{item}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sponsor Ticker ────────────────────────────────── */}
      <section className={styles.tickerSection}>
        <div className={styles.tickerLabel}>Nos partenaires</div>
        <div className={styles.tickerTrack} aria-hidden="true">
          <div className={styles.tickerList}>
            {SPONSORS.concat(SPONSORS).map((s, i) => (
              <span key={i} className={styles.tickerItem}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <section className="mk-section" style={{ background: '#F8FAFC' }}>
        <div className="mk-container">
          <span className={styles.sectionEyebrow}>Témoignages</span>
          <h2 className={styles.sectionH2}>Ce que disent nos utilisateurs</h2>
          <div className={styles.testimonialsGrid}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className={styles.testimonialCard}>
                <p className={styles.testimonialText}>{t.text}</p>
                <p className={styles.testimonialName}>{t.name}</p>
                <p className={styles.testimonialRole}>{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────── */}
      <section id="pricing" className="mk-section" style={{ background: '#fff' }}>
        <div className="mk-container">
          <span className={styles.sectionEyebrow}>Tarifs</span>
          <h2 className={styles.sectionH2}>Simple et transparent</h2>
          <p style={{ fontSize: 16, color: '#64748B', marginTop: 12 }}>Commencez gratuitement. Passez à l&apos;échelle quand vous êtes prêt.</p>
          <div className={styles.pricingGrid}>
            {[
              { plan: 'Freemium',   price: 'Gratuit',   period: 'Pour toujours', desc: 'Pour les petites structures qui débutent.', features: ['≤ 5 établissements', '≤ 20 utilisateurs', 'Inventaire & transferts', 'Alertes de base'], cta: 'Commencer', featured: false },
              { plan: 'Standard',   price: '$199',       period: '/mois',         desc: 'Pour les réseaux en croissance.', features: ['≤ 50 établissements', 'Utilisateurs illimités', 'Toutes les fonctionnalités', 'Support email prioritaire', 'Exports & API'], cta: 'Demander un accès', featured: true },
              { plan: 'Enterprise', price: 'Sur devis',  period: '',              desc: 'Pour les ONG et ministères.', features: ['Établissements illimités', 'SLA personnalisé', 'SSO SAML / LDAP', 'Support dédié 24/7', 'Formation & onboarding'], cta: 'Nous contacter', featured: false },
            ].map((p, i) => (
              <div key={i} className={`${styles.pricingCard} ${p.featured ? styles.pricingCardFeatured : ''}`}>
                {p.featured && (
                  <div style={{ background: '#059669', color: '#fff', fontSize: 10, fontFamily: 'var(--mk-font-mono)', fontWeight: 700, letterSpacing: '1.5px', textAlign: 'center', padding: '5px', borderRadius: '9px 9px 0 0', margin: '-36px -28px 24px', textTransform: 'uppercase' as const }}>
                    RECOMMANDÉ
                  </div>
                )}
                <p className={styles.pricingPlanTag}>{p.plan}</p>
                <p className={styles.pricingPrice}>{p.price}</p>
                {p.period && <p className={styles.pricingPeriod}>{p.period}</p>}
                <p className={styles.pricingDesc}>{p.desc}</p>
                <ul className={styles.pricingFeatures}>{p.features.map((f, j) => <li key={j}>{f}</li>)}</ul>
                <Link href="/demo" className={p.featured ? 'mk-btn-primary' : 'mk-btn-outline-dark'} style={{ textAlign: 'center', justifyContent: 'center' }}>{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA finale ───────────────────────────────────── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaBg} />
        <div className="mk-container">
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaH2}>
              Prêt à sauver des<br />ressources critiques ?
            </h2>
            <p className={styles.ctaSub}>
              Rejoignez les équipes qui coordonnent leurs stocks médicaux en temps réel.
            </p>
            <div className={styles.ctaCtas}>
              <Link href="/demo" className="mk-btn-primary" style={{ padding: '14px 36px', fontSize: 16 }}>
                Demander une démo <ArrowRight size={18} />
              </Link>
              <Link href="/register" className="mk-btn-outline" style={{ padding: '14px 28px', fontSize: 16 }}>
                Créer un compte gratuit
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
