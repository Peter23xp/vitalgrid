# VitalGrid — Onboarding + Countries + Super Admin Backoffice

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implémenter l'onboarding first-connection guidé (org → facility), les sélecteurs pays/région mondiaux avec picker GPS Leaflet, et le backoffice Super Admin avec gestion des organisations.

**Architecture:** Les composants CountrySelect/RegionSelect/LocationPicker sont réutilisables dans tout le projet. Le middleware détecte les facility_managers sans facilityId et force /onboarding. Les routes /api/organizations et /api/users/me/facility complètent la couche API.

**Tech Stack:** Next.js 16, React 19, Aurora DSQL, `i18n-iso-countries`, Leaflet (déjà installé), CSS Modules, Lucide React

---

## Task 0 : Installer i18n-iso-countries

**Files:**
- Modify: `package.json` (via npm)

- [ ] Installer :

```bash
npm install i18n-iso-countries
npm install --save-dev @types/i18n-iso-countries
```

- [ ] Vérifier :

```bash
npm list i18n-iso-countries
```

Résultat attendu : `i18n-iso-countries@7.x.x` listé.

- [ ] Build check : `npm run build`

---

## Task 1 : Composant CountrySelect

**Files:**
- Create: `src/components/CountrySelect.tsx`

- [ ] Créer `src/components/CountrySelect.tsx` :

```tsx
'use client';

import React from 'react';
import countries from 'i18n-iso-countries';
import frLocale from 'i18n-iso-countries/langs/fr.json';

countries.registerLocale(frLocale);

interface Props {
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export default function CountrySelect({ value, onChange, placeholder = 'Sélectionner un pays...', required, className }: Props) {
  const countryList = Object.entries(countries.getNames('fr', { select: 'official' }))
    .sort(([, a], [, b]) => a.localeCompare(b, 'fr'));

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className={className}
    >
      <option value="">{placeholder}</option>
      {countryList.map(([code, name]) => (
        <option key={code} value={code}>{name}</option>
      ))}
    </select>
  );
}
```

- [ ] Build check : `npm run build`

---

## Task 2 : Composant RegionSelect

**Files:**
- Create: `src/lib/regions.ts`
- Create: `src/components/RegionSelect.tsx`

- [ ] Créer `src/lib/regions.ts` :

```typescript
export const REGIONS: Record<string, string[]> = {
  CD: ['Kinshasa','Kongo Central','Kwango','Kwilu','Mai-Ndombe','Kasaï','Kasaï-Central','Kasaï-Oriental','Lomami','Sankuru','Maniema','Sud-Kivu','Nord-Kivu','Ituri','Haut-Uele','Tshopo','Bas-Uele','Nord-Ubangi','Mongala','Sud-Ubangi','Équateur','Tshuapa','Tanganyika','Haut-Lomami','Lualaba','Haut-Katanga'],
  RW: ['Kigali','Province du Nord','Province du Sud','Province de l\'Est','Province de l\'Ouest'],
  BI: ['Bubanza','Bujumbura Mairie','Bujumbura Rural','Bururi','Cankuzo','Cibitoke','Gitega','Karuzi','Kayanza','Kirundo','Makamba','Muramvya','Muyinga','Mwaro','Ngozi','Rumonge','Rutana','Ruyigi'],
  UG: ['Kampala','Gulu','Lira','Mbarara','Jinja','Fort Portal','Entebbe','Arua','Kabale','Soroti'],
  TZ: ['Dar es Salaam','Dodoma','Mwanza','Arusha','Mbeya','Morogoro','Tanga','Kagera','Kigoma','Kilimanjaro','Ruvuma','Mtwara','Lindi','Singida','Tabora','Rukwa','Shinyanga','Mara','Iringa','Pwani'],
  KE: ['Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika','Malindi','Kitale','Garissa','Kakamega'],
  SS: ['Juba','Wau','Malakal','Yei','Bor','Torit','Aweil','Rumbek','Bentiu'],
  CG: ['Brazzaville','Pointe-Noire','Dolisie','Nkayi','Impfondo','Ouesso','Sibiti','Madingou'],
  CF: ['Bangui','Berbérati','Carnot','Bambari','Bangassou','Bossangoa','Bouar','Nola'],
  ET: ['Addis-Abeba','Amhara','Oromia','Somali','Tigray','SNNPR','Afar','Harari','Dire Dawa'],
  NG: ['Lagos','Kano','Ibadan','Abuja','Port Harcourt','Benin City','Maiduguri','Kaduna','Zaria','Aba'],
  ZA: ['Gauteng','Cap-Occidental','KwaZulu-Natal','Cap-Oriental','Limpopo','Mpumalanga','Nord-Ouest','État libre d\'Orange','Cap-du-Nord'],
  GH: ['Accra','Kumasi','Tamale','Sekondi-Takoradi','Ashaiman','Sunyani','Cape Coast','Obuasi'],
  CM: ['Adamaoua','Centre','Est','Extrême-Nord','Littoral','Nord','Nord-Ouest','Ouest','Sud','Sud-Ouest'],
  SN: ['Dakar','Diourbel','Fatick','Kaffrine','Kaolack','Kédougou','Kolda','Louga','Matam','Saint-Louis','Sédhiou','Tambacounda','Thiès','Ziguinchor'],
};

export function getRegions(countryCode: string): string[] | null {
  return REGIONS[countryCode] ?? null;
}
```

