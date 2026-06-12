import React from 'react';
import Link from 'next/link';
import { ArrowRight, Target, Users, ShieldCheck, Globe2 } from 'lucide-react';

export const metadata = {
  title: 'À propos — VitalGrid',
  description: 'VitalGrid coordonne la redistribution des ressources médicales et humanitaires entre établissements en Afrique subsaharienne.',
};

const VALUES = [
  { icon: Target,      title: 'Mission claire',    desc: 'Zéro ressource critique gaspillée par manque de coordination. Chaque transfert compte.' },
  { icon: ShieldCheck, title: 'Fiabilité absolue',  desc: 'Garantie ACID sur chaque transaction. Les données médicales ne tolèrent aucune approximation.' },
  { icon: Users,       title: 'Centré terrain',     desc: 'Conçu avec et pour les agents terrain, infirmiers et coordinateurs qui opèrent sous pression.' },
  { icon: Globe2,      title: 'Contexte africain',  desc: 'Conçu pour les contraintes réelles : connexions instables, multi-langues, diversité des systèmes.' },
];

const TEAM = [
  { initials: 'PD', name: 'Peter D.', role: 'Fondateur & CTO', bio: 'Ingénieur systèmes distribués. 8 ans dans la logistique humanitaire.' },
  { initials: 'SA', name: 'Sophie A.', role: 'Directrice Produit', bio: 'Ancienne coordinatrice MSF. Conçoit des outils que le terrain utilise vraiment.' },
  { initials: 'MK', name: 'Marc K.', role: 'Lead Ingénierie', bio: 'Infrastructure cloud et sécurité des données médicales sensibles.' },
];

export default function AboutPage() {
  const mono: React.CSSProperties = { fontFamily: 'Fira Code, monospace' };
  const display: React.CSSProperties = { fontFamily: 'Barlow Condensed, sans-serif' };

  return (
    <div style={{ background: '#fff' }}>

      {/* ── Hero ── */}
      <section style={{ background: '#0F172A', padding: 'clamp(120px, 14vw, 180px) 24px clamp(80px, 10vw, 120px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 60% 50%, rgba(5,150,105,0.12) 0%, transparent 70%)' }} />
        <div className="mk-container" style={{ position: 'relative', zIndex: 2 }}>
          <span style={{ ...mono, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#059669', display: 'block', marginBottom: 20 }}>
            À propos
          </span>
          <h1 style={{ ...display, fontSize: 'clamp(48px, 7vw, 88px)', fontWeight: 800, lineHeight: 1.0, textTransform: 'uppercase', color: '#fff', letterSpacing: '-1px', maxWidth: 760, textWrap: 'balance' }}>
            Coordonner pour <span style={{ color: '#059669' }}>sauver</span>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, marginTop: 28, maxWidth: 580 }}>
            VitalGrid est né d&apos;un constat simple : des ressources médicales critiques expirent dans un hôpital pendant qu&apos;un autre en manque à 40 km. La coordination manquait. Nous l&apos;avons construite.
          </p>
        </div>
      </section>

      {/* ── Mission ── */}
      <section style={{ padding: 'clamp(72px, 10vw, 120px) 24px' }}>
        <div className="mk-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 64, alignItems: 'center' }}>
          <div>
            <span style={{ ...mono, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#059669', display: 'block', marginBottom: 16 }}>Notre mission</span>
            <h2 style={{ ...display, fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, textTransform: 'uppercase', color: '#0F172A', lineHeight: 1.05, letterSpacing: '-0.5px', textWrap: 'balance' }}>
              Zéro gaspillage<br />de ressource critique
            </h2>
            <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.8, marginTop: 24 }}>
              En Afrique subsaharienne, jusqu&apos;à 30 % des médicaments et consommables médicaux sont gaspillés non par manque de ressources, mais par manque de visibilité entre établissements. VitalGrid connecte les facilities d&apos;un même réseau pour redistribuer les surplus avant qu&apos;ils expirent.
            </p>
            <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.8, marginTop: 16 }}>
              Nous travaillons avec des hôpitaux de référence, des cliniques communautaires et des ONG dans six pays. Chaque transfert tracé, chaque lot auditable, chaque alerte critique transmise en temps réel.
            </p>
          </div>
          <div style={{ background: '#F8FAFC', borderRadius: 16, padding: 48, border: '1px solid #E2E8F0' }}>
            {[
              { num: '6', label: 'Pays couverts' },
              { num: '44', label: 'Écrans opérationnels' },
              { num: '< 2 min', label: 'Par transfert urgent' },
              { num: '0', label: 'Rupture critique non détectée' },
            ].map((s) => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '16px 0', borderBottom: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: 14, color: '#64748B' }}>{s.label}</span>
                <span style={{ ...display, fontSize: 36, fontWeight: 800, color: '#059669', lineHeight: 1 }}>{s.num}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section style={{ background: '#F8FAFC', padding: 'clamp(72px, 10vw, 120px) 24px' }}>
        <div className="mk-container">
          <span style={{ ...mono, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#059669', display: 'block', marginBottom: 16 }}>Nos valeurs</span>
          <h2 style={{ ...display, fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, textTransform: 'uppercase', color: '#0F172A', letterSpacing: '-0.5px', marginBottom: 48 }}>
            Ce qui guide chaque décision
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', padding: 32 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <Icon size={20} color="#059669" />
                </div>
                <h3 style={{ ...display, fontSize: 20, fontWeight: 700, textTransform: 'uppercase', color: '#0F172A', marginBottom: 10, letterSpacing: '0.2px' }}>{title}</h3>
                <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section style={{ padding: 'clamp(72px, 10vw, 120px) 24px' }}>
        <div className="mk-container">
          <span style={{ ...mono, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#059669', display: 'block', marginBottom: 16 }}>L&apos;équipe</span>
          <h2 style={{ ...display, fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, textTransform: 'uppercase', color: '#0F172A', letterSpacing: '-0.5px', marginBottom: 48 }}>
            Construits par le terrain
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {TEAM.map((m) => (
              <div key={m.name} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', padding: 28, border: '1px solid #E2E8F0', borderRadius: 12 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#0F172A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...display, fontSize: 16, fontWeight: 700 }}>
                  {m.initials}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 15 }}>{m.name}</div>
                  <div style={{ ...mono, fontSize: 11, color: '#059669', letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 3, marginBottom: 8 }}>{m.role}</div>
                  <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>{m.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: '#059669', padding: 'clamp(64px, 8vw, 96px) 24px', textAlign: 'center' }}>
        <div className="mk-container">
          <h2 style={{ ...display, fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, textTransform: 'uppercase', color: '#fff', letterSpacing: '-0.5px', marginBottom: 20 }}>
            Rejoignez le réseau
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 36px' }}>
            Votre organisation coordonne des ressources médicales ? Découvrez comment VitalGrid s&apos;intègre à votre contexte.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#059669', padding: '13px 28px', borderRadius: 8, fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Demander une démo <ArrowRight size={16} />
            </Link>
            <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', padding: '12px 28px', borderRadius: 8, fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: 15 }}>
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
