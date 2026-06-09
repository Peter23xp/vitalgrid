import { DsqlSigner } from '@aws-sdk/dsql-signer';
import { Client } from 'pg';

const ENDPOINT = process.env.DSQL_CLUSTER_ENDPOINT!;
const REGION   = process.env.DSQL_REGION ?? 'us-east-1';

async function run() {
  const signer = new DsqlSigner({ hostname: ENDPOINT, region: REGION });
  const token  = await signer.getDbConnectAdminAuthToken();
  const client = new Client({ host: ENDPOINT, port: 5432, database: 'postgres', user: 'admin', password: token, ssl: { rejectUnauthorized: true } });
  await client.connect();
  console.log('Connected to Aurora DSQL');

  const ddl = [
    `CREATE TABLE IF NOT EXISTS access_requests (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      first_name   VARCHAR(100) NOT NULL,
      last_name    VARCHAR(100) NOT NULL,
      email        VARCHAR(150) NOT NULL,
      organization VARCHAR(150) NOT NULL,
      role         VARCHAR(50)  NOT NULL,
      country_code VARCHAR(2)   NOT NULL,
      message      TEXT,
      status       VARCHAR(20)  NOT NULL DEFAULT 'pending',
      created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )`,
    `CREATE INDEX ASYNC IF NOT EXISTS idx_access_requests_status ON access_requests(status)`,
    `CREATE INDEX ASYNC IF NOT EXISTS idx_access_requests_created ON access_requests(created_at)`,
  ];

  for (const sql of ddl) {
    const label = sql.match(/(TABLE|INDEX\s+ASYNC\s+IF NOT EXISTS)\s+(?:IF NOT EXISTS\s+)?(\w+)/)?.[2] ?? '?';
    try { await client.query(sql); console.log(`  ✓ ${label}`); }
    catch (e: unknown) { console.error(`  ✗ ${label}: ${(e as Error).message}`); }
  }

  await client.end();
  console.log('\n✅ Migration access_requests complete\n');
}

run().catch((e) => { console.error(e); process.exit(1); });
