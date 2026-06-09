# VitalGrid — Auth + Multi-tenant + RBAC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implémenter l'authentification email/password JWT httpOnly cookie, la résolution multi-tenant depuis le JWT, et la protection des routes par rôle via middleware Next.js.

**Architecture:** `jose` signe les JWT stockés en httpOnly cookies. Le middleware Next.js vérifie le JWT sur chaque requête protégée sans appel DB. Le `tenantId` est extrait du JWT au lieu d'un env var public. Un `AuthContext` React expose le profil utilisateur côté client.

**Tech Stack:** Next.js 16 App Router, Aurora DSQL, `jose`, `bcryptjs`, CSS Modules

---

## Task 0 : Installer les dépendances

**Files:**
- Modify: `package.json` (via npm)

- [ ] Installer :

```bash
npm install jose bcryptjs
npm install --save-dev @types/bcryptjs
```

- [ ] Vérifier :

```bash
npm list jose bcryptjs
```

Résultat attendu : `jose@5.x.x` et `bcryptjs@2.x.x` listés.

- [ ] Build check : `npm run build`

---

## Task 1 : Migration DSQL — colonnes auth sur users

**Files:**
- Create: `scripts/migrate-auth.ts`

- [ ] Créer `scripts/migrate-auth.ts` :

```typescript
import { DsqlSigner } from '@aws-sdk/dsql-signer';
import { Client } from 'pg';

const ENDPOINT = process.env.DSQL_CLUSTER_ENDPOINT!;
const REGION   = process.env.DSQL_REGION ?? 'us-east-1';

async function run() {
  const signer = new DsqlSigner({ hostname: ENDPOINT, region: REGION });
  const token  = await signer.getDbConnectAdminAuthToken();

  const client = new Client({
    host: ENDPOINT, port: 5432, database: 'postgres',
    user: 'admin', password: token,
    ssl: { rejectUnauthorized: true },
  });
  await client.connect();
  console.log('Connected to Aurora DSQL');

  const migrations = [
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(100)`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ`,
  ];

  for (const sql of migrations) {
    const col = sql.match(/ADD COLUMN\s+(?:IF NOT EXISTS\s+)?(\w+)/)?.[1] ?? '?';
    try {
      await client.query(sql);
      console.log(`  ✓ ${col}`);
    } catch (e: unknown) {
      console.error(`  ✗ ${col}: ${(e as Error).message}`);
    }
  }

  await client.end();
  console.log('\n✅ Migration auth complete\n');
}

run().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] Lancer la migration :

```bash
npx tsx --env-file=.env.local scripts/migrate-auth.ts
```

Résultat attendu :
```
Connected to Aurora DSQL
  ✓ password_hash
  ✓ failed_login_attempts
  ✓ locked_until

✅ Migration auth complete
```

---

## Task 2 : `src/lib/auth.ts` — helpers JWT

**Files:**
- Create: `src/lib/auth.ts`

- [ ] Créer `src/lib/auth.ts` :

```typescript
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import type { Role } from '@/lib/types';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export interface SessionPayload extends JWTPayload {
  userId:     string;
  tenantId:   string;
  orgId:      string;
  facilityId: string | null;
  role:       Role;
  email:      string;
  name:       string;
}

export async function signAccessToken(payload: Omit<SessionPayload, keyof JWTPayload>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);
}

export async function signRefreshToken(
  userId: string,
  rememberMe: boolean
): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(rememberMe ? '30d' : '24h')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get('vg_access')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function setAuthCookies(
  res: NextResponse,
  accessToken: string,
  refreshToken: string,
  rememberMe: boolean
): void {
  const secure  = process.env.NODE_ENV === 'production';
  const base    = { httpOnly: true, secure, sameSite: 'strict' as const, path: '/' };

  res.cookies.set('vg_access',  accessToken,  { ...base, maxAge: 3600 });
  res.cookies.set('vg_refresh', refreshToken, {
    ...base,
    path:   '/api/auth/refresh',
    maxAge: rememberMe ? 30 * 24 * 3600 : 24 * 3600,
  });
}

