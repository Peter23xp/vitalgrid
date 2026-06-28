import { DsqlSigner } from '@aws-sdk/dsql-signer';
import { Client } from 'pg';

const ENDPOINT = process.env.DSQL_CLUSTER_ENDPOINT!;
const REGION   = process.env.DSQL_REGION ?? 'us-east-1';

const DEMO_TENANT  = '0d0ab29a-8b9b-44ab-8176-65f596182c4b';
const FAC_GOMA_ID  = 'f25cade3-ad3e-4c6a-a15c-60ec9d35229e';
const FAC_KIN_ID   = '0070a170-6dcf-4ea8-a67d-6d4e9aaf7d53';
const SANG_GOMA_ID = '56f1b7ee-4129-4381-ad72-e848e6299fdc';

async function run() {
  const signer = new DsqlSigner({ hostname: ENDPOINT, region: REGION });
  const token  = await signer.getDbConnectAdminAuthToken();
  const client = new Client({ host: ENDPOINT, port: 5432, database: 'postgres', user: 'admin', password: token, ssl: { rejectUnauthorized: true } });
  await client.connect();

  // 1. Supprimer les vieilles alertes critiques avec le mauvais tenant
  const del = await client.query(
    `DELETE FROM alerts WHERE severity='critical' AND tenant_id != $1`, [DEMO_TENANT]
  );
  console.log(`Supprimé ${del.rowCount} alertes avec mauvais tenant`);

  // 2. Supprimer les alertes critiques Sang O- déjà présentes pour ce tenant (doublon éventuel)
  await client.query(
    `DELETE FROM alerts WHERE tenant_id=$1 AND facility_id=$2 AND severity='critical'`,
    [DEMO_TENANT, FAC_GOMA_ID]
  );

  // 3. Insérer la bonne alerte critique avec le bon tenant
  const ins = await client.query(
    `INSERT INTO alerts
       (tenant_id, facility_id, resource_id, alert_type, severity, title, description, is_read)
     VALUES ($1,$2,$3,'stock_bas','critical',
       'CRITIQUE — Sang O- : 4 poches restantes',
       'Stock à 4 poches (seuil : 10). Risque de rupture imminente. Transfert urgent requis depuis Kinshasa.',
       false)
     RETURNING id`,
    [DEMO_TENANT, FAC_GOMA_ID, SANG_GOMA_ID]
  );
  console.log(`Alerte critique créée: ${ins.rows[0].id}`);

  // 4. S'assurer que Sang O- à Goma a bien 4 unités et seuil 10
  await client.query(
    `UPDATE resources SET total_quantity=4, alert_threshold=10 WHERE id=$1`,
    [SANG_GOMA_ID]
  );
  console.log('Sang O- Goma: total_quantity=4, alert_threshold=10 ✓');

  // 5. S'assurer que Sang O- à Kinshasa a bien 23 unités
  const kinSangR = await client.query(
    `SELECT id FROM resources WHERE tenant_id=$1 AND facility_id=$2 AND name ILIKE '%Sang O%'`,
    [DEMO_TENANT, FAC_KIN_ID]
  );
  if (kinSangR.rows.length > 0) {
    await client.query(
      `UPDATE resources SET total_quantity=23, alert_threshold=8 WHERE id=$1`,
      [kinSangR.rows[0].id]
    );
    console.log('Sang O- Kinshasa: total_quantity=23, alert_threshold=8 ✓');
  } else {
    // Créer si absent
    await client.query(
      `INSERT INTO resources (tenant_id, facility_id, name, dci, category, unit_of_measure, total_quantity, alert_threshold, zone, location)
       VALUES ($1,$2,'Sang O- (Poches)','Sang total groupe O Rhésus négatif','injectable','poche',23,8,'cold','Banque de sang')`,
      [DEMO_TENANT, FAC_KIN_ID]
    );
    console.log('Sang O- Kinshasa créé: 23 poches ✓');
  }

  // 6. Vérification finale
  const check = await client.query(
    `SELECT COUNT(*) as count FROM alerts WHERE tenant_id=$1 AND severity='critical' AND is_read=false`,
    [DEMO_TENANT]
  );
  console.log(`\n✅ Alertes critiques pour tenant démo: ${check.rows[0].count}`);

  await client.end();
}
run().catch(console.error);
