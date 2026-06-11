import { DsqlSigner } from '@aws-sdk/dsql-signer';
import { Client } from 'pg';

const ENDPOINT = process.env.DSQL_CLUSTER_ENDPOINT!;
const REGION   = process.env.DSQL_REGION ?? 'us-east-1';
const EMAIL    = process.argv[2] ?? 'admin@vitalgrid.io';

async function run() {
  const signer = new DsqlSigner({ hostname: ENDPOINT, region: REGION });
  const token  = await signer.getDbConnectAdminAuthToken();

  const client = new Client({
    host: ENDPOINT, port: 5432, database: 'postgres',
    user: 'admin', password: token,
    ssl: { rejectUnauthorized: true },
  });
  await client.connect();

  // Trouver l'utilisateur
  const userRes = await client.query(
    `SELECT id, tenant_id, org_id FROM users WHERE email = $1`,
    [EMAIL.toLowerCase()]
  );

  if (userRes.rowCount === 0) {
    console.error(`Utilisateur "${EMAIL}" introuvable`);
    process.exit(1);
  }

  const { id: userId, tenant_id: tenantId, org_id: orgId } = userRes.rows[0];

  // Créer un établissement de test
  const facRes = await client.query(
    `INSERT INTO facilities
       (tenant_id, org_id, name, type, country_code, region, contact_name, contact_phone, status, storage_zones)
     VALUES ($1, $2, 'Établissement Principal', 'Hôpital', 'CD', 'Siège', 'Admin VitalGrid', '+243 000 000 000', 'active', '[]')
     ON CONFLICT DO NOTHING
     RETURNING id, name`,
    [tenantId, orgId]
  );

  let facilityId: string;
  let facilityName: string;

  if (facRes.rowCount === 0) {
    // Récupérer l'existant
    const existing = await client.query(
      `SELECT id, name FROM facilities WHERE tenant_id = $1 LIMIT 1`,
      [tenantId]
    );
    facilityId   = existing.rows[0].id;
    facilityName = existing.rows[0].name;
  } else {
    facilityId   = facRes.rows[0].id;
    facilityName = facRes.rows[0].name;
  }

  // Associer l'utilisateur à l'établissement
  await client.query(
    `UPDATE users SET facility_id = $1, updated_at = NOW() WHERE id = $2`,
    [facilityId, userId]
  );

  await client.end();

  console.log('\n✅ Établissement configuré');
  console.log(`   Établissement : ${facilityName}`);
  console.log(`   Facility ID   : ${facilityId}`);
  console.log(`   Tenant ID     : ${tenantId}`);
  console.log(`   User          : ${EMAIL}`);
  console.log('\n→ Mets à jour .env.local :');
  console.log(`   NEXT_PUBLIC_FACILITY_ID=${facilityId}\n`);
}

run().catch((e) => { console.error(e); process.exit(1); });
