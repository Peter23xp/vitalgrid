// scripts/create-test-roles.ts
// Crée 4 comptes de test dans le même tenant que admin@vitalgrid.io
import { DsqlSigner } from '@aws-sdk/dsql-signer';
import { Client }     from 'pg';
import bcrypt         from 'bcryptjs';

const ENDPOINT = process.env.DSQL_CLUSTER_ENDPOINT!;
const REGION   = process.env.DSQL_REGION ?? 'us-east-1';
const ADMIN    = 'admin@vitalgrid.io';
const PASSWORD = 'TestRole2026!';

const TEST_USERS = [
  { email: 'test.facility-manager@vitalgrid.io', name: 'Test FM',    role: 'facility_manager',  needFacility: true  },
  { email: 'test.field-agent@vitalgrid.io',       name: 'Test FA',    role: 'field_agent',        needFacility: true  },
  { email: 'test.ngo-coordinator@vitalgrid.io',   name: 'Test NGO',   role: 'ngo_coordinator',    needFacility: false },
  { email: 'test.auditor@vitalgrid.io',            name: 'Test Audit', role: 'auditor',            needFacility: false },
];

async function run() {
  const signer = new DsqlSigner({ hostname: ENDPOINT, region: REGION });
  const token  = await signer.getDbConnectAdminAuthToken();
  const client = new Client({
    host: ENDPOINT, port: 5432, database: 'postgres',
    user: 'admin', password: token, ssl: { rejectUnauthorized: true },
  });
  await client.connect();

  // Récupérer le contexte de l'admin
  const adminRow = await client.query(
    `SELECT tenant_id, org_id, facility_id FROM users WHERE email = $1`,
    [ADMIN]
  );
  if (adminRow.rowCount === 0) {
    console.error(`Admin "${ADMIN}" introuvable.`);
    process.exit(1);
  }
  const { tenant_id, org_id, facility_id } = adminRow.rows[0];
  const hash = await bcrypt.hash(PASSWORD, 12);

  console.log(`\n→ Tenant : ${tenant_id}`);
  console.log(`→ Org    : ${org_id}`);
  console.log(`→ Facility: ${facility_id ?? '(aucune)'}\n`);

  for (const u of TEST_USERS) {
    const fid = u.needFacility ? facility_id : null;
    await client.query(
      `INSERT INTO users
         (tenant_id, org_id, facility_id, email, name, role, password_hash, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'active')
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         role          = EXCLUDED.role,
         facility_id   = EXCLUDED.facility_id`,
      [tenant_id, org_id, fid, u.email, u.name, u.role, hash]
    );
    console.log(`✓ ${u.role.padEnd(20)}  ${u.email}`);
  }

  await client.end();
  console.log(`\nMot de passe : ${PASSWORD}\n`);
}

run().catch(e => { console.error(e); process.exit(1); });
