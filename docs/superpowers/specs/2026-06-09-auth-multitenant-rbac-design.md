# VitalGrid — Auth + Multi-tenant + RBAC Design

## Goal

Implémenter l'authentification email/password avec JWT httpOnly cookies, la résolution multi-tenant depuis le JWT, et la protection des routes par rôle via middleware Next.js.

## Stack technique

- `jose` — génération et vérification JWT (léger, Edge-compatible)
- `bcryptjs` — hachage des mots de passe
- Next.js 16 `middleware.ts` — protection des routes sur Vercel Edge
- Aurora DSQL — table `users` (schéma à compléter)
- httpOnly cookies — stockage des tokens (jamais localStorage)

---

## Section 1 — Authentification

### Endpoints API

| Route | Méthode | Description |
|---|---|---|
| `/api/auth/login` | POST | Connexion email/password |
| `/api/auth/logout` | POST | Efface les cookies de session |
| `/api/auth/refresh` | POST | Renouvelle l'access token |
| `/api/auth/me` | GET | Profil de l'utilisateur connecté |

### Flux login

1. `POST /api/auth/login` reçoit `{ email, password, rememberMe? }`
2. Requête DSQL : `SELECT id, password_hash, role, tenant_id, org_id, facility_id, name, status FROM users WHERE email = $1`
3. Si `status = 'disabled'` ou `locked_until > NOW()` → erreur 423
4. `bcryptjs.compare(password, password_hash)` — si invalide : incrémenter `failed_login_attempts`, erreur 401
5. Si `failed_login_attempts >= 5` : poser `locked_until = NOW() + 30min`, erreur 423
6. Réinitialiser `failed_login_attempts = 0` en cas de succès
7. Générer avec `jose` :
   - `accessToken` : JWT signé HS256, expire `1h`, payload `{ sub: userId, tenantId, orgId, facilityId, role, email, name }`
   - `refreshToken` : JWT signé HS256, expire `24h` (ou `30d` si `rememberMe`)
8. Poser les cookies :
   - `vg_access` : httpOnly, Secure, SameSite=Strict, Path=/, MaxAge=3600
   - `vg_refresh` : httpOnly, Secure, SameSite=Strict, Path=/api/auth/refresh, MaxAge selon rememberMe
9. Retourner `{ user: { id, name, email, role, facilityId, orgId } }` (pas les tokens dans le body)
10. Redirect selon rôle : `super_admin→/dashboard/admin`, `facility_manager→/dashboard`, `field_agent→/dashboard/field`, `ngo_coordinator→/dashboard/ngo`, `auditor→/analytics/map`

### Flux logout

`POST /api/auth/logout` : efface `vg_access` et `vg_refresh` en posant des cookies expirés.

### Flux refresh

`POST /api/auth/refresh` : lit `vg_refresh`, vérifie la signature, génère un nouveau `vg_access`, le pose en cookie.

### Schéma DSQL — colonnes à ajouter à `users`

```sql
ALTER TABLE users ADD COLUMN password_hash VARCHAR(100);
ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN locked_until TIMESTAMPTZ;
```

### Fichiers

- `src/lib/auth.ts` — helpers JWT (sign, verify, getSession)
- `src/lib/repos/auth.ts` — requêtes DSQL pour login/register
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/app/api/auth/refresh/route.ts`
- `src/app/api/auth/me/route.ts`
- `src/app/login/page.tsx` — formulaire connecté (actuellement statique)
- `scripts/create-user.ts` — script pour créer le premier super_admin

---

## Section 2 — Multi-tenant depuis JWT

### Principe

Le `tenantId` est extrait du JWT `vg_access` côté serveur, pas depuis un env var public.

### `src/lib/auth.ts` — `getSession()`

```typescript
// Lit le cookie vg_access, vérifie le JWT, retourne le payload
export async function getSession(req: NextRequest): Promise<JWTPayload | null>
```

### `src/lib/tenant.ts` — mise à jour

Remplacer la lecture du header `x-tenant-id` par `getSession()` :

```typescript
export async function requireTenant(req: NextRequest): Promise<string> {
  const session = await getSession(req);
  if (!session) throw new Error('ERR_UNAUTHENTICATED');
  return session.tenantId as string;
}
```

### `src/lib/api-client.ts` — mise à jour

Supprimer l'injection manuelle de `x-tenant-id`. Le cookie `vg_access` est envoyé automatiquement par le navigateur (`credentials: 'same-origin'` par défaut). Retirer `NEXT_PUBLIC_TENANT_ID`.

### Variables `.env.local` à supprimer après implémentation

- `NEXT_PUBLIC_TENANT_ID` — remplacé par le JWT
- `NEXT_PUBLIC_FACILITY_ID` — remplacé par `session.facilityId` depuis `/api/auth/me`

---

## Section 3 — RBAC Middleware

### `src/middleware.ts`

Vérifie le JWT `vg_access` sur chaque requête protégée. S'exécute sur Vercel Edge (pas d'accès à DSQL — vérification JWT uniquement, pas de DB call).

### Matrice de protection

| Routes | Rôles autorisés | Redirect si refus |
|---|---|---|
| `/login`, `/forgot-password` | Public | — |
| `/api/auth/*` | Public | — |
| `/dashboard/admin`, `/admin/*` | `super_admin` | `/dashboard` |
| `/dashboard/ngo` | `ngo_coordinator`, `super_admin` | `/dashboard` |
| `/dashboard/field` | `field_agent`, `super_admin` | `/dashboard` |
| `/analytics/*` | `facility_manager`, `ngo_coordinator`, `auditor`, `super_admin` | `/dashboard` |
| `/facilities/*` | `ngo_coordinator`, `facility_manager`, `super_admin` | `/dashboard` |
| `/dashboard/*` | Tous les rôles authentifiés | `/login` |
| `/inventory/*` | `field_agent`+ | `/login` |
| `/transfers/*` | `field_agent`+ | `/login` |
| `/alerts/*` | `field_agent`+ | `/login` |

### Comportement

- Cookie absent ou JWT expiré → redirect `/login`
- JWT valide mais rôle insuffisant → redirect vers dashboard du rôle
- JWT expiré mais `vg_refresh` valide → le middleware redirige vers `/api/auth/refresh?next=<url>`

### `AuthContext` côté client

Un `React.Context` exposant `{ user, loading, logout }` wrappé autour du layout dashboard. Les pages qui ont des boutons conditionnels lisent `user.role` depuis ce contexte au lieu de hardcoder.

```typescript
// src/contexts/auth.tsx
interface AuthUser {
  id: string; email: string; name: string; role: Role;
  tenantId: string; orgId: string; facilityId: string | null;
}
```

---

## Sécurité

- Tokens jamais dans `localStorage` ou `sessionStorage`
- `JWT_SECRET` minimum 64 caractères (déjà en place)
- `bcryptjs` avec 12 rounds (déjà configuré)
- `SameSite=Strict` sur les cookies — protection CSRF
- Rate limiting : max 5 tentatives → verrouillage 30 min (géré en DSQL)
- Le middleware tourne sur Vercel Edge — aucun cold start

---

## Script de seed

`scripts/create-user.ts` — crée le premier compte super_admin directement en DSQL :

```
npx tsx --env-file=.env.local scripts/create-user.ts \
  --email admin@vitalgrid.io \
  --password <mot-de-passe> \
  --role super_admin \
  --org-name "VitalGrid"
```
