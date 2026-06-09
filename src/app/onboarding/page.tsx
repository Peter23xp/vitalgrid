'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ChevronRight } from 'lucide-react';
import CountrySelect from '@/components/CountrySelect';
import RegionSelect from '@/components/RegionSelect';
import LocationPickerWrapper from '@/components/LocationPickerWrapper';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

type Step = 1 | 2;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep]           = useState<Step>(1);
  const [error, setError]         = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [orgId, setOrgId]         = useState('');
  const [orgName, setOrgName]     = useState('');
  const [orgType, setOrgType]     = useState('');
  const [orgCountry, setOrgCountry] = useState('');

  const [facName, setFacName]     = useState('');
  const [facType, setFacType]     = useState('');
  const [facCountry, setFacCountry] = useState('');
  const [facRegion, setFacRegion] = useState('');
  const [address, setAddress]     = useState('');
  const [lat, setLat]             = useState<number | undefined>();
  const [lng, setLng]             = useState<number | undefined>();
  const [contactName, setContact] = useState('');
  const [phone, setPhone]         = useState('');
  const [email, setEmail]         = useState('');

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !orgType || !orgCountry) { setError('Tous les champs obligatoires sont requis'); return; }
    setSubmitting(true); setError('');
    try {
      const org = await apiFetch<{ id: string }>('/api/organizations', {
        method: 'POST',
        body: JSON.stringify({ name: orgName, type: orgType, country_code: orgCountry }),
      });
      setOrgId(org.id);
      setFacCountry(orgCountry);
      setStep(2);
    } catch (e: unknown) { setError((e as Error).message); }
    finally { setSubmitting(false); }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facName || !facType || !facCountry || !contactName || !phone) { setError('Tous les champs obligatoires sont requis'); return; }
    setSubmitting(true); setError('');
    try {
      const facility = await apiFetch<{ id: string }>('/api/facilities', {
        method: 'POST',
        body: JSON.stringify({
          org_id:        orgId,
          name:          facName,
          type:          facType,
          country_code:  facCountry,
          region:        facRegion || null,
          address:       address || null,
          lat:           lat ?? null,
          lng:           lng ?? null,
          contact_name:  contactName,
          contact_phone: phone,
          contact_email: email || null,
        }),
      });
      await apiFetch('/api/users/me/facility', {
        method: 'PATCH',
        body: JSON.stringify({ facilityId: facility.id }),
      });
      router.push('/dashboard');
    } catch (e: unknown) { setError((e as Error).message); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 600, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg)', padding: '2.5rem' }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: 24, fontWeight: 700, color: 'var(--brand-navy)', marginBottom: 8 }}>
            <span style={{ color: 'var(--brand-sage)' }}>Vital</span>Grid
          </h1>
          <p style={{ color: 'var(--brand-slate)', fontSize: 14 }}>Configuration de votre espace de travail</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
          {([{ n: 1, label: 'Organisation' }, { n: 2, label: 'Établissement' }] as const).map(({ n, label }, i) => (
            <React.Fragment key={n}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: step >= n ? 'var(--brand-navy)' : 'var(--bg-main)', border: `2px solid ${step >= n ? 'var(--brand-navy)' : 'var(--border-light)'}`, color: step >= n ? 'white' : 'var(--brand-slate)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{n}</div>
                <span style={{ fontSize: 11, color: step >= n ? 'var(--brand-navy)' : 'var(--brand-slate)', fontWeight: step >= n ? 600 : 400 }}>{label}</span>
              </div>
              {i < 1 && <div style={{ flex: 1, height: 2, background: step > 1 ? 'var(--brand-navy)' : 'var(--border-light)', margin: '0 12px', marginBottom: 20 }} />}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--status-error)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, color: 'var(--status-error)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--brand-navy)', marginBottom: 4 }}>Votre organisation</h2>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--brand-navy)', marginBottom: 6 }}>Nom de l&apos;organisation *</label>
              <input type="text" className="input-field" placeholder="Ex: Organisation humanitaire" required value={orgName} onChange={(e) => setOrgName(e.target.value)} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--brand-navy)', marginBottom: 6 }}>Type *</label>
              <select className="input-field" required value={orgType} onChange={(e) => setOrgType(e.target.value)}>
                <option value="">Sélectionner...</option>
                <option value="ong">ONG Humanitaire</option>
                <option value="hopital">Hôpital-réseau</option>
                <option value="distributeur">Distributeur</option>
                <option value="gouvernement">Gouvernement</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--brand-navy)', marginBottom: 6 }}>Pays principal *</label>
              <CountrySelect value={orgCountry} onChange={setOrgCountry} required className="input-field" />
            </div>

            <button type="submit" className="btn-primary" disabled={submitting} style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {submitting ? 'Création...' : <><span>Continuer</span><ChevronRight size={16} /></>}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--brand-navy)', marginBottom: 4 }}>Votre établissement principal</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--brand-navy)', marginBottom: 6 }}>Nom de l&apos;établissement *</label>
                <input type="text" className="input-field" placeholder="Ex: Hôpital Général de Référence" required value={facName} onChange={(e) => setFacName(e.target.value)} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--brand-navy)', marginBottom: 6 }}>Type *</label>
                <select className="input-field" required value={facType} onChange={(e) => setFacType(e.target.value)}>
                  <option value="">Sélectionner...</option>
                  <option value="Hôpital">Hôpital</option>
                  <option value="Clinique">Clinique</option>
                  <option value="Centre de Santé">Centre de Santé</option>
                  <option value="ONG">ONG</option>
                  <option value="Dépôt">Dépôt</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--brand-navy)', marginBottom: 6 }}>Pays *</label>
                <CountrySelect value={facCountry} onChange={setFacCountry} required className="input-field" />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--brand-navy)', marginBottom: 6 }}>Région</label>
                <RegionSelect countryCode={facCountry} value={facRegion} onChange={setFacRegion} className="input-field" />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--brand-navy)', marginBottom: 6 }}>Localisation</label>
                <LocationPickerWrapper
                  lat={lat} lng={lng} address={address}
                  onLocationChange={(la, ln, addr) => { setLat(la); setLng(ln); setAddress(addr); }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--brand-navy)', marginBottom: 6 }}>Contact principal *</label>
                <input type="text" className="input-field" placeholder="Nom du responsable" required value={contactName} onChange={(e) => setContact(e.target.value)} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--brand-navy)', marginBottom: 6 }}>Téléphone *</label>
                <input type="tel" className="input-field" placeholder="+243 81X XXX XXX" required value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--brand-navy)', marginBottom: 6 }}>Email contact</label>
                <input type="email" className="input-field" placeholder="contact@etablissement.cd" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button type="button" className="btn-secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>← Retour</button>
              <button type="submit" className="btn-primary" disabled={submitting} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {submitting ? 'Configuration...' : 'Terminer la configuration'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