export function clearAuthCookies(res: NextResponse): void {
  res.cookies.set('vg_access',  '', { httpOnly: true, maxAge: 0, path: '/' });
  res.cookies.set('vg_refresh', '', { httpOnly: true, maxAge: 0, path: '/api/auth/refresh' });
}

export function roleRedirect(role: Role): string {
  const map: Record<Role, string> = {
    super_admin:       '/dashboard/admin',
    facility_manager:  '/dashboard',
    field_agent:       '/dashboard/field',
    ngo_coordinator:   '/dashboard/ngo',
    auditor:           '/analytics/map',
  };
  return map[role] ?? '/dashboard';
}
```

- [ ] Build check : `npm run build`

---

## Task 3 : `src/lib/repos/auth.ts` — requêtes DSQL pour auth

**Files:**
- Create: `src/lib/repos/auth.ts`

- [ ] Créer `src/lib/repos/auth.ts` :

```typescript
import { queryOne, transact } from '@/lib/db';
import type { Role } from '@/lib/types';

export interface AuthUser {
  id:                     string;
  email:                  string;
  name:                   string;
  role:                   Role;
  tenant_id:              string;
  org_id:                 string;
  facility_id:            string | null;
  password_hash:          string | null;
  status:                 string;
  failed_login_attempts:  number;
  locked_until:           string | null;
}

export async function findUserByEmail(email: string): Promise<AuthUser | null> {
  return queryOne<AuthUser>(
    `SELECT id, email, name, role, tenant_id, org_id, facility_id,
            password_hash, status, failed_login_attempts, locked_until
     FROM users WHERE email = $1`,
    [email]
  );
}

export async function incrementFailedAttempts(userId: string): Promise<void> {
  await transact(async (client) => {
    await client.query(
      `UPDATE users
       SET failed_login_attempts = failed_login_attempts + 1,
           locked_until = CASE
             WHEN failed_login_attempts + 1 >= 5
             THEN NOW() + INTERVAL '30 minutes'
             ELSE locked_until
           END,
           updated_at = NOW()
       WHERE id = $1`,
      [userId]
    );
  });
}

