import { DsqlSigner } from '@aws-sdk/dsql-signer';
import { Client } from 'pg';

const ENDPOINT = process.env.DSQL_CLUSTER_ENDPOINT!;
const REGION   = process.env.DSQL_REGION ?? 'us-east-1';

async function run() {
  const signer = new DsqlSigner({ hostname: ENDPOINT, region: REGION });
  const token  = await signer.getDbConnectAdminAuthToken();
  const client = new Client({ host: ENDPOINT, port: 5432, database: 'postgres', user: 'admin', password: token, ssl: { rejectUnauthorized: true } });
  await client.connect();
  console.log('Connected — wiping all tables...\n');

  const tables = [
    'inventory_movements', 'cold_chain_events', 'alert_rules', 'alerts',
    'batches', 'transfers', 'resources', 'broadcasts', 'audit_log',
    'users', 'facilities', 'organizations', 'access_requests',
  ];

  for (const t of tables) {
    try {
      await client.query(`DELETE FROM ${t}`);
      console.log(`  ✓ ${t}`);
    } catch (e: unknown) {
      const err = e as Error;
      if (err.message?.includes('does not exist')) console.log(`  - ${t} (absent)`);
      else console.log(`  ✗ ${t}: ${err.message}`);
    }
  }

  await client.end();
  console.log('\n✅ Base de données vidée\n');
}
run().catch(console.error);
