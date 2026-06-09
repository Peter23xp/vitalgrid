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
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER`,
    `UPDATE users SET failed_login_attempts = 0 WHERE failed_login_attempts IS NULL`,
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
