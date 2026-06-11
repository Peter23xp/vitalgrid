import { DsqlSigner } from '@aws-sdk/dsql-signer';
import { Client } from 'pg';

const ENDPOINT = process.env.DSQL_CLUSTER_ENDPOINT!;
const REGION   = process.env.DSQL_REGION ?? 'us-east-1';

async function run() {
  const signer = new DsqlSigner({ hostname: ENDPOINT, region: REGION });
  const token  = await signer.getDbConnectAdminAuthToken();

  const client = new Client({
    host: ENDPOINT, port: 5432, database: 'postgres',
    user: 'admin', password: token, ssl: { rejectUnauthorized: true },
  });
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id        UUID         NOT NULL UNIQUE,
      plan          VARCHAR(20)  NOT NULL DEFAULT 'freemium',
      status        VARCHAR(20)  NOT NULL DEFAULT 'active',
      mrr_usd_cents INTEGER      NOT NULL DEFAULT 0,
      renewal_at    TIMESTAMPTZ,
      trial_ends_at TIMESTAMPTZ,
      notes         TEXT,
      created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `);
  console.log('✓ subscriptions table ready');

  await client.query(
    `CREATE INDEX ASYNC IF NOT EXISTS idx_subscriptions_org ON subscriptions(org_id)`
  );
  console.log('✓ idx_subscriptions_org');

  // Insérer une ligne freemium pour chaque org qui n'en a pas encore
  const { rows } = await client.query(
    `INSERT INTO subscriptions (org_id, plan, status)
     SELECT id, 'freemium', 'active' FROM organizations
     WHERE id NOT IN (SELECT org_id FROM subscriptions)
     RETURNING org_id`
  );
  if (rows.length) console.log(`✓ ${rows.length} org(s) initialisées en freemium`);

  await client.end();
  console.log('\n✅ Migration subscriptions terminée');
}

run().catch((e) => { console.error(e); process.exit(1); });
