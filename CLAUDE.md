@AGENTS.md

# VitalGrid — Contexte projet pour Claude Code

## Stack technique

- **Framework** : Next.js 16.2.7 (App Router, Turbopack) — lire `node_modules/next/dist/docs/` avant tout changement
- **React** : 19.2.4 — `params` est une **Promise** dans les page.tsx dynamiques (`await params`)
- **Base de données** : Aurora DSQL (PostgreSQL-compatible, ACID, serverless)
- **IoT** : DynamoDB pour les événements capteurs cold-chain
- **Auth** : JWT httpOnly cookies (`vg_access` / `vg_refresh`) via `jose` + `bcryptjs`
- **Styling** : CSS Modules + variables globales dans `src/app/globals.css`
- **Icons** : Lucide React uniquement — zéro emoji comme icône
- **Langue** : Français (fr-FR) dans toute l'UI

## Architecture

```
src/
  app/
    (marketing)/          ← Site public (layout isolé, Sora + Noto Sans)
    dashboard/            ← App authentifiée (layout avec sidebar par rôle)
    api/                  ← Route Handlers Next.js
  lib/
    db.ts                 ← Pool DSQL + OCC retry (transact, query, queryOne)
    auth.ts               ← JWT helpers (signAccessToken, getSession, cookies)
    tenant.ts             ← requireTenant() depuis JWT (plus de header x-tenant-id)
    api-client.ts         ← apiFetch() côté client (credentials:same-origin)
    repos/                ← Repository layer (1 fichier par domaine)
    regions.ts            ← Régions africaines pour RegionSelect
  components/
    marketing/            ← MarketingNav, MarketingFooter, HeroSVG
    CountrySelect.tsx     ← 250 pays i18n-iso-countries (FR)
    RegionSelect.tsx      ← Régions auto selon pays (Afrique + texte libre)
    LocationPicker.tsx    ← Leaflet + Nominatim geocoding
    FacilitiesMap.tsx     ← Carte établissements (react-leaflet)
    StockMap.tsx          ← Carte stocks régionaux
  contexts/
    auth.tsx              ← AuthProvider + useAuth() hook
  middleware.ts           ← RBAC Edge (vérifie JWT, redirect par rôle)
scripts/
  migrate.ts              ← Schéma principal DSQL (12 tables)
  migrate-auth.ts         ← Colonnes auth sur users
  migrate-access-requests.ts ← Table access_requests (marketing)
  create-user.ts          ← Créer un compte super_admin
  seed-facility.ts        ← Associer un établissement à un compte
  setup-dynamodb.ts       ← Créer table cold_chain_events + données test
```

## Règles absolues

1. **`params` est une Promise** en Next.js 16 : `const { id } = await params;`
2. **OCC retry obligatoire** pour toutes les mutations DSQL — utiliser `transact()`
3. **Jamais de `x-tenant-id` header** — le tenant vient du JWT via `requireTenant(req)`
4. **Jamais d'emoji comme icône** — Lucide React uniquement
5. **`CREATE INDEX ASYNC`** — jamais synchrone sur DSQL
6. **`'use client'`** requis pour : hooks React, événements, Leaflet, i18n-iso-countries
7. **Sidebar dynamique par rôle** — définie dans `src/app/dashboard/layout.tsx`
8. **Pages marketing** (`src/app/(marketing)/`) — layout isolé, pas de auth, pas de sidebar

## Rôles et permissions

| Rôle | Dashboard | Accès |
|---|---|---|
| `super_admin` | `/dashboard/admin` | Tout + `/admin/*` + `/admin/organizations` |
| `facility_manager` | `/dashboard` | Inventaire, Transferts, Alertes, Analytics |
| `field_agent` | `/dashboard/field` | Inventaire simplifié, Transferts, Alertes |
| `ngo_coordinator` | `/dashboard/ngo` | Établissements, Transferts, Analytics |
| `auditor` | `/analytics/map` | Analytics + Journal d'audit |

## Variables d'environnement clés (.env.local)

```
DSQL_CLUSTER_ENDPOINT=tvt2wwp57mx42xunxgevgaldvu.dsql.us-east-1.on.aws
DSQL_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
JWT_SECRET=...  (min 64 chars)
SENDGRID_API_KEY=...
NEXT_PUBLIC_TENANT_ID=<org-uuid>
DYNAMODB_REGION=us-east-1
DYNAMODB_TABLE_COLD_CHAIN=cold_chain_events
```

## Commandes utiles

```bash
# Lancer le dev server
npm run dev

# Build de vérification
npm run build

# Migration principale DSQL
npx tsx --env-file=.env.local scripts/migrate.ts

# Migration colonnes auth
npx tsx --env-file=.env.local scripts/migrate-auth.ts

# Créer le premier super_admin
npx tsx --env-file=.env.local scripts/create-user.ts \
  --email admin@vitalgrid.io --password VitalGrid2026! \
  --role super_admin --org-name "VitalGrid" --name "Admin VitalGrid"

# Associer un établissement à un compte
npx tsx --env-file=.env.local scripts/seed-facility.ts admin@vitalgrid.io

# Setup DynamoDB cold-chain
npx tsx --env-file=.env.local scripts/setup-dynamodb.ts

# Migration table access_requests (marketing)
npx tsx --env-file=.env.local scripts/migrate-access-requests.ts
```

## URLs importantes

- Site public : `http://localhost:3000/` (landing page marketing)
- Login : `http://localhost:3000/login`
- Dashboard admin : `http://localhost:3000/dashboard/admin`
- Démo : `http://localhost:3000/demo`
- Inscription : `http://localhost:3000/register`
- Organisations (admin) : `http://localhost:3000/admin/organizations`
