// scripts/test-integration.ts
import { request, check, section, summary } from './_test-utils.ts';

const ADMIN_EMAIL    = 'admin@vitalgrid.io';
const ADMIN_PASSWORD = 'VitalGrid2026!';

async function run() {
  console.log('\n' + '═'.repeat(52));
  console.log('  VitalGrid — Tests d\'intégration (super_admin)');
  console.log('═'.repeat(52));

  let cookie    = '';
  let facilityId = '';
  let orgId      = '';
  let resourceId = '';
  let transferId = '';

  // ──────────────────────────────────────────────
  section('AUTH');
  // ──────────────────────────────────────────────

  const login = await request('/api/auth/login', {
    method: 'POST',
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  check('POST /api/auth/login', login.status === 200, `status=${login.status}`);
  check('  → cookie vg_access présent', login.cookie.includes('vg_access'));

  if (login.status !== 200) {
    console.error('\n\x1b[31mErreur fatale: login impossible. Vérifie que le compte admin existe et que le serveur tourne.\x1b[0m\n');
    process.exit(1);
  }

  cookie     = login.cookie;
  const user = (login.data as { user: { facilityId: string; orgId: string; role: string } }).user;
  facilityId = user?.facilityId ?? '';
  orgId      = user?.orgId ?? '';

  const me = await request('/api/auth/me', { cookie });
  check('GET  /api/auth/me', me.status === 200, `role=${(me.data as { role?: string })?.role}`);
  check('  → role === super_admin', (me.data as { role?: string })?.role === 'super_admin');

  // ──────────────────────────────────────────────
  section('FACILITIES');
  // ──────────────────────────────────────────────

  const facList = await request('/api/facilities', { cookie });
  check('GET  /api/facilities', facList.status === 200);

  const facCreate = await request('/api/facilities', {
    method: 'POST',
    cookie,
    body: {
      name:         '[TEST-INT] Poste de Santé Test',
      type:         'Poste de Santé',
      country_code: 'CD',
      org_id:       orgId,
    },
  });
  check('POST /api/facilities', facCreate.status === 201, `status=${facCreate.status}`);

  // ──────────────────────────────────────────────
  section('INVENTAIRE');
  // ──────────────────────────────────────────────

  if (!facilityId) {
    console.warn('\n  \x1b[33m⚠ facilityId absent du JWT — POST /api/inventory va échouer.\x1b[0m');
    console.warn('  Exécute: npx tsx --env-file=.env.local scripts/seed-facility.ts admin@vitalgrid.io\n');
  }

  const invList = await request('/api/inventory', { cookie });
  check('GET  /api/inventory', invList.status === 200);

  const invCreate = await request('/api/inventory', {
    method: 'POST',
    cookie,
    body: {
      facility_id:     facilityId,
      name:            '[TEST-INT] Vaccin Test',
      category:        'vaccins',
      unit_of_measure: 'dose',
      alert_threshold: 10,
    },
  });
  check('POST /api/inventory', invCreate.status === 201, `status=${invCreate.status}`);
  resourceId = (invCreate.data as { id?: string })?.id ?? '';
  check('  → id présent dans réponse', !!resourceId);

  if (resourceId) {
    const invGet = await request(`/api/inventory/${resourceId}`, { cookie });
    check('GET  /api/inventory/:id', invGet.status === 200);
    check(
      '  → name contient [TEST-INT]',
      ((invGet.data as { name?: string })?.name ?? '').includes('[TEST-INT]')
    );
  }

  const lowStock = await request(
    `/api/inventory/low-stock${facilityId ? `?facilityId=${facilityId}` : ''}`,
    { cookie }
  );
  check('GET  /api/inventory/low-stock', lowStock.status === 200, `status=${lowStock.status}`);

  const expiry = await request(
    `/api/inventory/expiry${facilityId ? `?facilityId=${facilityId}` : ''}`,
    { cookie }
  );
  check('GET  /api/inventory/expiry', expiry.status === 200, `status=${expiry.status}`);

  // ──────────────────────────────────────────────
  section('TRANSFERTS');
  // ──────────────────────────────────────────────

  if (resourceId && facilityId) {
    const trCreate = await request('/api/transfers', {
      method: 'POST',
      cookie,
      body: {
        resource_id:            resourceId,
        quantity:               5,
        requesting_facility_id: facilityId,
        priority:               'NORMALE',
        motif:                  '[TEST-INT] Test automatique',
      },
    });
    check('POST /api/transfers', trCreate.status === 201, `status=${trCreate.status}`);
    transferId = (trCreate.data as { id?: string })?.id ?? '';
    check('  → id présent dans réponse', !!transferId);
  } else {
    check('POST /api/transfers', false, 'skipped (resourceId ou facilityId manquant)');
    check('  → id présent dans réponse', false, 'skipped');
  }

  const trList = await request('/api/transfers', { cookie });
  check('GET  /api/transfers', trList.status === 200);

  if (transferId) {
    const trGet = await request(`/api/transfers/${transferId}`, { cookie });
    check('GET  /api/transfers/:id', trGet.status === 200);

    const trPatch = await request(`/api/transfers/${transferId}`, {
      method: 'PATCH',
      cookie,
      body: { status: 'in_transit' },
    });
    check('PATCH /api/transfers/:id (→ in_transit)', trPatch.status === 200, `status=${trPatch.status}`);

    const trReceive = await request(`/api/transfers/${transferId}/receive`, {
      method: 'POST',
      cookie,
      body: {
        received_qty:    5,
        packaging_ok:    true,
        condition:       'bon',
        receipt_notes:   '[TEST-INT]',
      },
    });
    check('POST /api/transfers/:id/receive', trReceive.status === 200, `status=${trReceive.status}`);
  } else {
    check('GET  /api/transfers/:id',           false, 'skipped (transferId manquant)');
    check('PATCH /api/transfers/:id',          false, 'skipped');
    check('POST /api/transfers/:id/receive',   false, 'skipped');
  }

  // ──────────────────────────────────────────────
  section('ALERTES');
  // ──────────────────────────────────────────────

  const alerts = await request('/api/alerts', { cookie });
  check('GET  /api/alerts', alerts.status === 200, `status=${alerts.status}`);

  // ──────────────────────────────────────────────
  section('DASHBOARD');
  // ──────────────────────────────────────────────

  const dash = await request(
    `/api/dashboard/summary${facilityId ? `?facilityId=${facilityId}` : ''}`,
    { cookie }
  );
  check('GET  /api/dashboard/summary', dash.status === 200, `status=${dash.status}`);

  // ──────────────────────────────────────────────
  section('ADMIN (super_admin only)');
  // ──────────────────────────────────────────────

  const adminOrgs = await request('/api/admin/organizations', { cookie });
  check('GET  /api/admin/organizations', adminOrgs.status === 200, `status=${adminOrgs.status}`);

  const adminUsers = await request('/api/admin/users', { cookie });
  check('GET  /api/admin/users', adminUsers.status === 200, `status=${adminUsers.status}`);

  const platformSum = await request('/api/admin/platform-summary', { cookie });
  check('GET  /api/admin/platform-summary', platformSum.status === 200, `status=${platformSum.status}`);

  // ──────────────────────────────────────────────
  section('LOGOUT');
  // ──────────────────────────────────────────────

  const logout = await request('/api/auth/logout', { method: 'POST', cookie });
  check('POST /api/auth/logout', logout.status === 200, `status=${logout.status}`);

  // Après logout, on envoie aucun cookie — le serveur doit rejeter avec 401
  const meAfter = await request('/api/auth/me');
  check('GET  /api/auth/me après logout → 401', meAfter.status === 401, `status=${meAfter.status}`);

  summary();
}

run().catch(e => { console.error('\x1b[31mErreur fatale:\x1b[0m', e.message); process.exit(1); });
