---
name: integration-tests-design
description: Design des tests d'intégration VitalGrid — scripts tsx autonomes couvrant tous les rôles
metadata:
  type: project
---

# Tests d'intégration VitalGrid — Design

## Contexte

Aucun framework de test n'est installé. Approche choisie : scripts `tsx` autonomes qui lancent des
requêtes `fetch()` contre le serveur Next.js local (`localhost:3000`). Pas de mocks, on teste la
vraie DB Aurora DSQL et les vraies routes API.

---

## Architecture

### Fichiers produits

```
scripts/
  test-integration.ts          ← runner principal (super_admin)
  test-integration-roles.ts    ← runner rôles secondaires
```

### Mécanique commune

1. Le script assume que `npm run dev` tourne déjà sur `:3000`
2. Login via `POST /api/auth/login` → extraction du cookie `Set-Cookie`
3. Cookie transmis dans `Cookie:` header sur tous les appels suivants
4. État partagé en mémoire (ids créés réutilisés dans les suites suivantes)
5. Nettoyage optionnel : les items créés portent le nom `[TEST-INT] ...` — pas de DELETE automatique (DSQL OCC rend ça risqué en script), l'opérateur peut purger manuellement

### Format de sortie

```
══════════════════════════════════════════
  VitalGrid — Tests d'intégration
══════════════════════════════════════════

[AUTH]
  ✓ POST /api/auth/login              200
  ✓ GET  /api/auth/me                 200  role=super_admin
  ✓ POST /api/auth/logout             200

[INVENTAIRE]
  ✓ POST /api/inventory               201  id=abc123
  ✓ GET  /api/inventory               200  total=N
  ✓ GET  /api/inventory/:id           200
  ✗ PATCH /api/inventory/:id          500  "Erreur serveur"

...

══════════════════════════════════════════
  14 / 16 tests passés  (2 échecs)
══════════════════════════════════════════
```

Exit code 0 si tout passe, 1 sinon.

---

## Suite 1 — super_admin (`test-integration.ts`)

Compte : `admin@vitalgrid.io` / `VitalGrid2026!`

| # | Méthode | Route | Assertion |
|---|---------|-------|-----------|
| 1 | POST | `/api/auth/login` | status 200, cookie vg_access présent |
| 2 | GET | `/api/auth/me` | status 200, `role === 'super_admin'` |
| 3 | GET | `/api/facilities` | status 200, `data` est un tableau |
| 4 | POST | `/api/facilities` | status 201, `id` présent → `facilityId` |
| 5 | GET | `/api/inventory` | status 200 |
| 6 | POST | `/api/inventory` | status 201, `id` présent → `resourceId` |
| 7 | GET | `/api/inventory/:id` | status 200, `name` contient `[TEST-INT]` |
| 8 | GET | `/api/inventory/low-stock` | status 200 |
| 9 | GET | `/api/inventory/expiry` | status 200 |
| 10 | POST | `/api/transfers` | status 201, `id` présent → `transferId` |
| 11 | GET | `/api/transfers` | status 200 |
| 12 | GET | `/api/transfers/:id` | status 200 |
| 13 | POST | `/api/transfers/:id/receive` | status 200 |
| 14 | GET | `/api/alerts` | status 200 |
| 15 | GET | `/api/admin/organizations` | status 200, tableau |
| 16 | GET | `/api/admin/users` | status 200 |
| 17 | GET | `/api/admin/platform-summary` | status 200 |
| 18 | GET | `/api/dashboard/summary` | status 200 |
| 19 | POST | `/api/auth/logout` | status 200 |
| 20 | GET | `/api/auth/me` (après logout) | status 401 |

---

## Suite 2 — autres rôles (`test-integration-roles.ts`)

Utilise les comptes créés par `seed-demo.ts` (mot de passe `Demo2026!`).

### facility_manager

Compte : `manager.ministere-de-la-sante-rdc.kinshasa@vitalgrid.io`

| Route | Attendu |
|-------|---------|
| POST `/api/auth/login` | 200 |
| GET `/api/auth/me` | role === `facility_manager` |
| GET `/api/inventory` | 200 |
| POST `/api/inventory` | 201 |
| GET `/api/transfers` | 200 |
| POST `/api/transfers` | 201 |
| GET `/api/admin/organizations` | **403** (accès refusé) |
| GET `/api/admin/platform-summary` | **403** |

### field_agent

Compte : à créer via `create-user.ts` avec rôle `field_agent`

| Route | Attendu |
|-------|---------|
| POST `/api/auth/login` | 200 |
| GET `/api/auth/me` | role === `field_agent` |
| GET `/api/inventory` | 200 |
| GET `/api/transfers` | 200 |
| GET `/api/admin/organizations` | **403** |

### ngo_coordinator

Compte : `admin.msf-congo@vitalgrid.io`

| Route | Attendu |
|-------|---------|
| POST `/api/auth/login` | 200 |
| GET `/api/auth/me` | role === `ngo_coordinator` |
| GET `/api/facilities` | 200 |
| GET `/api/transfers` | 200 |
| GET `/api/admin/organizations` | **403** |

### auditor

Compte : à créer via `create-user.ts` avec rôle `auditor`

| Route | Attendu |
|-------|---------|
| POST `/api/auth/login` | 200 |
| GET `/api/auth/me` | role === `auditor` |
| GET `/api/admin/audit-log` | 200 (s'il est accessible sans super_admin) |
| POST `/api/inventory` | **403** ou **401** (lecture seule) |

---

## Données de test requises

Avant de lancer les suites :
1. `admin@vitalgrid.io` doit exister avec `facility_id` non nul (sinon POST inventory échoue)
2. `seed-demo.ts` doit avoir tourné pour les comptes rôles secondaires
3. Pour `field_agent` et `auditor` : créer via `create-user.ts`

Le script affiche un avertissement clair si le login échoue (probablement données manquantes).

---

## Usage

```bash
# Serveur doit tourner
npm run dev

# Suite principale (super_admin)
npx tsx --env-file=.env.local scripts/test-integration.ts

# Suite rôles secondaires
npx tsx --env-file=.env.local scripts/test-integration-roles.ts
```

---

## Non couvert (hors scope)

- Tests DynamoDB cold-chain (nécessite setup séparé)
- Tests middleware RBAC (niveau Edge, non testable en fetch simple)
- Tests de charge / concurrence
- Tests UI / browser