- [ ] Créer `src/components/RegionSelect.tsx` :

```tsx
'use client';

import React, { useEffect } from 'react';
import { getRegions } from '@/lib/regions';

interface Props {
  countryCode: string;
  value: string;
  onChange: (region: string) => void;
  required?: boolean;
  className?: string;
}

export default function RegionSelect({ countryCode, value, onChange, required, className }: Props) {
  const regions = getRegions(countryCode);

  useEffect(() => {
    onChange('');
  }, [countryCode]);

  if (!regions) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Région / Province / État"
        className={className}
      />
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className={className}
    >
      <option value="">Sélectionner une région...</option>
      {regions.map((r) => (
        <option key={r} value={r}>{r}</option>
      ))}
    </select>
  );
}
```

- [ ] Build check : `npm run build`

---

## Task 3 : Composant LocationPicker (Leaflet + Nominatim)

**Files:**
- Create: `src/components/LocationPicker.tsx`
- Create: `src/components/LocationPickerWrapper.tsx`

- [ ] Créer `src/components/LocationPickerWrapper.tsx` (client wrapper pour import dynamique) :

```tsx
'use client';

import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('./LocationPicker'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 300, background: '#f0f4f8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#64748B' }}>
      Chargement de la carte...
    </div>
  ),
});

export default LocationPicker;
export type { LocationPickerProps } from './LocationPicker';
```

- [ ] Créer `src/components/LocationPicker.tsx` :

