// scripts/test-integration-roles.ts
import { request, check, section, summary } from './_test-utils.ts';

const PASSWORD = 'TestRole2026!';

interface RoleCtx {
  cookie:     string;
  facilityId: string;
  orgId:      string;
  role:       string;
}

async function loginAs(email: string): Promise<RoleCtx | null> {
  const res = await request('/api/auth/login', {
    method: 'POST',
    body: { email, password: PASSWORD },
  });
  if (res.status !== 200) {
    console.warn(`  \x1b[33m⚠ Login échoué pour ${email} (${res.status}) — suite ignorée\x1b[0m`);
    return null;
  }
  const user = (res.data as { user: { facilityId: string; orgId: string; role: string } }).user;
  return {
    cookie:     res.cookie,
    facilityId: user?.facilityId ?? '',
    orgId:      user?.orgId ?? '',
    role:       user?.role ?? '',
  };
}

async function testFacilityManager() {
  section('FACILITY_MANAGER');
  const ctx = await loginAs('test.facility-manager@vitalgrid.io');
  if (!ctx) { check('facility_manager — login', false, 'compte absent → exécuter create-test-roles.ts'); return; }

  check('POST /api/auth/login',            true,                       `role=${ctx.role}`);
  check('  → role === facility_manager',   ctx.role === 'facility_manager');

  const inv = await request('/api/inventory', { cookie: ctx.cookie });
  check('GET  /api/inventory',             inv.status === 200,         `status=${inv.status}`);

  const fac = await request('/api/facilities', { cookie: ctx.cookie });
  check('GET  /api/facilities',            fac.status === 200,         `status=${fac.status}`);

  const tr = await request('/api/transfers', { cookie: ctx.cookie });
  check('GET  /api/transfers',             tr.status === 200,          `status=${tr.status}`);

  if (ctx.facilityId) {
    const create = await request('/api/inventory', {
      method: 'POST',
      cookie: ctx.cookie,
      body: {
        facility_id:     ctx.facilityId,
        name:            '[TEST-INT][FM] Item Test',
        category:        'medicaments',
        unit_of_measure: 'comprimé',
      },
    });
    check('POST /api/inventory (FM peut créer)', create.status === 201, `status=${create.status}`);
  }

  const adminOrgs = await request('/api/admin/organizations', { cookie: ctx.cookie });
  check('GET  /api/admin/organizations → 403', adminOrgs.status === 403, `status=${adminOrgs.status}`);

  const adminPlatform = await request('/api/admin/platform-summary', { cookie: ctx.cookie });
  check('GET  /api/admin/platform-summary → 403', adminPlatform.status === 403, `status=${adminPlatform.status}`);

  await request('/api/auth/logout', { method: 'POST', cookie: ctx.cookie });
}

async function testFieldAgent() {
  section('FIELD_AGENT');
  const ctx = await loginAs('test.field-agent@vitalgrid.io');
  if (!ctx) { check('field_agent — login', false, 'compte absent → exécuter create-test-roles.ts'); return; }

  check('POST /api/auth/login',            true,                     `role=${ctx.role}`);
  check('  → role === field_agent',        ctx.role === 'field_agent');

  const inv = await request('/api/inventory', { cookie: ctx.cookie });
  check('GET  /api/inventory',             inv.status === 200,       `status=${inv.status}`);

  const tr = await request('/api/transfers', { cookie: ctx.cookie });
  check('GET  /api/transfers',             tr.status === 200,        `status=${tr.status}`);

  const adminOrgs = await request('/api/admin/organizations', { cookie: ctx.cookie });
  check('GET  /api/admin/organizations → 403', adminOrgs.status === 403, `status=${adminOrgs.status}`);

  const adminUsers = await request('/api/admin/users', { cookie: ctx.cookie });
  check('GET  /api/admin/users (comportement)', [200, 403].includes(adminUsers.status), `status=${adminUsers.status}`);

  await request('/api/auth/logout', { method: 'POST', cookie: ctx.cookie });
}

async function testNgoCoordinator() {
  section('NGO_COORDINATOR');
  const ctx = await loginAs('test.ngo-coordinator@vitalgrid.io');
  if (!ctx) { check('ngo_coordinator — login', false, 'compte absent → exécuter create-test-roles.ts'); return; }

  check('POST /api/auth/login',            true,                           `role=${ctx.role}`);
  check('  → role === ngo_coordinator',    ctx.role === 'ngo_coordinator');

  const fac = await request('/api/facilities', { cookie: ctx.cookie });
  check('GET  /api/facilities',            fac.status === 200,             `status=${fac.status}`);

  const tr = await request('/api/transfers', { cookie: ctx.cookie });
  check('GET  /api/transfers',             tr.status === 200,              `status=${tr.status}`);

  const inv = await request('/api/inventory', { cookie: ctx.cookie });
  check('GET  /api/inventory',             inv.status === 200,             `status=${inv.status}`);

  const adminOrgs = await request('/api/admin/organizations', { cookie: ctx.cookie });
  check('GET  /api/admin/organizations → 403', adminOrgs.status === 403,  `status=${adminOrgs.status}`);

  await request('/api/auth/logout', { method: 'POST', cookie: ctx.cookie });
}

async function testAuditor() {
  section('AUDITOR');
  const ctx = await loginAs('test.auditor@vitalgrid.io');
  if (!ctx) { check('auditor — login', false, 'compte absent → exécuter create-test-roles.ts'); return; }

  check('POST /api/auth/login',            true,                   `role=${ctx.role}`);
  check('  → role === auditor',            ctx.role === 'auditor');

  const audit = await request('/api/admin/audit-log', { cookie: ctx.cookie });
  check('GET  /api/admin/audit-log',       audit.status === 200,   `status=${audit.status}`);

  const inv = await request('/api/inventory', { cookie: ctx.cookie });
  check('GET  /api/inventory',             inv.status === 200,     `status=${inv.status}`);

  const platform = await request('/api/admin/platform-summary', { cookie: ctx.cookie });
  check('GET  /api/admin/platform-summary → 403', platform.status === 403, `status=${platform.status}`);

  const adminOrgs = await request('/api/admin/organizations', { cookie: ctx.cookie });
  check('GET  /api/admin/organizations → 403', adminOrgs.status === 403, `status=${adminOrgs.status}`);

  await request('/api/auth/logout', { method: 'POST', cookie: ctx.cookie });
}

async function run() {
  console.log('\n' + '═'.repeat(52));
  console.log('  VitalGrid — Tests d\'intégration (tous rôles)');
  console.log('═'.repeat(52));

  await testFacilityManager();
  await testFieldAgent();
  await testNgoCoordinator();
  await testAuditor();

  summary();
}

run().catch(e => { console.error('\x1b[31mErreur fatale:\x1b[0m', e.message); process.exit(1); });
