# VitalGrid — Onboarding + Pays/Régions + Backoffice Super Admin

## Goal

1. Onboarding first-connection guidé pour les Facility Managers (org → facility → JWT refresh)
2. Sélecteur de pays mondial (i18n-iso-countries, noms FR) + régions auto + picker GPS Leaflet
3. Backoffice Super Admin complet (/dashboard/admin enrichi + /admin/organizations)

---

## Section 1 — Onboarding First-Connection

### Déclencheur middleware

Dans `src/middleware.ts`, après vérification du JWT :
- Si `role === 'facility_manager'` ET `facilityId === null` ET pathname !== `/onboarding`
- → redirect `/onboarding`
- Le super_admin est exempt (pas de facilityId par design)

### Flux /onboarding — 2 étapes

**Étape 1 : Organisation**
- Champs : nom *, type *, pays * (CountrySelect), régions (multi-input)
- Submit : `POST /api/organizations` → retourne `{ id, tenantId }`
- Stockage temporaire : `sessionStorage` pour passer `orgId` à l'étape 2

**Étape 2 : Établissement**
- Champs : nom *, type *, pays * (pré-rempli depuis étape 1), région (RegionSelect auto), adresse, GPS (LocationPicker), contact *, téléphone *, email, zones de stockage, capacité lits
- Submit séquentiel :
  1. `POST /api/facilities` avec `org_id` → retourne `{ id: facilityId }`
  2. `PATCH /api/users/me/facility` → associe `facilityId` au user courant
  3. `POST /api/auth/refresh` → régénère le JWT avec le nouveau `facilityId`
  4. Redirect vers `/dashboard`

### Route API manquante

**`PATCH /api/users/me/facility`** :
```
Body:   { facilityId: string }
Action: UPDATE users SET facility_id = $1 WHERE id = session.userId
```

**`POST /api/organizations`** :
```
Body:   { name, type, country_code, regions? }
Action: INSERT INTO organizations + set tenantId = orgId
```

---

## Section 2 — Composants Pays/Régions/GPS

### Dépendances

```bash
npm install i18n-iso-countries
```

### CountrySelect — src/components/CountrySelect.tsx

```typescript
// Props: value, onChange, placeholder?, required?
// Affiche ~250 pays triés alphabétiquement en français
// Retourne le code ISO 2 lettres (CD, RW, BI...)
```

### RegionSelect — src/components/RegionSelect.tsx

```typescript
// Props: countryCode, value, onChange
// Se réinitialise quand countryCode change
// Pays africains prioritaires avec régions hardcodées:
//   CD: Nord-Kivu, Sud-Kivu, Maniema, Kinshasa, Katanga, Ituri, ...
//   RW: Kigali, Nord, Sud, Est, Ouest
//   BI: Bujumbura, Gitega, Ngozi, ...
//   UG: Kampala, Gulu, Mbarara, ...
//   TZ: Dar es Salaam, Dodoma, Mwanza, ...
//   KE: Nairobi, Mombasa, Kisumu, ...
//   SS: Juba, Wau, Malakal, ...
//   CG: Brazzaville, Pointe-Noire, ...
//   CF: Bangui, ...
// Autres pays: input texte libre
```

### LocationPicker — src/components/LocationPicker.tsx

```typescript
// Props: lat?, lng?, address?, onLocationChange(lat, lng, address)
// 'use client' — Leaflet
// - Carte 300px, centrée sur l'Afrique centrale par défaut (-2, 28, zoom 5)
// - Champ recherche avec debounce 500ms → Nominatim geocoding
// - Clic sur carte → marker, reverse geocoding → rempli address
// - Recherche → marker déplacé, lat/lng + address mis à jour
// - Marker draggable
```

---

## Section 3 — Backoffice Super Admin

### Route API — src/app/api/organizations/route.ts

```
GET  /api/organizations  → liste toutes les orgs (super_admin only)
POST /api/organizations  → crée une org
```

### Route API — src/app/api/admin/organizations/[id]/route.ts

```
GET /api/admin/organizations/[id] → org + facilities[] + users[] agrégés
```

### Repository — src/lib/repos/organizations.ts

```typescript
listOrganizations()        → Organization[]
getOrganizationDetail(id)  → { org, facilities, users }
```

### Page /admin/organizations — src/app/admin/organizations/page.tsx

- Table : Nom | Type | Pays | Facilities | Users | Statut | Actions
- Bouton "Nouvelle organisation" → modal inline ou `/admin/organizations/new`
- Ligne cliquable → `/admin/organizations/[id]`

### Page /admin/organizations/[id] — src/app/admin/organizations/[id]/page.tsx

- Header : nom org, type, pays, statut badge
- Tabs : "Établissements" | "Utilisateurs"
- Tab Établissements : table facilities avec statut + bouton "Ajouter"
- Tab Utilisateurs : table users avec rôle + bouton "Inviter"

### Mise à jour sidebar

Dans `src/app/dashboard/layout.tsx`, ajouter sous Administration :
```
<Link href="/admin/organizations">Organisations</Link>
```

### Mise à jour middleware

Ajouter `/admin/organizations` dans la matrice RBAC :
```typescript
{ pattern: /^\/admin\/organizations/, roles: ['super_admin'] }
```

### Dashboard /dashboard/admin enrichi

- Métriques depuis `GET /api/admin/platform-summary` (à créer)
- Organisations récentes depuis `GET /api/organizations?limit=5`
- Bouton "Nouvelle organisation" → `/admin/organizations?new=1`

---

## Ordre d'implémentation recommandé

1. Composants CountrySelect + RegionSelect + LocationPicker
2. Routes API organizations (GET + POST) + PATCH /api/users/me/facility
3. Onboarding rewrite (2 étapes) + middleware update
4. Pages /admin/organizations + /admin/organizations/[id]
5. Dashboard admin enrichi + sidebar update
