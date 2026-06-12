import { DsqlSigner } from '@aws-sdk/dsql-signer';
import { Client } from 'pg';
import bcrypt from 'bcryptjs';
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const ENDPOINT = process.env.DSQL_CLUSTER_ENDPOINT!;
const REGION = process.env.DSQL_REGION ?? 'us-east-1';

// Données démographiques réalistes par région
const DEMO_DATA = {
  CD: {
    name: 'République Démocratique du Congo',
    organizations: [
      { name: 'Ministère de la Santé RDC', type: 'gouvernement', regions: ['Kinshasa', 'Nord-Kivu', 'Sud-Kivu', 'Haut-Katanga'] },
      { name: 'MSF Congo', type: 'ngo', regions: ['Nord-Kivu', 'Sud-Kivu', 'Ituri'] },
      { name: 'UNICEF RDC', type: 'ngo', regions: ['Kinshasa', 'Kasaï', 'Tanganyika'] },
    ],
    facilities: [
      { name: 'Hôpital Général de Kinshasa', type: 'Hôpital', region: 'Kinshasa', lat: -4.3276, lng: 15.3136, beds: 450 },
      { name: 'Centre de Santé Goma', type: 'Centre de Santé', region: 'Nord-Kivu', lat: -1.6740, lng: 29.2249, beds: 80 },
      { name: 'Hôpital Provincial Bukavu', type: 'Hôpital', region: 'Sud-Kivu', lat: -2.5084, lng: 28.8424, beds: 320 },
      { name: 'Poste de Santé Bunia', type: 'Poste de Santé', region: 'Ituri', lat: 1.5594, lng: 30.2522, beds: 25 },
      { name: 'Hôpital Général Lubumbashi', type: 'Hôpital', region: 'Haut-Katanga', lat: -11.6698, lng: 27.4794, beds: 380 },
    ],
  },
  RW: {
    name: 'Rwanda',
    organizations: [
      { name: 'Ministère de la Santé Rwanda', type: 'gouvernement', regions: ['Kigali', 'Province du Nord', 'Province du Sud'] },
      { name: 'Partners In Health Rwanda', type: 'ngo', regions: ['Province du Sud', 'Province de l\'Est'] },
    ],
    facilities: [
      { name: 'Hôpital Universitaire de Kigali', type: 'Hôpital', region: 'Kigali', lat: -1.9570, lng: 30.1127, beds: 500 },
      { name: 'Centre de Santé Butare', type: 'Centre de Santé', region: 'Province du Sud', lat: -2.5971, lng: 29.7399, beds: 120 },
      { name: 'Hôpital de District Ruhengeri', type: 'Hôpital', region: 'Province du Nord', lat: -1.5010, lng: 29.6339, beds: 200 },
    ],
  },
  KE: {
    name: 'Kenya',
    organizations: [
      { name: 'Ministry of Health Kenya', type: 'gouvernement', regions: ['Nairobi', 'Mombasa', 'Kisumu'] },
      { name: 'AMREF Kenya', type: 'ngo', regions: ['Nairobi', 'Nakuru', 'Eldoret'] },
    ],
    facilities: [
      { name: 'Kenyatta National Hospital', type: 'Hôpital', region: 'Nairobi', lat: -1.3019, lng: 36.8073, beds: 650 },
      { name: 'Coast General Hospital', type: 'Hôpital', region: 'Mombasa', lat: -4.0435, lng: 39.6682, beds: 420 },
      { name: 'Kisumu County Hospital', type: 'Hôpital', region: 'Kisumu', lat: -0.0917, lng: 34.7680, beds: 280 },
      { name: 'Nakuru Level 5 Hospital', type: 'Hôpital', region: 'Nakuru', lat: -0.3031, lng: 36.0800, beds: 350 },
    ],
  },
  UG: {
    name: 'Uganda',
    organizations: [
      { name: 'Ministry of Health Uganda', type: 'gouvernement', regions: ['Kampala', 'Gulu', 'Mbarara'] },
    ],
    facilities: [
      { name: 'Mulago National Referral Hospital', type: 'Hôpital', region: 'Kampala', lat: 0.3373, lng: 32.5750, beds: 550 },
      { name: 'Gulu Regional Hospital', type: 'Hôpital', region: 'Gulu', lat: 2.7747, lng: 32.2989, beds: 300 },
      { name: 'Mbarara Regional Referral Hospital', type: 'Hôpital', region: 'Mbarara', lat: -0.6102, lng: 30.6592, beds: 320 },
    ],
  },
  TZ: {
    name: 'Tanzanie',
    organizations: [
      { name: 'Ministry of Health Tanzania', type: 'gouvernement', regions: ['Dar es Salaam', 'Dodoma', 'Arusha'] },
    ],
    facilities: [
      { name: 'Muhimbili National Hospital', type: 'Hôpital', region: 'Dar es Salaam', lat: -6.8129, lng: 39.2733, beds: 700 },
      { name: 'Benjamin Mkapa Hospital', type: 'Hôpital', region: 'Dodoma', lat: -6.1630, lng: 35.7516, beds: 400 },
      { name: 'Mount Meru Regional Hospital', type: 'Hôpital', region: 'Arusha', lat: -3.3869, lng: 36.6830, beds: 280 },
    ],
  },
};

