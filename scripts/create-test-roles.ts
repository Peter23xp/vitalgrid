// scripts/create-test-roles.ts
// Crée 4 comptes de test via l'API (pas besoin d'accès DSQL direct admin)
// Utilise POST /api/auth/login puis /api/admin/users/invite

const BASE        = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@vitalgrid.io';
const ADMIN_PASS  = 'VitalGrid2026!';

const TEST_USERS = [
  { email: 'test.facility-manager@vitalgrid.io', name: 'Test FM',    role: 'facility_manager'  },
  { email: 'test.field-agent@vitalgrid.io',       name: 'Test FA',    role: 'field_agent'        },
  { email: 'test.ngo-coordinator@vitalgrid.io',   name: 'Test NGO',   role: 'ngo_coordinator'    },
  { email: 'test.auditor@vitalgrid.io',            name: 'Test Audit', role: 'auditor'            },
];

async function apiFetch(path: string, opts: { method?: string; body?: unknown; cookie?: string } = {}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts.cookie) headers['Cookie'] = opts.cookie;

  const res = await globalThis.fetch(`${BASE}${path}`, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  const getSetCookie = (res.headers as any).getSetCookie as ((this: Headers) => string[]) | undefined;
  const rawCookies: string[] = getSetCookie ? getSetCookie.call(res.headers) : [];
  const cookie = rawCookies.map((c: string) => c.split(';')[0]).join('; ');

  let data: unknown = null;
  try { data = await res.json(); } catch { /* empty */ }

  return { status: res.status, data, cookie };
}

async function run() {
  console.log('\n→ Connexion admin...');

  const login = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: { email: ADMIN_EMAIL, password: ADMIN_PASS },
  });

  if (login.status !== 200) {
    console.error(`Échec login admin (${login.status}):`, login.data);
    process.exit(1);
  }

  const cookie = login.cookie;
  const orgId  = (login.data as { user: { orgId: string } }).user?.orgId;
  console.log(`✓ Connecté — orgId: ${orgId}\n`);

  const tempPasswords: Record<string, string> = {};

  for (const u of TEST_USERS) {
    const res = await apiFetch('/api/admin/users/invite', {
      method: 'POST',
      cookie,
      body: { email: u.email, name: u.name, role: u.role, orgId, password: 'TestRole2026!' },
    });

    if (res.status === 201) {
      const tmp = (res.data as { tempPassword?: string })?.tempPassword ?? '(envoyé par email)';
      tempPasswords[u.email] = tmp;
      console.log(`✓ ${u.role.padEnd(20)}  ${u.email}  mdp: ${tmp}`);
    } else if (res.status === 409) {
      console.log(`~ ${u.role.padEnd(20)}  ${u.email}  (déjà existant)`);
    } else {
      console.error(`✗ ${u.role.padEnd(20)}  ${u.email}  ERREUR ${res.status}:`, JSON.stringify(res.data));
    }
  }

  console.log('\nMot de passe pour tous les comptes de test : TestRole2026!\n');
}

run().catch(e => { console.error(e); process.exit(1); });