export async function resetFailedAttempts(userId: string): Promise<void> {
  await transact(async (client) => {
    await client.query(
      `UPDATE users SET failed_login_attempts = 0, locked_until = NULL, updated_at = NOW()
       WHERE id = $1`,
      [userId]
    );
  });
}
```

- [ ] Build check : `npm run build`

---

## Task 4 : Routes API auth

**Files:**
- Create: `src/app/api/auth/login/route.ts`
- Create: `src/app/api/auth/logout/route.ts`
- Create: `src/app/api/auth/refresh/route.ts`
- Create: `src/app/api/auth/me/route.ts`

- [ ] Créer `src/app/api/auth/login/route.ts` :

```typescript
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUserByEmail, incrementFailedAttempts, resetFailedAttempts } from '@/lib/repos/auth';
import { signAccessToken, signRefreshToken, setAuthCookies, roleRedirect } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, password, rememberMe = false } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
  }

  const user = await findUserByEmail(email.toLowerCase().trim());

  if (!user || !user.password_hash) {
    return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
  }

  if (user.status === 'disabled') {
    return NextResponse.json({ error: 'Compte désactivé' }, { status: 423 });
  }

  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    const until = new Date(user.locked_until).toLocaleTimeString('fr-FR');
    return NextResponse.json(
      { error: `Compte verrouillé jusqu'à ${until}` },
      { status: 423 }
    );
  }

  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) {
    await incrementFailedAttempts(user.id);
    return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
  }

  await resetFailedAttempts(user.id);

  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({
      userId:     user.id,
      tenantId:   user.tenant_id,
      orgId:      user.org_id,
      facilityId: user.facility_id,
      role:       user.role,
      email:      user.email,
      name:       user.name,
    }),
    signRefreshToken(user.id, rememberMe),
  ]);

  const res = NextResponse.json({
    user: {
      id:         user.id,
      name:       user.name,
      email:      user.email,
      role:       user.role,
      facilityId: user.facility_id,
      orgId:      user.org_id,
      tenantId:   user.tenant_id,
    },
    redirectTo: roleRedirect(user.role),
  });

  setAuthCookies(res, accessToken, refreshToken, rememberMe);
  return res;
}
```

- [ ] Créer `src/app/api/auth/logout/route.ts` :

```typescript
import { NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/auth';

export async function POST() {
  const res = NextResponse.json({ success: true });
  clearAuthCookies(res);
  return res;
}
```

- [ ] Créer `src/app/api/auth/refresh/route.ts` :

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, signAccessToken, getSession } from '@/lib/auth';
import { findUserByEmail } from '@/lib/repos/auth';
import { queryOne } from '@/lib/db';
import type { Role } from '@/lib/types';

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('vg_refresh')?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: 'Refresh token manquant' }, { status: 401 });
  }

  const payload = await verifyToken(refreshToken);
  if (!payload || !payload.userId) {
    return NextResponse.json({ error: 'Refresh token invalide' }, { status: 401 });
  }

  const user = await queryOne<{
    id: string; email: string; name: string; role: Role;
    tenant_id: string; org_id: string; facility_id: string | null; status: string;
  }>(
    `SELECT id, email, name, role, tenant_id, org_id, facility_id, status
     FROM users WHERE id = $1`,
    [payload.userId as string]
  );

  if (!user || user.status !== 'active') {
    return NextResponse.json({ error: 'Utilisateur inactif' }, { status: 401 });
  }

  const accessToken = await signAccessToken({
    userId:     user.id,
    tenantId:   user.tenant_id,
    orgId:      user.org_id,
    facilityId: user.facility_id,
    role:       user.role,
    email:      user.email,
    name:       user.name,
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

- [ ] Créer `src/app/api/auth/me/route.ts` :

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  return NextResponse.json({
    id:         session.userId,
    email:      session.email,
    name:       session.name,
    role:       session.role,
    tenantId:   session.tenantId,
    orgId:      session.orgId,
    facilityId: session.facilityId,
  });
}
```

- [ ] Build check : `npm run build`
- [ ] Commit :

```bash
git add src/lib/auth.ts src/lib/repos/auth.ts src/app/api/auth/
git commit -m "feat: JWT auth helpers and API routes (login, logout, refresh, me)"
```

---

## Task 5 : `src/middleware.ts` — protection des routes

**Files:**
- Create: `src/middleware.ts`

- [ ] Créer `src/middleware.ts` :

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import type { Role } from '@/lib/types';

const PUBLIC_PATHS = ['/login', '/forgot-password', '/api/auth'];

const ROLE_ROUTES: Array<{ pattern: RegExp; roles: Role[] }> = [
  { pattern: /^\/dashboard\/admin/, roles: ['super_admin'] },
  { pattern: /^\/admin/,            roles: ['super_admin'] },
  { pattern: /^\/dashboard\/ngo/,   roles: ['ngo_coordinator', 'super_admin'] },
  { pattern: /^\/dashboard\/field/, roles: ['field_agent', 'super_admin'] },
  { pattern: /^\/analytics/,        roles: ['facility_manager', 'ngo_coordinator', 'auditor', 'super_admin'] },
  { pattern: /^\/facilities/,       roles: ['ngo_coordinator', 'facility_manager', 'super_admin'] },
];

const ROLE_DASHBOARDS: Record<Role, string> = {
  super_admin:      '/dashboard/admin',
  facility_manager: '/dashboard',
  field_agent:      '/dashboard/field',
  ngo_coordinator:  '/dashboard/ngo',
  auditor:          '/analytics/map',
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Routes publiques — laisser passer
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Fichiers statiques — laisser passer
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const token = req.cookies.get('vg_access')?.value;

  // Pas de token → login
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  const session = await verifyToken(token);

  // Token invalide ou expiré → tenter refresh puis login
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

  // Vérifier les restrictions par rôle
  for (const { pattern, roles } of ROLE_ROUTES) {
    if (pattern.test(pathname) && !roles.includes(session.role as Role)) {
      const url = req.nextUrl.clone();
      url.pathname = ROLE_DASHBOARDS[session.role as Role] ?? '/dashboard';
      url.searchParams.delete('next');
      return NextResponse.redirect(url);
    }
  }

  // Utilisateur connecté qui accède à /login → redirect son dashboard
  if (pathname === '/login' || pathname === '/') {
    const url = req.nextUrl.clone();
    url.pathname = ROLE_DASHBOARDS[session.role as Role] ?? '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

- [ ] Build check : `npm run build`
- [ ] Commit :

```bash
git add src/middleware.ts
git commit -m "feat: Next.js middleware — JWT route protection + RBAC"
```

---

## Task 6 : `src/lib/tenant.ts` — lire le JWT au lieu du header

**Files:**
- Modify: `src/lib/tenant.ts`

- [ ] Remplacer le contenu de `src/lib/tenant.ts` par :

```typescript
import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';

export async function requireTenant(req: NextRequest): Promise<string> {
  const session = await getSession(req);
  if (!session) throw new Error('ERR_UNAUTHENTICATED');
  return session.tenantId as string;
}

export async function requireSession(req: NextRequest) {
  const session = await getSession(req);
  if (!session) throw new Error('ERR_UNAUTHENTICATED');
  return session;
}
```

- [ ] Toutes les routes API utilisent `requireTenant(req)` — c'est déjà le cas. Mais `requireTenant` était synchrone, il devient **async**. Mettre à jour toutes les routes qui l'appellent pour `await requireTenant(req)`.

Les routes concernées ont déjà `try/catch` et font `const tenantId = requireTenant(req)`. Remplacer par `const tenantId = await requireTenant(req)` dans :
- `src/app/api/inventory/route.ts`
- `src/app/api/inventory/[id]/route.ts`
- `src/app/api/inventory/[id]/batches/route.ts`
- `src/app/api/inventory/[id]/movements/route.ts`
- `src/app/api/inventory/low-stock/route.ts`
- `src/app/api/inventory/expiry/route.ts`
- `src/app/api/transfers/route.ts`
- `src/app/api/transfers/[id]/route.ts`
- `src/app/api/transfers/[id]/receive/route.ts`
- `src/app/api/alerts/route.ts`
- `src/app/api/alerts/[id]/read/route.ts`
- `src/app/api/dashboard/summary/route.ts`
- `src/app/api/facilities/route.ts`
- `src/app/api/facilities/[id]/route.ts`
- `src/app/api/admin/users/route.ts`
- `src/app/api/admin/audit-log/route.ts`

Remplacer aussi le message d'erreur : `'ERR_NO_TENANT'` → `'ERR_UNAUTHENTICATED'` dans les catch de toutes ces routes.

- [ ] Build check : `npm run build`
- [ ] Commit :

```bash
git add src/lib/tenant.ts src/app/api/
git commit -m "feat: tenant resolved from JWT session instead of x-tenant-id header"
```

---

## Task 7 : `src/lib/api-client.ts` — supprimer le header manuel

**Files:**
- Modify: `src/lib/api-client.ts`

- [ ] Remplacer le contenu de `src/lib/api-client.ts` par :

```typescript
export function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  return fetch(path, {
    ...init,
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  }).then(async (res) => {
    if (res.status === 401) {
      window.location.href = '/login';
      throw new Error('Non authentifié');
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  });
}
```

- [ ] Build check : `npm run build`

---

## Task 8 : `src/contexts/auth.tsx` — AuthContext

**Files:**
- Create: `src/contexts/auth.tsx`

- [ ] Créer `src/contexts/auth.tsx` :

```typescript
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import type { Role } from '@/lib/types';

export interface AuthUser {
  id:         string;
  email:      string;
  name:       string;
  role:       Role;
  tenantId:   string;
  orgId:      string;
  facilityId: string | null;
}

interface AuthContextValue {
  user:    AuthUser | null;
  loading: boolean;
  logout:  () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null, loading: true, logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    apiFetch<AuthUser>('/api/auth/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
```

- [ ] Modifier `src/app/dashboard/layout.tsx` — envelopper `children` avec `AuthProvider` :

```tsx
// Ajouter l'import en haut du fichier :
import { AuthProvider } from '@/contexts/auth';

// Envelopper le contenu du return :
// Remplacer : <main className={styles.pageContent}>{children}</main>
// Par :
<AuthProvider>
  <main className={styles.pageContent}>{children}</main>
</AuthProvider>
```

- [ ] Build check : `npm run build`
- [ ] Commit :

```bash
git add src/contexts/auth.tsx src/app/dashboard/layout.tsx src/lib/api-client.ts
git commit -m "feat: AuthContext provider + apiFetch cleanup"
```

---

## Task 9 : Page login — formulaire fonctionnel

**Files:**
- Modify: `src/app/login/page.tsx`

- [ ] Remplacer `src/app/login/page.tsx` par :

```tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock } from 'lucide-react';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPwd, setShowPwd]       = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method:      'POST',
        credentials: 'same-origin',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Erreur de connexion');
        return;
      }

      router.push(data.redirectTo ?? '/dashboard');
    } catch {
      setError('Erreur réseau — vérifiez votre connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <span className={styles.brandAccent}>Vital</span><span>Grid</span>
          </h1>
          <p className={styles.subtitle}>Réseau Global de Ressources Critiques</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid var(--status-error)',
              borderRadius: 8, padding: '10px 14px', fontSize: 13,
              color: 'var(--status-error)', marginBottom: 4,
            }}>
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Adresse email professionnelle</label>
            <input
              type="email" id="email" name="email"
              className="input-field"
              placeholder="votre.nom@organisation.org"
              required autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Mot de passe</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPwd ? 'text' : 'password'}
                id="password" name="password"
                className="input-field"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button type="button" className={styles.togglePassword} onClick={() => setShowPwd((v) => !v)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className={styles.formOptions}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" name="remember" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              <span>Se souvenir 30 jours</span>
            </label>
            <Link href="/forgot-password" className={styles.forgotLink}>
              Mot de passe oublié?
            </Link>
          </div>

          <button
            type="submit"
            className={`btn-primary ${styles.submitBtn}`}
            disabled={loading || !email || !password}
          >
            {loading ? 'Connexion...' : 'SE CONNECTER'}
          </button>

          <div className={styles.divider}><span>Connexion SSO</span></div>

          <button type="button" className={styles.ssoBtn} disabled>
            Continuer avec SAML/SSO
          </button>
        </form>

        <div className={styles.footer}>
          <span className={styles.secureBadge}>
            <Lock size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            Connexion chiffrée TLS 1.3
          </span>
          <span className={styles.version}>VitalGrid v1.0.0</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] Build check : `npm run build`

---

## Task 10 : Script `create-user` — seed du premier compte

**Files:**
- Create: `scripts/create-user.ts`

- [ ] Créer `scripts/create-user.ts` :

```typescript
import { DsqlSigner } from '@aws-sdk/dsql-signer';
import { Client } from 'pg';
import bcrypt from 'bcryptjs';
import type { Role } from '../src/lib/types';

const ENDPOINT = process.env.DSQL_CLUSTER_ENDPOINT!;
const REGION   = process.env.DSQL_REGION ?? 'us-east-1';

async function run() {
  const args = process.argv.slice(2);
  const get  = (flag: string) => args[args.indexOf(flag) + 1];

  const email    = get('--email');
  const password = get('--password');
  const role     = (get('--role') ?? 'super_admin') as Role;
  const orgName  = get('--org-name') ?? 'VitalGrid';
  const name     = get('--name') ?? 'Admin';

  if (!email || !password) {
    console.error('Usage: npx tsx --env-file=.env.local scripts/create-user.ts --email X --password Y [--role Z] [--org-name N] [--name N]');
    process.exit(1);
  }

  const signer = new DsqlSigner({ hostname: ENDPOINT, region: REGION });
  const token  = await signer.getDbConnectAdminAuthToken();

  const client = new Client({
    host: ENDPOINT, port: 5432, database: 'postgres',
    user: 'admin', password: token,
    ssl: { rejectUnauthorized: true },
  });
  await client.connect();

  // Créer l'organisation si elle n'existe pas
  const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 100);
  const orgRes = await client.query(
    `INSERT INTO organizations (name, type, country_code, regions, slug)
     VALUES ($1, 'gouvernement', 'XX', '[]', $2)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [orgName, slug]
  );
  const orgId    = orgRes.rows[0].id;
  const tenantId = orgId;

  // Hasher le mot de passe
  const password_hash = await bcrypt.hash(password, 12);

  // Créer l'utilisateur
  const userRes = await client.query(
    `INSERT INTO users (tenant_id, org_id, email, name, role, password_hash, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'active')
     ON CONFLICT (email) DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       role          = EXCLUDED.role,
       status        = 'active'
     RETURNING id, email, role`,
    [tenantId, orgId, email.toLowerCase(), name, role, password_hash]
  );

  const user = userRes.rows[0];
  await client.end();

  console.log('\n✅ Utilisateur créé');
  console.log(`   Email    : ${user.email}`);
  console.log(`   Rôle     : ${user.role}`);
  console.log(`   Org ID   : ${orgId}`);
  console.log(`   Tenant ID: ${tenantId}`);
  console.log('\n  → Connecte-toi sur http://localhost:3000/login\n');
}

run().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] Créer le premier compte admin :

```bash
npx tsx --env-file=.env.local scripts/create-user.ts \
  --email admin@vitalgrid.io \
  --password VitalGrid2026! \
  --role super_admin \
  --org-name "VitalGrid" \
  --name "Admin VitalGrid"
```

Résultat attendu :
```
✅ Utilisateur créé
   Email    : admin@vitalgrid.io
   Rôle     : super_admin
   Org ID   : <uuid>
   Tenant ID: <uuid>
```

- [ ] Mettre à jour `.env.local` avec les vrais UUIDs retournés :

```
NEXT_PUBLIC_TENANT_ID=<org-id retourné>
NEXT_PUBLIC_FACILITY_ID=  ← laisser vide pour l'instant
```

- [ ] Build check : `npm run build`
- [ ] Commit final :

```bash
git add scripts/ src/app/login/page.tsx
git commit -m "feat: login page wired, create-user seed script, auth migration"
```

---

## Test de bout en bout

```bash
npm run dev
```

1. Naviguer vers `http://localhost:3000` → redirect `/login` (middleware)
2. Se connecter avec `admin@vitalgrid.io` / `VitalGrid2026!`
3. Redirect automatique vers `/dashboard/admin`
4. Vérifier dans DevTools → Application → Cookies : `vg_access` httpOnly present
5. Naviguer vers `/dashboard/field` → redirect `/dashboard/admin` (mauvais rôle)
6. Naviguer vers `/api/auth/me` → `{ id, email, role: "super_admin", ... }`
7. Cliquer logout → redirect `/login`, cookies effacés