// Ressources médicales réalistes
const MEDICAL_RESOURCES = [
  // Vaccins et sérums
  { name: 'Vaccin BCG', dci: 'Bacille Calmette-Guérin', category: 'vaccin', unit: 'dose', alert: 500 },
  { name: 'Vaccin Polio Oral', dci: 'OPV', category: 'vaccin', unit: 'dose', alert: 800 },
  { name: 'Vaccin Rougeole', dci: 'Vaccin anti-rougeoleux', category: 'vaccin', unit: 'dose', alert: 600 },
  { name: 'Vaccin DTC', dci: 'Diphtérie-Tétanos-Coqueluche', category: 'vaccin', unit: 'dose', alert: 700 },
  { name: 'Vaccin Fièvre Jaune', dci: 'Vaccin anti-amaril', category: 'vaccin', unit: 'dose', alert: 400 },
  { name: 'Vaccin Hépatite B', dci: 'Vaccin anti-hépatite B', category: 'vaccin', unit: 'dose', alert: 500 },
  { name: 'Vaccin Rotavirus', dci: 'Vaccin anti-rotavirus', category: 'vaccin', unit: 'dose', alert: 300 },
  { name: 'Vaccin Pneumocoque', dci: 'PCV13', category: 'vaccin', unit: 'dose', alert: 450 },

  // Antipaludiques
  { name: 'Artésunate Injectable', dci: 'Artésunate', category: 'antipaludique', unit: 'ampoule', alert: 200 },
  { name: 'Artéméther-Luméfantrine', dci: 'AL 20/120mg', category: 'antipaludique', unit: 'comprimé', alert: 5000 },
  { name: 'Quinine Injectable', dci: 'Quinine 300mg', category: 'antipaludique', unit: 'ampoule', alert: 150 },
  { name: 'Primaquine', dci: 'Primaquine 15mg', category: 'antipaludique', unit: 'comprimé', alert: 800 },

  // Antibiotiques
  { name: 'Amoxicilline', dci: 'Amoxicilline 500mg', category: 'antibiotique', unit: 'comprimé', alert: 3000 },
  { name: 'Ceftriaxone', dci: 'Ceftriaxone 1g', category: 'antibiotique', unit: 'flacon', alert: 400 },
  { name: 'Métronidazole', dci: 'Métronidazole 500mg', category: 'antibiotique', unit: 'comprimé', alert: 2000 },
  { name: 'Azithromycine', dci: 'Azithromycine 500mg', category: 'antibiotique', unit: 'comprimé', alert: 1500 },
  { name: 'Ciprofloxacine', dci: 'Ciprofloxacine 500mg', category: 'antibiotique', unit: 'comprimé', alert: 1800 },

  // Antirétroviraux
  { name: 'Ténofovir-Lamivudine-Dolutégravir', dci: 'TLD', category: 'arv', unit: 'comprimé', alert: 4000 },
  { name: 'Lopinavir-Ritonavir', dci: 'LPV/r 200/50mg', category: 'arv', unit: 'comprimé', alert: 2500 },
  { name: 'Névirapine', dci: 'Névirapine 200mg', category: 'arv', unit: 'comprimé', alert: 2000 },

  // Solutés et injectables
  { name: 'Sérum Physiologique', dci: 'NaCl 0.9%', category: 'injectable', unit: 'poche', alert: 800 },
  { name: 'Ringer Lactate', dci: 'Ringer Lactate', category: 'injectable', unit: 'poche', alert: 600 },
  { name: 'Glucose 5%', dci: 'Glucose 5%', category: 'injectable', unit: 'poche', alert: 500 },

  // Matériel médical
  { name: 'Gants Stériles', dci: null, category: 'materiel', unit: 'paire', alert: 2000 },
  { name: 'Seringues 5ml', dci: null, category: 'materiel', unit: 'unité', alert: 5000 },
  { name: 'Compresses Stériles', dci: null, category: 'materiel', unit: 'paquet', alert: 800 },
  { name: 'Tests Rapides Paludisme', dci: 'RDT Pf/Pan', category: 'diagnostic', unit: 'test', alert: 1000 },
  { name: 'Tests Rapides VIH', dci: 'RDT VIH', category: 'diagnostic', unit: 'test', alert: 800 },
];