```tsx
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Search } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default Leaflet marker icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface LocationPickerProps {
  lat?: number;
  lng?: number;
  address?: string;
  onLocationChange: (lat: number, lng: number, address: string) => void;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) { onMapClick(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

export default function LocationPicker({ lat, lng, address, onLocationChange }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    lat && lng ? [lat, lng] : null
  );
  const [search, setSearch]   = useState(address ?? '');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'fr' } }
      );
      const data = await res.json();
      const addr = data.display_name ?? '';
      setSearch(addr);
      onLocationChange(lat, lng, addr);
    } catch {
      onLocationChange(lat, lng, '');
    }
  }, [onLocationChange]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setPosition([lat, lng]);
    reverseGeocode(lat, lng);
  }, [reverseGeocode]);

  const handleSearchChange = (q: string) => {
    setSearch(q);
    clearTimeout(debounceRef.current);
    if (q.length < 3) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`,
          { headers: { 'Accept-Language': 'fr' } }
        );
        setResults(await res.json());
      } catch { setResults([]); }
    }, 500);
  };

  const selectResult = (r: NominatimResult) => {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    setPosition([lat, lng]);
    setSearch(r.display_name);
    setResults([]);
    onLocationChange(lat, lng, r.display_name);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ position: 'relative' }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-slate)', pointerEvents: 'none' }} />
        <input
          type="text"
          className="input-field"
          style={{ paddingLeft: 36 }}
          placeholder="Rechercher une adresse..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        {results.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 8, zIndex: 1000, boxShadow: 'var(--shadow-md)', maxHeight: 200, overflowY: 'auto' }}>
            {results.map((r, i) => (
              <button key={i} type="button" onClick={() => selectResult(r)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: 13, borderBottom: '1px solid var(--border-light)', background: 'none', cursor: 'pointer' }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-main)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
              >
                {r.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <MapContainer
        center={position ?? [-2, 28]}
        zoom={position ? 13 : 5}
        style={{ height: 280, borderRadius: 8, border: '1px solid var(--border-light)' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onMapClick={handleMapClick} />
        {position && <Marker position={position} draggable onDragend={(e) => { const { lat, lng } = e.target.getLatLng(); handleMapClick(lat, lng); }} />}
      </MapContainer>
      <p style={{ fontSize: 11, color: 'var(--brand-slate)' }}>Cliquez sur la carte ou recherchez une adresse pour définir la localisation</p>
    </div>
  );
}
```

- [ ] Build check : `npm run build`
- [ ] Commit :

```bash
git add src/components/ src/lib/regions.ts
git commit -m "feat: CountrySelect, RegionSelect, LocationPicker components"
```

---

## Task 4 : Repository organizations + routes API

**Files:**
- Create: `src/lib/repos/organizations.ts`
- Create: `src/app/api/organizations/route.ts`
- Create: `src/app/api/users/me/facility/route.ts`
- Create: `src/app/api/admin/organizations/route.ts`
- Create: `src/app/api/admin/organizations/[id]/route.ts`
- Create: `src/app/api/admin/platform-summary/route.ts`

- [ ] Créer `src/lib/repos/organizations.ts` :

```typescript
import { query, queryOne, transact } from '@/lib/db';
import type { Organization } from '@/lib/types';

export async function listAllOrganizations(): Promise<(Organization & { facilitiesCount: number; usersCount: number })[]> {
  return query(
    `SELECT o.*,
       (SELECT COUNT(*) FROM facilities f WHERE f.org_id = o.id) AS "facilitiesCount",
       (SELECT COUNT(*) FROM users u WHERE u.org_id = o.id)      AS "usersCount"
     FROM organizations o
     ORDER BY o.created_at DESC`
  );
}

export async function getOrganizationDetail(id: string) {
  const org = await queryOne<Organization>('SELECT * FROM organizations WHERE id = $1', [id]);
  if (!org) return null;
  const facilities = await query('SELECT * FROM facilities WHERE org_id = $1 ORDER BY name', [id]);
  const users = await query(
    `SELECT id, name, email, role, facility_id, status FROM users WHERE org_id = $1 ORDER BY name`,
    [id]
  );
  return { org, facilities, users };
}

export async function createOrganization(data: {
  name: string; type: string; country_code: string; regions?: string[];
}): Promise<Organization> {
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 100);
  return transact(async (client) => {
    const res = await client.query<Organization>(
      `INSERT INTO organizations (name, type, country_code, regions, slug)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.name, data.type, data.country_code,
       JSON.stringify(data.regions ?? []), slug]
    );
    return res.rows[0];
  });
}
```

- [ ] Créer `src/app/api/organizations/route.ts` :

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createOrganization, listAllOrganizations } from '@/lib/repos/organizations';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return apiError('Non authentifié', 401);
  if (session.role !== 'super_admin') return apiError('Accès refusé', 403);
  const orgs = await listAllOrganizations();
  return apiOk(orgs);
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return apiError('Non authentifié', 401);
  const body = await req.json();
  if (!body.name || !body.type || !body.country_code) {
    return apiError('name, type et country_code sont requis');
  }
  try {
    const org = await createOrganization(body);
    return NextResponse.json(org, { status: 201 });
  } catch (e: unknown) {
    return apiError((e as Error).message, 500);
  }
}
```

- [ ] Créer `src/app/api/users/me/facility/route.ts` (créer les répertoires) :

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSession, signAccessToken, setAuthCookies } from '@/lib/auth';
import { transact } from '@/lib/db';
import { apiError } from '@/lib/types';

export async function PATCH(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return apiError('Non authentifié', 401);

  const { facilityId } = await req.json();
  if (!facilityId) return apiError('facilityId requis');

  await transact(async (client) => {
    await client.query(
      `UPDATE users SET facility_id = $1, updated_at = NOW() WHERE id = $2`,
      [facilityId, session.userId]
    );
  });

  const accessToken = await signAccessToken({
    userId:     session.userId,
    tenantId:   session.tenantId,
    orgId:      session.orgId,
    facilityId,
    role:       session.role,
    email:      session.email,
    name:       session.name,
  });

  const res = NextResponse.json({ success: true });
  res.cookies.set('vg_access', accessToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path:     '/',
    maxAge:   3600,
  });
  return res;
}
```

- [ ] Créer `src/app/api/admin/organizations/route.ts` :

```typescript
import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { listAllOrganizations } from '@/lib/repos/organizations';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return apiError('Non authentifié', 401);
  if (session.role !== 'super_admin') return apiError('Accès refusé', 403);
  const orgs = await listAllOrganizations();
  return apiOk(orgs);
}
```

- [ ] Créer `src/app/api/admin/organizations/[id]/route.ts` :

```typescript
import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { getOrganizationDetail } from '@/lib/repos/organizations';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(req);
  if (!session) return apiError('Non authentifié', 401);
  if (session.role !== 'super_admin') return apiError('Accès refusé', 403);
  const { id } = await params;
  const detail = await getOrganizationDetail(id);
  if (!detail) return apiError('Organisation introuvable', 404);
  return apiOk(detail);
}
```

- [ ] Créer `src/app/api/admin/platform-summary/route.ts` :

```typescript
import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return apiError('Non authentifié', 401);
  if (session.role !== 'super_admin') return apiError('Accès refusé', 403);

  const [orgs]      = await query<{ count: string }>('SELECT COUNT(*) AS count FROM organizations');
  const [facilities]= await query<{ count: string }>('SELECT COUNT(*) AS count FROM facilities');
  const [users]     = await query<{ count: string }>('SELECT COUNT(*) AS count FROM users');
  const recentOrgs  = await query(
    `SELECT id, name, type, country_code,
       (SELECT COUNT(*) FROM facilities f WHERE f.org_id = o.id) AS "facilitiesCount"
     FROM organizations o ORDER BY created_at DESC LIMIT 5`
  );

  return apiOk({
    orgs:       parseInt(orgs?.count ?? '0', 10),
    facilities: parseInt(facilities?.count ?? '0', 10),
    users:      parseInt(users?.count ?? '0', 10),
    recentOrgs,
  });
}
```

- [ ] Build check : `npm run build`
- [ ] Commit :

```bash
git add src/lib/repos/organizations.ts src/app/api/organizations/ src/app/api/users/ src/app/api/admin/organizations/ src/app/api/admin/platform-summary/
git commit -m "feat: organizations repo + API routes (CRUD, detail, platform-summary)"
```

---

## Task 5 : Mise à jour middleware — redirect onboarding

**Files:**
- Modify: `src/middleware.ts`

- [ ] Lire `src/middleware.ts` puis ajouter la logique d'onboarding. Remplacer le bloc après `const session = await verifyToken(token)` par :

```typescript
  const session = await verifyToken(token);

  if (!session) {
    const refreshToken = req.cookies.get('vg_refresh')?.value;
    if (refreshToken) {
      const url = req.nextUrl.clone();
      url.pathname = '/api/auth/refresh';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Onboarding — facility_manager sans facilityId doit compléter l'onboarding
  if (
    session.role === 'facility_manager' &&
    !session.facilityId &&
    pathname !== '/onboarding' &&
    !pathname.startsWith('/api/')
  ) {
    const url = req.nextUrl.clone();
    url.pathname = '/onboarding';
    return NextResponse.redirect(url);
  }
```

- [ ] Ajouter `/onboarding` dans PUBLIC_PATHS pour éviter les boucles :

```typescript
const PUBLIC_PATHS = ['/login', '/forgot-password', '/api/auth', '/onboarding'];
```

- [ ] Ajouter la protection RBAC pour `/admin/organizations` :

```typescript
{ pattern: /^\/admin\/organizations/, roles: ['super_admin'] },
```

- [ ] Build check : `npm run build`
- [ ] Commit :

```bash
git add src/middleware.ts
git commit -m "feat: middleware — onboarding redirect for facility_manager without facility"
```

---

## Task 6 : Rewrite /onboarding — 2 étapes avec composants

**Files:**
- Modify: `src/app/onboarding/page.tsx`

- [ ] Remplacer `src/app/onboarding/page.tsx` par :

```tsx
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
  const [step, setStep]       = useState<Step>(1);
  const [error, setError]     = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Step 1 — Organisation
  const [orgId, setOrgId]     = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('');
  const [orgCountry, setOrgCountry] = useState('');

  // Step 2 — Établissement
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

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: 24, fontWeight: 700, color: 'var(--brand-navy)', marginBottom: 8 }}>
            <span style={{ color: 'var(--brand-sage)' }}>Vital</span>Grid
          </h1>
          <p style={{ color: 'var(--brand-slate)', fontSize: 14 }}>Configuration de votre espace de travail</p>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: '2rem' }}>
          {[{ n: 1, label: 'Organisation' }, { n: 2, label: 'Établissement' }].map(({ n, label }, i) => (
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

        {/* Step 1 */}
        {step === 1 && (
          <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--brand-navy)', marginBottom: 4 }}>Votre organisation</h2>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--brand-navy)', marginBottom: 6 }}>Nom de l&apos;organisation *</label>
              <input type="text" className="input-field" placeholder="Ex: MSF Belgique" required value={orgName} onChange={(e) => setOrgName(e.target.value)} />
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

        {/* Step 2 */}
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
```

- [ ] Build check : `npm run build`
- [ ] Commit :

```bash
git add src/app/onboarding/page.tsx
git commit -m "feat: onboarding 2-step flow (org → facility) with CountrySelect + LocationPicker"
```

---

## Task 7 : Page /admin/organizations

**Files:**
- Create: `src/app/admin/organizations/page.tsx`
- Create: `src/app/admin/organizations/page.module.css`
- Create: `src/app/admin/organizations/[id]/page.tsx`
- Create: `src/app/admin/organizations/[id]/page.module.css`

- [ ] Créer `src/app/admin/organizations/page.tsx` :

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Plus, Search } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface OrgRow {
  id: string; name: string; type: string; country_code: string;
  facilitiesCount: number; usersCount: number;
  created_at: string;
}

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs]       = useState<OrgRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    apiFetch<OrgRow[]>('/api/admin/organizations')
      .then(setOrgs).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = orgs.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.country_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/dashboard/admin" className={styles.backLink}>← Admin</Link>
          <h1 className={styles.title}>ORGANISATIONS</h1>
        </div>
        <Link href="/onboarding" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={15} /> Nouvelle organisation
        </Link>
      </header>

      <div className={styles.searchBar}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-slate)' }} />
        <input
          type="text"
          className="input-field"
          style={{ paddingLeft: 36 }}
          placeholder="Rechercher une organisation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.resultsInfo}>
        {loading ? 'Chargement...' : `${filtered.length} organisation${filtered.length !== 1 ? 's' : ''}`}
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr><th>NOM</th><th>TYPE</th><th>PAYS</th><th>FACILITIES</th><th>USERS</th><th>ACTIONS</th></tr>
          </thead>
          <tbody>
            {!loading && filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--brand-slate)' }}>
                  <Building2 size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.35 }} />
                  <p style={{ fontSize: 13 }}>Aucune organisation</p>
                </td>
              </tr>
            ) : filtered.map((o) => (
              <tr key={o.id} className={styles.row}>
                <td className={styles.orgName}>{o.name}</td>
                <td>{o.type}</td>
                <td className="mono" style={{ fontSize: 12 }}>{o.country_code}</td>
                <td><span className="badge info">{o.facilitiesCount}</span></td>
                <td><span className="badge info">{o.usersCount}</span></td>
                <td><Link href={`/admin/organizations/${o.id}`} className={styles.actionLink}>Gérer</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] Créer `src/app/admin/organizations/page.module.css` :

```css
.container { max-width: 1200px; }
.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.headerTitle { display: flex; align-items: center; gap: 12px; }
.backLink { color: var(--brand-slate); font-size: 13px; font-weight: 500; text-decoration: none; }
.backLink:hover { color: var(--brand-navy); }
.title { font-size: 20px; font-weight: 700; color: var(--brand-navy); font-family: var(--font-headline); }
.searchBar { position: relative; margin-bottom: 16px; }
.resultsInfo { font-size: 13px; color: var(--brand-slate); margin-bottom: 12px; }
.tableContainer { background: var(--bg-card); border: 1px solid var(--border-light); border-radius: 10px; overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; }
.table th { padding: 12px 16px; font-size: 11px; color: var(--brand-slate); text-transform: uppercase; letter-spacing: 0.7px; font-weight: 600; border-bottom: 1px solid var(--border-light); background: var(--bg-main); text-align: left; }
.table td { padding: 14px 16px; font-size: 13px; color: var(--brand-navy); border-bottom: 1px solid var(--border-light); }
.row:last-child td { border-bottom: none; }
.row:hover { background: var(--bg-main); }
.orgName { font-weight: 600; }
.actionLink { color: var(--brand-sage); font-weight: 500; font-size: 13px; text-decoration: none; }
.actionLink:hover { text-decoration: underline; }
```

- [ ] Créer `src/app/admin/organizations/[id]/page.tsx` :

```tsx
'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Building2, Users } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Facility { id: string; name: string; type: string; region: string | null; status: string; }
interface User     { id: string; name: string; email: string; role: string; status: string; }
interface Detail   { org: { id: string; name: string; type: string; country_code: string }; facilities: Facility[]; users: User[]; }

export default function AdminOrgDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }        = use(params);
  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'facilities' | 'users'>('facilities');

  useEffect(() => {
    apiFetch<Detail>(`/api/admin/organizations/${id}`)
      .then(setData).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const STATUS_BADGE: Record<string, string> = { active: 'success', critical: 'critical', warning: 'warning', offline: 'info', disabled: 'info' };

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/admin/organizations" className={styles.backLink}>← Organisations</Link>
          <h1 className={styles.title}>{loading ? '...' : (data?.org.name ?? 'Organisation')}</h1>
          {data && <span className="badge info" style={{ marginLeft: 8 }}>{data.org.type}</span>}
        </div>
      </header>

      <div className={styles.tabBar}>
        <button className={`${styles.tab} ${tab === 'facilities' ? styles.tabActive : ''}`} onClick={() => setTab('facilities')}>
          <Building2 size={14} /> Établissements {data && `(${data.facilities.length})`}
        </button>
        <button className={`${styles.tab} ${tab === 'users' ? styles.tabActive : ''}`} onClick={() => setTab('users')}>
          <Users size={14} /> Utilisateurs {data && `(${data.users.length})`}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--brand-slate)', fontSize: 13 }}>Chargement...</div>
      ) : tab === 'facilities' ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead><tr><th>NOM</th><th>TYPE</th><th>RÉGION</th><th>STATUT</th><th>ACTIONS</th></tr></thead>
            <tbody>
              {data?.facilities.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--brand-slate)' }}>
                  <Building2 size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.35 }} />
                  <p style={{ fontSize: 13 }}>Aucun établissement</p>
                </td></tr>
              ) : data?.facilities.map((f) => (
                <tr key={f.id} className={styles.row}>
                  <td style={{ fontWeight: 600 }}>{f.name}</td>
                  <td>{f.type}</td>
                  <td>{f.region ?? '—'}</td>
                  <td><span className={`badge ${STATUS_BADGE[f.status] ?? 'info'}`}>{f.status}</span></td>
                  <td><Link href={`/facilities/${f.id}`} className={styles.actionLink}>Voir</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead><tr><th>NOM</th><th>EMAIL</th><th>RÔLE</th><th>STATUT</th></tr></thead>
            <tbody>
              {data?.users.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--brand-slate)' }}>
                  <Users size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.35 }} />
                  <p style={{ fontSize: 13 }}>Aucun utilisateur</p>
                </td></tr>
              ) : data?.users.map((u) => (
                <tr key={u.id} className={styles.row}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td className="mono" style={{ fontSize: 12 }}>{u.email}</td>
                  <td>{u.role}</td>
                  <td><span className={`badge ${u.status === 'active' ? 'success' : 'info'}`}>{u.status === 'active' ? 'Actif' : u.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [ ] Créer `src/app/admin/organizations/[id]/page.module.css` :

```css
.container { max-width: 1100px; }
.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.headerTitle { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.backLink { color: var(--brand-slate); font-size: 13px; font-weight: 500; text-decoration: none; }
.backLink:hover { color: var(--brand-navy); }
.title { font-size: 20px; font-weight: 700; color: var(--brand-navy); font-family: var(--font-headline); }
.tabBar { display: flex; gap: 0; border-bottom: 1px solid var(--border-light); margin-bottom: 20px; }
.tab { display: flex; align-items: center; gap: 6px; padding: 10px 20px; font-size: 13px; font-weight: 500; color: var(--brand-slate); border-bottom: 2px solid transparent; margin-bottom: -1px; transition: color 0.15s; background: none; cursor: pointer; }
.tab:hover { color: var(--brand-navy); }
.tabActive { color: var(--brand-navy); border-bottom-color: var(--brand-navy); font-weight: 600; }
.tableContainer { background: var(--bg-card); border: 1px solid var(--border-light); border-radius: 10px; overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; }
.table th { padding: 12px 16px; font-size: 11px; color: var(--brand-slate); text-transform: uppercase; letter-spacing: 0.7px; font-weight: 600; border-bottom: 1px solid var(--border-light); background: var(--bg-main); text-align: left; }
.table td { padding: 14px 16px; font-size: 13px; color: var(--brand-navy); border-bottom: 1px solid var(--border-light); }
.row:last-child td { border-bottom: none; }
.row:hover { background: var(--bg-main); }
.actionLink { color: var(--brand-sage); font-weight: 500; font-size: 13px; text-decoration: none; }
.actionLink:hover { text-decoration: underline; }
```

- [ ] Build check : `npm run build`
- [ ] Commit :

```bash
git add src/app/admin/organizations/
git commit -m "feat: /admin/organizations list + detail pages (tabs facilities/users)"
```

---

## Task 8 : Sidebar + Dashboard Admin

**Files:**
- Modify: `src/app/dashboard/layout.tsx`
- Modify: `src/app/dashboard/admin/page.tsx`

- [ ] Dans `src/app/dashboard/layout.tsx`, ajouter `Building2` aux imports Lucide existants, puis ajouter le lien dans le navGroup Administration, juste après le lien Utilisateurs :

```tsx
<Link href="/admin/organizations" className={styles.navLink}><Building2 size={15} />Organisations</Link>
```

- [ ] Remplacer le contenu de `src/app/dashboard/admin/page.tsx` par :

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Users, Zap, CheckCircle2, ChevronRight, Plus, Database } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Summary {
  orgs: number; facilities: number; users: number;
  recentOrgs: { id: string; name: string; type: string; country_code: string; facilitiesCount: number }[];
}

export default function SuperAdminDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Summary>('/api/admin/platform-summary')
      .then(setSummary).catch(console.error).finally(() => setLoading(false));
  }, []);

  const val = (n: number | undefined) => loading ? '--' : (n ?? '--');

  return (
    <div className={`animate-fade-in ${styles.dashboard}`}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.welcomeTitle}>Plateforme VitalGrid</h1>
          <p className={styles.welcomeSubtitle}>Vue globale · Supervision Super Admin</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/admin/organizations" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <Building2 size={15} />Organisations
          </Link>
          <Link href="/admin/system-status" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <CheckCircle2 size={15} />Statut système
          </Link>
        </div>
      </header>

      <section className={styles.metricsGrid}>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(5,150,105,0.1)', color: 'var(--brand-sage)' }}><Building2 size={18} /></div>
          <div className={styles.metricValue}>{val(summary?.orgs)}</div>
          <p className={styles.metricLabel}>Organisations actives</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(14,165,233,0.1)', color: 'var(--status-info)' }}><Building2 size={18} /></div>
          <div className={styles.metricValue}>{val(summary?.facilities)}</div>
          <p className={styles.metricLabel}>Établissements</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(234,179,8,0.1)', color: 'var(--status-warning)' }}><Users size={18} /></div>
          <div className={styles.metricValue}>{val(summary?.users)}</div>
          <p className={styles.metricLabel}>Comptes utilisateurs</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(15,23,42,0.08)', color: 'var(--brand-navy)' }}><Zap size={18} /></div>
          <div className={styles.metricValue}>--</div>
          <p className={styles.metricLabel}>Requêtes API / 24h</p>
        </div>
      </section>

      <div className={styles.mainGrid}>
        <div className={styles.columnLeft}>
          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Santé de l&apos;infrastructure</h2>
              <Link href="/admin/system-status" className={styles.seeAll}>Détails <ChevronRight size={14} /></Link>
            </div>
            <div className={styles.healthList}>
              {[
                { name: 'Aurora DSQL', sub: 'Base de données principale' },
                { name: 'DynamoDB', sub: 'Événements & IoT' },
                { name: 'Vercel Edge', sub: 'Réseau de distribution' },
              ].map((s) => (
                <div key={s.name} className={styles.healthItem}>
                  <div className={styles.healthLeft}>
                    <div className={styles.healthDot} style={{ background: 'var(--brand-slate)' }} />
                    <div>
                      <p className={styles.healthName}>{s.name}</p>
                      <p className={styles.healthSub}>{s.sub}</p>
                    </div>
                  </div>
                  <div className={styles.healthMetrics}>
                    <span className={styles.metricPill}><span className="mono">--</span> latence</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className={styles.columnRight}>
          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Organisations récentes</h2>
              <Link href="/admin/organizations" className={styles.seeAll}>Tout voir <ChevronRight size={14} /></Link>
            </div>
            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--brand-slate)', fontSize: 13 }}>Chargement...</div>
            ) : !summary?.recentOrgs?.length ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--brand-slate)' }}>
                <Building2 size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.35 }} />
                <p style={{ fontSize: 13 }}>Aucune organisation</p>
              </div>
            ) : (
              <div className={styles.orgList}>
                {summary.recentOrgs.map((o) => (
                  <Link key={o.id} href={`/admin/organizations/${o.id}`} className={styles.orgItem} style={{ textDecoration: 'none' }}>
                    <div className={styles.orgAvatar}>{o.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <p className={styles.orgName}>{o.name}</p>
                      <p className={styles.orgMeta}>{o.facilitiesCount} établissement{o.facilitiesCount !== 1 ? 's' : ''} · {o.country_code}</p>
                    </div>
                    <ChevronRight size={14} style={{ marginLeft: 'auto', color: 'var(--brand-slate)' }} />
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className={styles.cardElevated}>
            <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>Administration</h2></div>
            <div className={styles.quickLinks}>
              <Link href="/admin/organizations" className={styles.quickLink}><Building2 size={15} />Gérer les organisations<ChevronRight size={14} className={styles.quickLinkArrow} /></Link>
              <Link href="/admin/users" className={styles.quickLink}><Users size={15} />Gérer les utilisateurs<ChevronRight size={14} className={styles.quickLinkArrow} /></Link>
              <Link href="/admin/audit-log" className={styles.quickLink}><Database size={15} />Journal d&apos;audit<ChevronRight size={14} className={styles.quickLinkArrow} /></Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
```

- [ ] Build check : `npm run build`
- [ ] Commit final :

```bash
git add src/app/dashboard/layout.tsx src/app/dashboard/admin/page.tsx
git commit -m "feat: sidebar Organisations link + admin dashboard with real metrics"
```
