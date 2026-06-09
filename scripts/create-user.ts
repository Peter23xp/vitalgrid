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

  const password_hash = await bcrypt.hash(password, 12);

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