// Générateur de lots avec dates d'expiration réalistes
function generateBatches(resourceId: string, tenantId: string, minQty: number, maxQty: number) {
  const batchCount = Math.floor(Math.random() * 3) + 1;
  const batches = [];

  for (let i = 0; i < batchCount; i++) {
    const quantity = Math.floor(Math.random() * (maxQty - minQty + 1)) + minQty;
    const monthsToExpiry = Math.floor(Math.random() * 18) + 6; // Entre 6 et 24 mois
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + monthsToExpiry);

    batches.push({
      tenantId,
      resourceId,
      batchNumber: `LOT${Date.now()}${i}${Math.floor(Math.random() * 1000)}`,
      quantity,
      expiryDate: expiryDate.toISOString().split('T')[0],
      supplier: ['UNICEF', 'MSF', 'Gavi Alliance', 'Global Fund', 'Distributeur Local'][Math.floor(Math.random() * 5)],
    });
  }

  return batches;
}

async function run() {
  console.log('🌍 Création de données de démo pour VitalGrid...\n');

  const signer = new DsqlSigner({ hostname: ENDPOINT, region: REGION });
  const token = await signer.getDbConnectAdminAuthToken();

  const client = new Client({
    host: ENDPOINT,
    port: 5432,
    database: 'postgres',
    user: 'admin',
    password: token,
    ssl: { rejectUnauthorized: true },
  });

  await client.connect();

  try {
    // Créer les organisations et établissements pour chaque pays
    for (const [countryCode, countryData] of Object.entries(DEMO_DATA)) {
      console.log(`\n📍 ${countryData.name} (${countryCode})`);

      for (const orgData of countryData.organizations) {
        console.log(`\n  🏢 ${orgData.name}`);

        // Créer l'organisation
        const slug = orgData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 100);
        const orgRes = await client.query(
          `INSERT INTO organizations (name, type, country_code, regions, slug)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (slug) DO UPDATE SET
             name = EXCLUDED.name,
             regions = EXCLUDED.regions
           RETURNING id`,
          [orgData.name, orgData.type, countryCode, JSON.stringify(orgData.regions), slug]
        );
        const orgId = orgRes.rows[0].id;
        const tenantId = orgId;

        // Créer un utilisateur admin pour cette organisation
        const email = `admin.${slug}@vitalgrid.io`;
        const passwordHash = await bcrypt.hash('Demo2026!', 12);

        const userRes = await client.query(
          `INSERT INTO users (tenant_id, org_id, email, name, role, password_hash, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'active')
           ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
           RETURNING id`,
          [tenantId, orgId, email.toLowerCase(), `Admin ${orgData.name}`,
           orgData.type === 'gouvernement' ? 'super_admin' : 'ngo_coordinator', passwordHash]
        );
        const adminUserId = userRes.rows[0].id;

        console.log(`     👤 ${email} (mot de passe: Demo2026!)`);

        // Créer les établissements de ce pays pour cette organisation
        const relevantFacilities = countryData.facilities.filter(f =>
          orgData.regions.includes(f.region)
        );

        for (const facilityData of relevantFacilities) {
          const facRes = await client.query(
            `INSERT INTO facilities
               (tenant_id, org_id, name, type, country_code, region, lat, lng,
                bed_capacity, contact_name, contact_phone, status, storage_zones)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active',
                     '[{"id":"cold","name":"Chambre froide","temp_min":2,"temp_max":8},
                       {"id":"freezer","name":"Congélateur","temp_min":-25,"temp_max":-15},
                       {"id":"dry","name":"Zone sèche","temp_min":15,"temp_max":25}]'::jsonb)
             ON CONFLICT DO NOTHING
             RETURNING id`,
            [tenantId, orgId, facilityData.name, facilityData.type, countryCode,
             facilityData.region, facilityData.lat, facilityData.lng, facilityData.beds,
             `Contact ${facilityData.name}`, '+000 000 000']
          );

          if (facRes.rowCount === 0) continue;
          const facilityId = facRes.rows[0].id;

          console.log(`     🏥 ${facilityData.name} (${facilityData.region})`);

          // Créer un facility_manager pour cet établissement
          const facEmail = `manager.${slug}.${facilityData.region.toLowerCase().replace(/[^a-z0-9]+/g, '-')}@vitalgrid.io`;
          await client.query(
            `INSERT INTO users (tenant_id, org_id, facility_id, email, name, role, password_hash, status)
             VALUES ($1, $2, $3, $4, $5, 'facility_manager', $6, 'active')
             ON CONFLICT (email) DO NOTHING`,
            [tenantId, orgId, facilityId, facEmail.toLowerCase(),
             `Manager ${facilityData.name}`, passwordHash]
          );

          // Créer des ressources pour cet établissement (environ 60% des ressources disponibles)
          const facilityResources = MEDICAL_RESOURCES
            .filter(() => Math.random() > 0.4)
            .slice(0, Math.floor(Math.random() * 10) + 15); // Entre 15 et 25 ressources

          for (const resource of facilityResources) {
            // Quantité variable selon le type d'établissement
            const multiplier = facilityData.type === 'Hôpital' ? 3 :
                             facilityData.type === 'Centre de Santé' ? 1.5 : 1;
            const totalQty = Math.floor((Math.random() * resource.alert * 2 + resource.alert) * multiplier);

            const resRes = await client.query(
              `INSERT INTO resources
                 (tenant_id, facility_id, name, dci, category, unit_of_measure,
                  total_quantity, alert_threshold, zone, location)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8,
                       CASE WHEN $5::varchar IN ('vaccin', 'injectable', 'arv') THEN 'cold'
                            WHEN $5::varchar = 'materiel' THEN 'dry'
                            ELSE 'cold' END,
                       'Zone Stock Principal')
               ON CONFLICT DO NOTHING
               RETURNING id`,
              [tenantId, facilityId, resource.name, resource.dci, resource.category,
               resource.unit, totalQty, Math.floor(resource.alert * multiplier)]
            );

            if (resRes.rowCount === 0) continue;
            const resourceId = resRes.rows[0].id;

            // Créer des lots pour cette ressource
            const batches = generateBatches(resourceId, tenantId,
              Math.floor(totalQty * 0.2), Math.floor(totalQty * 0.5));

            for (const batch of batches) {
              await client.query(
                `INSERT INTO batches
                   (tenant_id, resource_id, batch_number, quantity, expiry_date, supplier)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [batch.tenantId, batch.resourceId, batch.batchNumber,
                 batch.quantity, batch.expiryDate, batch.supplier]
              );
            }

            // Créer un mouvement initial d'inventaire
            await client.query(
              `INSERT INTO inventory_movements
                 (tenant_id, resource_id, delta, reason, user_id, location)
               VALUES ($1, $2, $3, 'Stock initial', $4, 'Zone Stock Principal')`,
              [tenantId, resourceId, totalQty, adminUserId]
            );
          }

          // Créer quelques règles d'alerte
          await client.query(
            `INSERT INTO alert_rules
               (tenant_id, facility_id, category, rule_type, threshold, severity, channels, repeat_interval)
             VALUES
               ($1, $2, 'vaccin', 'stock_bas', 500, 'warning', '["push","email"]', 'daily'),
               ($1, $2, 'antipaludique', 'stock_bas', 300, 'critical', '["push","email","sms"]', 'hourly'),
               ($1, $2, NULL, 'expiration_proche', 30, 'warning', '["push","email"]', 'weekly')
             ON CONFLICT DO NOTHING`,
            [tenantId, facilityId]
          );

          console.log(`        ✓ ${facilityResources.length} ressources créées`);
        }
      }
    }

    // Créer quelques transferts inter-établissements de démo
    console.log('\n📦 Création de transferts de démo...');

    const transfersData = await client.query(`
      SELECT DISTINCT
        f1.id as req_id, f1.tenant_id, f1.name as req_name,
        f2.id as src_id, f2.name as src_name,
        r.id as resource_id, r.name as resource_name, r.unit_of_measure
      FROM facilities f1
      JOIN facilities f2 ON f1.country_code = f2.country_code
        AND f1.id != f2.id
        AND f1.tenant_id = f2.tenant_id
      JOIN resources r ON r.facility_id = f2.id
      WHERE r.total_quantity > 1000
      LIMIT 20
    `);

    for (const t of transfersData.rows) {
      const qty = Math.floor(Math.random() * 200) + 50;
      const status = ['pending', 'approved', 'in_transit', 'delivered'][Math.floor(Math.random() * 4)];
      const priority = ['NORMALE', 'HAUTE', 'URGENTE'][Math.floor(Math.random() * 3)];

      await client.query(
        `INSERT INTO transfers
           (tenant_id, ref, resource_id, quantity, requesting_facility_id,
            source_facility_id, status, priority, motif)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT DO NOTHING`,
        [t.tenant_id, `TR${Date.now()}${Math.floor(Math.random() * 1000)}`,
         t.resource_id, qty, t.req_id, t.src_id, status, priority,
         ['Rupture de stock', 'Campagne de vaccination', 'Réapprovisionnement'][Math.floor(Math.random() * 3)]]
      );
    }

    console.log(`   ✓ ${transfersData.rowCount} transferts créés`);

    // Créer quelques alertes
    console.log('\n🚨 Création d\'alertes de démo...');

    const alertsData = await client.query(`
      SELECT r.id, r.tenant_id, r.facility_id, r.name, r.total_quantity, r.alert_threshold
      FROM resources r
      WHERE r.total_quantity < r.alert_threshold
      LIMIT 15
    `);

    for (const a of alertsData.rows) {
      await client.query(
        `INSERT INTO alerts
           (tenant_id, facility_id, resource_id, alert_type, severity, title, description)
         VALUES ($1, $2, $3, 'stock_bas', 'warning', $4, $5)
         ON CONFLICT DO NOTHING`,
        [a.tenant_id, a.facility_id, a.id,
         `Stock bas: ${a.name}`,
         `Le stock actuel (${a.total_quantity}) est inférieur au seuil d'alerte (${a.alert_threshold}).`]
      );
    }

    console.log(`   ✓ ${alertsData.rowCount} alertes créées`);

    // ── Scénario vidéo ─────────────────────────────────────────────────────
    // Comptes fixes, Sang O- CRITIQUE à Goma, surplus à Kinshasa,
    // transfert URGENTE pré-configuré, alerte critique, données IoT DynamoDB.
    console.log('\n🎬 Scénario vidéo — comptes et données fixes...');

    const VIDEO_ORG_SLUG = 'msf-congo';
    const TRANSFER_REF   = 'DEMO-TR-VIDEO-001';
    const DDB_REGION     = process.env.DYNAMODB_REGION         ?? 'us-east-1';
    const DDB_TABLE      = process.env.DYNAMODB_TABLE_COLD_CHAIN ?? 'cold_chain_events';

    // Récupérer l'org MSF Congo créée plus haut
    const orgVideoR = await client.query(
      `SELECT id FROM organizations WHERE slug = $1`, [VIDEO_ORG_SLUG]
    );
    if (orgVideoR.rowCount === 0) {
      console.log('   ⚠ MSF Congo non trouvé — scénario vidéo ignoré');
    } else {
      const orgId    = orgVideoR.rows[0].id;
      const tenantId = orgId;
      const hash     = await bcrypt.hash('Demo2026!', 12);

      // ── Facilities Goma + Kinshasa (MSF Congo les a déjà créées) ──────────
      const gomaR = await client.query(
        `SELECT id FROM facilities WHERE tenant_id=$1 AND name='Centre de Santé Goma'`,
        [tenantId]
      );
      const kinR = await client.query(
        `SELECT id FROM facilities WHERE tenant_id=$1 AND name='Hôpital Général de Kinshasa'`,
        [tenantId]
      );
      // MSF Congo couvre Nord-Kivu et Kinshasa — les deux facilities sont déjà là
      const facGomaId = gomaR.rows[0]?.id as string | undefined;
      const facKinId  = kinR.rows[0]?.id  as string | undefined;

      // ── 4 comptes vidéo fixes ──────────────────────────────────────────────
      const adminVideoR = await client.query(`
        INSERT INTO users (tenant_id, org_id, email, name, role, password_hash, status)
        VALUES ($1,$2,'demo.admin@vitalgrid.io','Admin Démo VitalGrid','super_admin',$3,'active')
        ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash, facility_id=NULL
        RETURNING id
      `, [tenantId, orgId, hash]);
      const adminVideoId = adminVideoR.rows[0].id as string;

      await client.query(`
        INSERT INTO users (tenant_id, org_id, email, name, role, password_hash, status)
        VALUES ($1,$2,'demo.ngo@vitalgrid.io','Sophie K. — Coordinatrice Régionale','ngo_coordinator',$3,'active')
        ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash, facility_id=NULL
      `, [tenantId, orgId, hash]);

      if (facKinId) {
        await client.query(`
          INSERT INTO users (tenant_id, org_id, facility_id, email, name, role, password_hash, status)
          VALUES ($1,$2,$3,'demo.manager@vitalgrid.io','Dr. Beatrice Ngozi — Kinshasa','facility_manager',$4,'active')
          ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash, facility_id=EXCLUDED.facility_id
        `, [tenantId, orgId, facKinId, hash]);
      }

      if (facGomaId) {
        await client.query(`
          INSERT INTO users (tenant_id, org_id, facility_id, email, name, role, password_hash, status)
          VALUES ($1,$2,$3,'demo.field@vitalgrid.io','Amani Kiza — Agent Terrain Goma','field_agent',$4,'active')
          ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash, facility_id=EXCLUDED.facility_id
        `, [tenantId, orgId, facGomaId, hash]);
      }

      console.log('   ✓ demo.admin@vitalgrid.io     → super_admin');
      console.log('   ✓ demo.ngo@vitalgrid.io       → ngo_coordinator');
      console.log('   ✓ demo.manager@vitalgrid.io   → facility_manager @ Kinshasa');
      console.log('   ✓ demo.field@vitalgrid.io     → field_agent @ Goma');

      // ── Sang O- CRITIQUE à Goma (4 poches) ───────────────────────────────
      if (facGomaId) {
        const sangGomaR = await client.query(`
          INSERT INTO resources
            (tenant_id, facility_id, name, dci, category, unit_of_measure,
             total_quantity, alert_threshold, zone, location)
          VALUES ($1,$2,'Sang O- (Poches)','Sang total groupe O Rhésus négatif',
                  'injectable','poche', 4, 10, 'cold', 'Banque de sang')
          ON CONFLICT DO NOTHING
          RETURNING id
        `, [tenantId, facGomaId]);

        let sangGomaId: string | undefined;
        if (sangGomaR.rowCount === 0) {
          const ex = await client.query(
            `SELECT id FROM resources WHERE tenant_id=$1 AND facility_id=$2 AND name='Sang O- (Poches)'`,
            [tenantId, facGomaId]
          );
          sangGomaId = ex.rows[0]?.id;
          if (sangGomaId) await client.query(
            `UPDATE resources SET total_quantity=4, alert_threshold=10 WHERE id=$1`,
            [sangGomaId]
          );
        } else {
          sangGomaId = sangGomaR.rows[0].id;
        }
        console.log('   ✓ Sang O- Goma : 4 poches CRITIQUE (seuil 10)');

        if (sangGomaId) {
          // Lot
          await client.query(`
            INSERT INTO batches (tenant_id, resource_id, batch_number, quantity, expiry_date, supplier)
            VALUES ($1,$2,'LOT-SANG-GOMA-2024-047',4,'2026-09-15','CROS Congo')
            ON CONFLICT DO NOTHING
          `, [tenantId, sangGomaId]);

          // Mouvement initial
          await client.query(`
            INSERT INTO inventory_movements (tenant_id, resource_id, delta, reason, user_id, location)
            VALUES ($1,$2,4,'Stock initial démo',$3,'Banque de sang')
          `, [tenantId, sangGomaId, adminVideoId]).catch(() => {});

          // Alerte critique
          await client.query(`
            INSERT INTO alerts
              (tenant_id, facility_id, resource_id, alert_type, severity, title, description)
            VALUES ($1,$2,$3,'stock_bas','critical',
              'CRITIQUE — Sang O- : 4 poches restantes',
              'Stock à 4 poches (seuil : 10). Risque de rupture imminente. Transfert urgent requis.')
            ON CONFLICT DO NOTHING
          `, [tenantId, facGomaId, sangGomaId]);
          console.log('   ✓ Alerte critique Sang O- @ Goma créée');

          // ── Sang O- SURPLUS à Kinshasa (23 poches) ───────────────────────
          if (facKinId) {
            const sangKinR = await client.query(`
              INSERT INTO resources
                (tenant_id, facility_id, name, dci, category, unit_of_measure,
                 total_quantity, alert_threshold, zone, location)
              VALUES ($1,$2,'Sang O- (Poches)','Sang total groupe O Rhésus négatif',
                      'injectable','poche', 23, 8, 'cold', 'Banque de sang')
              ON CONFLICT DO NOTHING
              RETURNING id
            `, [tenantId, facKinId]);

            let sangKinId: string | undefined;
            if (sangKinR.rowCount === 0) {
              const ex = await client.query(
                `SELECT id FROM resources WHERE tenant_id=$1 AND facility_id=$2 AND name='Sang O- (Poches)'`,
                [tenantId, facKinId]
              );
              sangKinId = ex.rows[0]?.id;
              if (sangKinId) await client.query(
                `UPDATE resources SET total_quantity=23, alert_threshold=8 WHERE id=$1`,
                [sangKinId]
              );
            } else {
              sangKinId = sangKinR.rows[0].id;
            }
            console.log('   ✓ Sang O- Kinshasa : 23 poches (surplus)');

            if (sangKinId) {
              await client.query(`
                INSERT INTO batches (tenant_id, resource_id, batch_number, quantity, expiry_date, supplier)
                VALUES
                  ($1,$2,'LOT-SANG-KIN-2024-112',15,'2026-11-20','CROS Congo'),
                  ($1,$2,'LOT-SANG-KIN-2024-098', 8,'2026-10-05','CROS Congo')
                ON CONFLICT DO NOTHING
              `, [tenantId, sangKinId]);

              // Transfert URGENTE pré-configuré (pending — à approuver en direct)
              await client.query(`
                INSERT INTO transfers
                  (tenant_id, ref, resource_id, quantity,
                   requesting_facility_id, source_facility_id,
                   status, priority, motif)
                VALUES ($1,$2,$3, 8, $4,$5,'pending','URGENTE',
                        'Rupture imminente Sang O- — patient en attente de transfusion')
                ON CONFLICT DO NOTHING
              `, [tenantId, TRANSFER_REF, sangGomaId, facGomaId, facKinId]);
              console.log(`   ✓ Transfert ${TRANSFER_REF} créé (pending, 8 poches, URGENTE)`);
            }
          }
        }
      }

      // ── Données IoT DynamoDB ──────────────────────────────────────────────
      console.log('\n📡 DynamoDB — Données IoT chaîne du froid');
      try {
        const ddb = new DynamoDBClient({
          region: DDB_REGION,
          credentials: {
            accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          },
        });
        const doc = DynamoDBDocumentClient.from(ddb);

        try {
          await ddb.send(new CreateTableCommand({
            TableName: DDB_TABLE,
            AttributeDefinitions: [
              { AttributeName: 'transferId', AttributeType: 'S' },
              { AttributeName: 'timestamp',  AttributeType: 'S' },
            ],
            KeySchema: [
              { AttributeName: 'transferId', KeyType: 'HASH'  },
              { AttributeName: 'timestamp',  KeyType: 'RANGE' },
            ],
            BillingMode: 'PAY_PER_REQUEST',
          }));
          console.log('   ✓ Table DynamoDB créée');
        } catch (e: unknown) {
          if ((e as { name?: string }).name === 'ResourceInUseException') {
            console.log('   ℹ Table DynamoDB déjà existante');
          } else { throw e; }
        }

        for (let i = 0; i < 15; i++) {
          const d = await ddb.send(new DescribeTableCommand({ TableName: DDB_TABLE }));
          if (d.Table?.TableStatus === 'ACTIVE') break;
          await new Promise(r => setTimeout(r, 2000));
        }

        // Lectures IoT sur 2h avec un incident à 8.4°C
        const now = Date.now();
        const readings = [
          { offset: 120, celsius: 4.2, isAlert: false },
          { offset: 115, celsius: 4.0, isAlert: false },
          { offset: 110, celsius: 3.8, isAlert: false },
          { offset: 105, celsius: 4.1, isAlert: false },
          { offset: 100, celsius: 4.3, isAlert: false },
          { offset:  95, celsius: 3.9, isAlert: false },
          { offset:  90, celsius: 4.5, isAlert: false },
          { offset:  85, celsius: 4.2, isAlert: false },
          { offset:  80, celsius: 5.1, isAlert: false },
          { offset:  75, celsius: 6.3, isAlert: false },
          { offset:  70, celsius: 7.8, isAlert: true  },
          { offset:  65, celsius: 8.4, isAlert: true  },
          { offset:  60, celsius: 8.1, isAlert: true  },
          { offset:  55, celsius: 7.2, isAlert: true  },
          { offset:  50, celsius: 6.1, isAlert: false },
          { offset:  45, celsius: 5.4, isAlert: false },
          { offset:  40, celsius: 4.8, isAlert: false },
          { offset:  35, celsius: 4.3, isAlert: false },
          { offset:  30, celsius: 3.9, isAlert: false },
          { offset:  25, celsius: 4.1, isAlert: false },
          { offset:  20, celsius: 4.0, isAlert: false },
          { offset:  15, celsius: 3.8, isAlert: false },
          { offset:  10, celsius: 4.2, isAlert: false },
          { offset:   5, celsius: 4.1, isAlert: false },
          { offset:   0, celsius: 3.9, isAlert: false },
        ];

        for (const r of readings) {
          await doc.send(new PutCommand({
            TableName: DDB_TABLE,
            Item: {
              transferId: TRANSFER_REF,
              timestamp:  new Date(now - r.offset * 60 * 1000).toISOString(),
              celsius:    r.celsius,
              deviceId:   'IoT-Sensor-DEMO-C77',
              isAlert:    r.isAlert,
            },
          }));
        }
        console.log(`   ✓ ${readings.length} lectures IoT insérées (transferId: ${TRANSFER_REF})`);
      } catch (e) {
        console.warn('   ⚠ DynamoDB ignoré (vérifier AWS_ACCESS_KEY_ID):', (e as Error).message);
      }
    }
    // ── Fin scénario vidéo ─────────────────────────────────────────────────

    await client.end();

    console.log('\n✅ Données de démo créées avec succès!\n');
    console.log('🔐 Comptes créés (mot de passe: Demo2026! pour tous):');
    console.log('   • admin.ministere-de-la-sante-rdc@vitalgrid.io');
    console.log('   • admin.msf-congo@vitalgrid.io');
    console.log('   • admin.unicef-rdc@vitalgrid.io');
    console.log('   • admin.ministere-de-la-sante-rwanda@vitalgrid.io');
    console.log('   • admin.partners-in-health-rwanda@vitalgrid.io');
    console.log('   • admin.ministry-of-health-kenya@vitalgrid.io');
    console.log('   • admin.amref-kenya@vitalgrid.io');
    console.log('   • admin.ministry-of-health-uganda@vitalgrid.io');
    console.log('   • admin.ministry-of-health-tanzania@vitalgrid.io');
    console.log('   • + managers pour chaque établissement\n');
    console.log('🎬 Comptes vidéo (mot de passe: Demo2026!):');
    console.log('   • demo.field@vitalgrid.io     → field_agent    @ Goma (Sang O- CRITIQUE : 4)');
    console.log('   • demo.manager@vitalgrid.io   → facility_manager @ Kinshasa (surplus : 23)');
    console.log('   • demo.ngo@vitalgrid.io       → ngo_coordinator (carte régionale)');
    console.log('   • demo.admin@vitalgrid.io     → super_admin\n');
    console.log(`   Chaîne du froid : /alerts/cold-chain?transferId=DEMO-TR-VIDEO-001`);
    console.log('🌐 Connecte-toi sur http://localhost:3000/login\n');

  } catch (error) {
    console.error('❌ Erreur:', error);
    await client.end();
    process.exit(1);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
