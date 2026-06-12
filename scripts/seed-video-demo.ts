/**
 * seed-video-demo.ts
 *
 * Prépare le scénario exact de la vidéo de soumission :
 *
 * SCÈNE : Centre de Santé Goma — Sang O- à 4 unités (CRITIQUE)
 *         Hôpital Général Kinshasa — Sang O- à 23 poches (surplus)
 *         Un transfert URGENT en attente d'approbation
 *         Chaîne du froid avec données IoT dans DynamoDB
 *
 * COMPTES (mot de passe : Demo2026! pour tous)
 *   demo.field@vitalgrid.io      → Field Agent    @ Goma (pénurie)
 *   demo.manager@vitalgrid.io    → Facility Mgr   @ Kinshasa (source)
 *   demo.ngo@vitalgrid.io        → NGO Coordinator (vue régionale)
 *   demo.admin@vitalgrid.io      → Super Admin
 *
 * Usage :
 *   npx tsx --env-file=.env.local scripts/seed-video-demo.ts
 */

import { DsqlSigner }     from '@aws-sdk/dsql-signer';
import { Client }          from 'pg';
import bcrypt              from 'bcryptjs';
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const ENDPOINT = process.env.DSQL_CLUSTER_ENDPOINT!;
const REGION   = process.env.DSQL_REGION           ?? 'us-east-1';
const DDB_REGION = process.env.DYNAMODB_REGION     ?? 'us-east-1';
const DDB_TABLE  = process.env.DYNAMODB_TABLE_COLD_CHAIN ?? 'cold_chain_events';
const PASSWORD   = 'Demo2026!';
const TRANSFER_REF = 'DEMO-TR-VIDEO-001';

// ─── DynamoDB ────────────────────────────────────────────────────────────────

async function ensureDynamoTable() {
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
    console.log('  ✓ Table DynamoDB créée');
  } catch (e: unknown) {
    if ((e as { name?: string }).name === 'ResourceInUseException') {
      console.log('  ℹ Table DynamoDB déjà existante');
    } else { throw e; }
  }

  for (let i = 0; i < 15; i++) {
    const d = await ddb.send(new DescribeTableCommand({ TableName: DDB_TABLE }));
    if (d.Table?.TableStatus === 'ACTIVE') break;
    await new Promise(r => setTimeout(r, 2000));
  }

  // Données IoT réalistes sur 2h — un pic à 8.4°C simulant un incident
  const now = Date.now();
  const readings = [
    // Début normal
    { offset: 120, celsius: 4.2, isAlert: false },
    { offset: 115, celsius: 4.0, isAlert: false },
    { offset: 110, celsius: 3.8, isAlert: false },
    { offset: 105, celsius: 4.1, isAlert: false },
    { offset: 100, celsius: 4.3, isAlert: false },
    { offset:  95, celsius: 3.9, isAlert: false },
    { offset:  90, celsius: 4.5, isAlert: false },
    { offset:  85, celsius: 4.2, isAlert: false },
    // Incident : montée de température
    { offset:  80, celsius: 5.1, isAlert: false },
    { offset:  75, celsius: 6.3, isAlert: false },
    { offset:  70, celsius: 7.8, isAlert: true  }, // ⚠ dépassement
    { offset:  65, celsius: 8.4, isAlert: true  }, // ⚠ max incident
    { offset:  60, celsius: 8.1, isAlert: true  },
    // Retour à la normale
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
    const ts = new Date(now - r.offset * 60 * 1000).toISOString();
    await doc.send(new PutCommand({
      TableName: DDB_TABLE,
      Item: {
        transferId: TRANSFER_REF,
        timestamp:  ts,
        celsius:    r.celsius,
        deviceId:   'IoT-Sensor-DEMO-C77',
        isAlert:    r.isAlert,
      },
    }));
  }

  console.log(`  ✓ ${readings.length} lectures IoT insérées pour transferId "${TRANSFER_REF}"`);
  return doc;
}

// ─── Aurora DSQL ─────────────────────────────────────────────────────────────

async function run() {
  console.log('\n🎬 Préparation du scénario vidéo VitalGrid...\n');

  // ── DynamoDB d'abord ──
  console.log('📡 DynamoDB — Données IoT chaîne du froid');
  await ensureDynamoTable();

  // ── DSQL ──
  const signer = new DsqlSigner({ hostname: ENDPOINT, region: REGION });
  const token  = await signer.getDbConnectAdminAuthToken();
  const client = new Client({
    host: ENDPOINT, port: 5432, database: 'postgres',
    user: 'admin', password: token, ssl: { rejectUnauthorized: true },
  });
  await client.connect();
  console.log('\n🗄️  Aurora DSQL connecté\n');

  const hash = await bcrypt.hash(PASSWORD, 12);

  try {
    // ── 1. Organisation ──────────────────────────────────────────────────────
    console.log('🏢 Organisation : MSF Congo (scénario démo)');
    const orgR = await client.query(`
      INSERT INTO organizations (name, type, country_code, regions, slug)
      VALUES ('MSF Congo — Réseau Est', 'ngo', 'CD',
              '["Nord-Kivu","Sud-Kivu","Kinshasa","Haut-Katanga"]',
              'msf-congo-demo')
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `);
    const orgId   = orgR.rows[0].id;
    const tenantId = orgId;
    console.log(`   ✓ org_id = ${orgId}`);

    // ── 2. Facility A — Centre de Santé Goma (PÉNURIE) ──────────────────────
    console.log('\n🏥 Facility A : Centre de Santé Goma (Nord-Kivu) — pénurie Sang O-');
    const facGomaR = await client.query(`
      INSERT INTO facilities
        (tenant_id, org_id, name, type, country_code, region,
         lat, lng, bed_capacity, contact_name, contact_phone, status,
         storage_zones)
      VALUES ($1, $2,
        'Centre de Santé Goma', 'Centre de Santé', 'CD', 'Nord-Kivu',
        -1.6740, 29.2249, 80,
        'Dr. Amani Kiza', '+243 81 234 5678', 'active',
        '[{"id":"cold","name":"Chambre froide","temp_min":2,"temp_max":8},
          {"id":"dry","name":"Zone sèche","temp_min":15,"temp_max":25}]'::jsonb)
      ON CONFLICT DO NOTHING
      RETURNING id
    `, [tenantId, orgId]);

    let facGomaId: string;
    if (facGomaR.rowCount === 0) {
      const ex = await client.query(
        `SELECT id FROM facilities WHERE tenant_id=$1 AND name='Centre de Santé Goma'`,
        [tenantId]
      );
      facGomaId = ex.rows[0].id;
      console.log('   ℹ Facility déjà existante, réutilisée');
    } else {
      facGomaId = facGomaR.rows[0].id;
    }
    console.log(`   ✓ facility_id = ${facGomaId}`);

    // ── 3. Facility B — Hôpital Général Kinshasa (SURPLUS) ──────────────────
    console.log('\n🏥 Facility B : Hôpital Général de Kinshasa — surplus Sang O-');
    const facKinR = await client.query(`
      INSERT INTO facilities
        (tenant_id, org_id, name, type, country_code, region,
         lat, lng, bed_capacity, contact_name, contact_phone, status,
         storage_zones)
      VALUES ($1, $2,
        'Hôpital Général de Kinshasa', 'Hôpital', 'CD', 'Kinshasa',
        -4.3276, 15.3136, 450,
        'Dr. Beatrice Ngozi', '+243 99 876 5432', 'active',
        '[{"id":"cold","name":"Chambre froide","temp_min":2,"temp_max":8},
          {"id":"freezer","name":"Congélateur","temp_min":-25,"temp_max":-15},
          {"id":"dry","name":"Zone sèche","temp_min":15,"temp_max":25}]'::jsonb)
      ON CONFLICT DO NOTHING
      RETURNING id
    `, [tenantId, orgId]);

    let facKinId: string;
    if (facKinR.rowCount === 0) {
      const ex = await client.query(
        `SELECT id FROM facilities WHERE tenant_id=$1 AND name='Hôpital Général de Kinshasa'`,
        [tenantId]
      );
      facKinId = ex.rows[0].id;
      console.log('   ℹ Facility déjà existante, réutilisée');
    } else {
      facKinId = facKinR.rows[0].id;
    }
    console.log(`   ✓ facility_id = ${facKinId}`);

    // ── 4. Comptes utilisateurs ──────────────────────────────────────────────
    console.log('\n👥 Création des comptes démo');

    // Super Admin
    const adminR = await client.query(`
      INSERT INTO users (tenant_id, org_id, email, name, role, password_hash, status)
      VALUES ($1, $2, 'demo.admin@vitalgrid.io', 'Admin Démo VitalGrid', 'super_admin', $3, 'active')
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, facility_id = NULL
      RETURNING id
    `, [tenantId, orgId, hash]);
    console.log(`   ✓ demo.admin@vitalgrid.io     → super_admin`);

    // NGO Coordinator (vue régionale)
    await client.query(`
      INSERT INTO users (tenant_id, org_id, email, name, role, password_hash, status)
      VALUES ($1, $2, 'demo.ngo@vitalgrid.io', 'Sophie K. — Coordinatrice Régionale', 'ngo_coordinator', $3, 'active')
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, facility_id = NULL
    `, [tenantId, orgId, hash]);
    console.log(`   ✓ demo.ngo@vitalgrid.io       → ngo_coordinator`);

    // Facility Manager Kinshasa (source du transfert)
    await client.query(`
      INSERT INTO users (tenant_id, org_id, facility_id, email, name, role, password_hash, status)
      VALUES ($1, $2, $3, 'demo.manager@vitalgrid.io',
              'Dr. Beatrice Ngozi — Kinshasa', 'facility_manager', $4, 'active')
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        facility_id   = EXCLUDED.facility_id
    `, [tenantId, orgId, facKinId, hash]);
    console.log(`   ✓ demo.manager@vitalgrid.io   → facility_manager @ Kinshasa`);

    // Field Agent Goma (demandeur)
    await client.query(`
      INSERT INTO users (tenant_id, org_id, facility_id, email, name, role, password_hash, status)
      VALUES ($1, $2, $3, 'demo.field@vitalgrid.io',
              'Amani Kiza — Agent Terrain Goma', 'field_agent', $4, 'active')
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        facility_id   = EXCLUDED.facility_id
    `, [tenantId, orgId, facGomaId, hash]);
    console.log(`   ✓ demo.field@vitalgrid.io     → field_agent    @ Goma`);

    const adminId = adminR.rows[0].id;

    // ── 5. Ressources — Goma (pénurie) ──────────────────────────────────────
    console.log('\n📦 Ressources — Centre de Santé Goma');

    // SANG O- CRITIQUE (4 unités — seuil 10)
    const sangGomaR = await client.query(`
      INSERT INTO resources
        (tenant_id, facility_id, name, dci, category, unit_of_measure,
         total_quantity, alert_threshold, zone, location)
      VALUES ($1, $2,
        'Sang O- (Poches)', 'Sang total groupe O Rhésus négatif',
        'injectable', 'poche',
        4, 10, 'cold', 'Banque de sang')
      ON CONFLICT DO NOTHING
      RETURNING id
    `, [tenantId, facGomaId]);

    let sangGomaId: string;
    if (sangGomaR.rowCount === 0) {
      const ex = await client.query(
        `SELECT id FROM resources WHERE tenant_id=$1 AND facility_id=$2 AND name='Sang O- (Poches)'`,
        [tenantId, facGomaId]
      );
      sangGomaId = ex.rows[0]?.id;
      // Forcer le stock à 4 pour le scénario
      if (sangGomaId) {
        await client.query(
          `UPDATE resources SET total_quantity=4, alert_threshold=10 WHERE id=$1`,
          [sangGomaId]
        );
        console.log('   ✓ Sang O- Goma remis à 4 unités (CRITIQUE)');
      }
    } else {
      sangGomaId = sangGomaR.rows[0].id;
      console.log('   ✓ Sang O- Goma : 4 unités (CRITIQUE — seuil : 10)');
    }

    // Autres ressources Goma (stock correct)
    const gomaOthers = [
      { name: 'Artésunate Injectable', dci: 'Artésunate 60mg', cat: 'antipaludique', unit: 'ampoule', qty: 340, alert: 200 },
      { name: 'Ceftriaxone 1g',        dci: 'Ceftriaxone',     cat: 'antibiotique',  unit: 'flacon',  qty: 520, alert: 300 },
      { name: 'Vaccin BCG',            dci: 'BCG',             cat: 'vaccin',        unit: 'dose',    qty: 890, alert: 500 },
      { name: 'Sérum Physiologique',   dci: 'NaCl 0.9%',       cat: 'injectable',    unit: 'poche',   qty: 120, alert: 80  },
      { name: 'Tests Rapides Paludisme', dci: 'RDT Pf/Pan',   cat: 'diagnostic',    unit: 'test',    qty: 280, alert: 100 },
      { name: 'Amoxicilline 500mg',    dci: 'Amoxicilline',    cat: 'antibiotique',  unit: 'comprimé', qty: 4200, alert: 2000 },
      { name: 'Artéméther-Luméfantrine', dci: 'AL 20/120mg',  cat: 'antipaludique', unit: 'comprimé', qty: 8600, alert: 4000 },
      { name: 'Gants Stériles',        dci: null,              cat: 'materiel',      unit: 'paire',   qty: 600, alert: 200 },
    ];
    for (const r of gomaOthers) {
      await client.query(`
        INSERT INTO resources (tenant_id, facility_id, name, dci, category, unit_of_measure, total_quantity, alert_threshold, zone, location)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,
          CASE WHEN $5 IN ('vaccin','injectable','arv') THEN 'cold' ELSE 'dry' END,
          'Stock Principal')
        ON CONFLICT DO NOTHING
      `, [tenantId, facGomaId, r.name, r.dci, r.cat, r.unit, r.qty, r.alert]);
    }
    console.log(`   ✓ ${gomaOthers.length} autres ressources Goma créées`);

    // ── 6. Ressources — Kinshasa (surplus) ──────────────────────────────────
    console.log('\n📦 Ressources — Hôpital Général de Kinshasa');

    // SANG O- SURPLUS (23 unités)
    const sangKinR = await client.query(`
      INSERT INTO resources
        (tenant_id, facility_id, name, dci, category, unit_of_measure,
         total_quantity, alert_threshold, zone, location)
      VALUES ($1, $2,
        'Sang O- (Poches)', 'Sang total groupe O Rhésus négatif',
        'injectable', 'poche',
        23, 8, 'cold', 'Banque de sang')
      ON CONFLICT DO NOTHING
      RETURNING id
    `, [tenantId, facKinId]);

    let sangKinId: string;
    if (sangKinR.rowCount === 0) {
      const ex = await client.query(
        `SELECT id FROM resources WHERE tenant_id=$1 AND facility_id=$2 AND name='Sang O- (Poches)'`,
        [tenantId, facKinId]
      );
      sangKinId = ex.rows[0]?.id;
      if (sangKinId) {
        await client.query(
          `UPDATE resources SET total_quantity=23, alert_threshold=8 WHERE id=$1`,
          [sangKinId]
        );
        console.log('   ✓ Sang O- Kinshasa remis à 23 poches (surplus)');
      }
    } else {
      sangKinId = sangKinR.rows[0].id;
      console.log('   ✓ Sang O- Kinshasa : 23 poches (surplus)');
    }

    const kinOthers = [
      { name: 'Artésunate Injectable', dci: 'Artésunate 60mg', cat: 'antipaludique', unit: 'ampoule', qty: 1240, alert: 400 },
      { name: 'Ceftriaxone 1g',        dci: 'Ceftriaxone',     cat: 'antibiotique',  unit: 'flacon',  qty: 2100, alert: 600 },
      { name: 'Vaccin BCG',            dci: 'BCG',             cat: 'vaccin',        unit: 'dose',    qty: 3400, alert: 1000 },
      { name: 'Sérum Physiologique',   dci: 'NaCl 0.9%',       cat: 'injectable',    unit: 'poche',   qty: 680,  alert: 200  },
      { name: 'Ténofovir-Lamivudine-Dolutégravir', dci: 'TLD', cat: 'arv', unit: 'comprimé', qty: 12000, alert: 5000 },
      { name: 'Tests Rapides Paludisme', dci: 'RDT Pf/Pan',   cat: 'diagnostic',    unit: 'test',    qty: 1800, alert: 500  },
      { name: 'Amoxicilline 500mg',    dci: 'Amoxicilline',    cat: 'antibiotique',  unit: 'comprimé', qty: 18000, alert: 6000 },
      { name: 'Gants Stériles',        dci: null,              cat: 'materiel',      unit: 'paire',   qty: 5000, alert: 1000 },
      { name: 'Seringues 5ml',         dci: null,              cat: 'materiel',      unit: 'unité',   qty: 12000, alert: 3000 },
    ];
    for (const r of kinOthers) {
      await client.query(`
        INSERT INTO resources (tenant_id, facility_id, name, dci, category, unit_of_measure, total_quantity, alert_threshold, zone, location)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,
          CASE WHEN $5 IN ('vaccin','injectable','arv') THEN 'cold' ELSE 'dry' END,
          'Stock Principal')
        ON CONFLICT DO NOTHING
      `, [tenantId, facKinId, r.name, r.dci, r.cat, r.unit, r.qty, r.alert]);
    }
    console.log(`   ✓ ${kinOthers.length} autres ressources Kinshasa créées`);

    // ── 7. Lots Sang O- ──────────────────────────────────────────────────────
    // Goma : 1 lot presque vide
    if (sangGomaId!) {
      await client.query(`
        INSERT INTO batches (tenant_id, resource_id, batch_number, quantity, expiry_date, supplier)
        VALUES ($1, $2, 'LOT-SANG-GOMA-2024-047', 4, '2026-09-15', 'CROS Congo')
        ON CONFLICT DO NOTHING
      `, [tenantId, sangGomaId]);
    }
    // Kinshasa : 2 lots avec du surplus
    if (sangKinId!) {
      await client.query(`
        INSERT INTO batches (tenant_id, resource_id, batch_number, quantity, expiry_date, supplier)
        VALUES
          ($1, $2, 'LOT-SANG-KIN-2024-112', 15, '2026-11-20', 'CROS Congo'),
          ($1, $2, 'LOT-SANG-KIN-2024-098', 8,  '2026-10-05', 'CROS Congo')
        ON CONFLICT DO NOTHING
      `, [tenantId, sangKinId]);
    }
    console.log('\n   ✓ Lots Sang O- créés (Goma: 1 lot ×4, Kinshasa: 2 lots ×15+×8)');

    // ── 8. Alerte critique Goma ──────────────────────────────────────────────
    console.log('\n🚨 Alerte critique');
    if (sangGomaId!) {
      await client.query(`
        INSERT INTO alerts
          (tenant_id, facility_id, resource_id, alert_type, severity, title, description)
        VALUES ($1, $2, $3,
          'stock_bas', 'critical',
          'CRITIQUE — Sang O- : 4 poches restantes',
          'Le stock de Sang O- est à 4 poches (seuil d''alerte : 10). Risque de rupture imminente. Transfert urgent requis depuis un établissement source.')
        ON CONFLICT DO NOTHING
      `, [tenantId, facGomaId, sangGomaId]);
      console.log('   ✓ Alerte CRITIQUE Sang O- @ Goma créée');
    }

    // ── 9. Transfert pré-configuré (pending — à approuver en live) ───────────
    console.log('\n📦 Transfert URGENT pré-configuré');
    if (sangGomaId! && sangKinId!) {
      await client.query(`
        INSERT INTO transfers
          (tenant_id, ref, resource_id, quantity,
           requesting_facility_id, source_facility_id,
           status, priority, motif)
        VALUES ($1, $2, $3, 8, $4, $5, 'pending', 'URGENTE',
                'Rupture imminente Sang O- — patient en attente de transfusion')
        ON CONFLICT DO NOTHING
      `, [tenantId, TRANSFER_REF, sangGomaId, facGomaId, facKinId]);
      console.log(`   ✓ Transfert ${TRANSFER_REF} créé (pending — 8 poches, URGENTE)`);
      console.log(`   ✓ Goma → Kinshasa, Sang O-`);
    }

    // ── 10. Mouvements initiaux ──────────────────────────────────────────────
    if (sangGomaId!) {
      await client.query(`
        INSERT INTO inventory_movements (tenant_id, resource_id, delta, reason, user_id, location)
        VALUES ($1, $2, 4, 'Stock initial démo', $3, 'Banque de sang')
        ON CONFLICT DO NOTHING
      `, [tenantId, sangGomaId, adminId]).catch(() => {});
    }
    if (sangKinId!) {
      await client.query(`
        INSERT INTO inventory_movements (tenant_id, resource_id, delta, reason, user_id, location)
        VALUES ($1, $2, 23, 'Stock initial démo', $3, 'Banque de sang')
        ON CONFLICT DO NOTHING
      `, [tenantId, sangKinId, adminId]).catch(() => {});
    }

    await client.end();

    // ── Récap final ──────────────────────────────────────────────────────────
    console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║              🎬  SCÉNARIO VIDÉO PRÊT — VitalGrid Demo               ║
╠══════════════════════════════════════════════════════════════════════╣
║  Mot de passe universel : Demo2026!                                  ║
╠══════════════════════════════════════════════════════════════════════╣
║  RÔLE              EMAIL                        FACILITY             ║
║  ──────────────    ─────────────────────────    ─────────────────── ║
║  field_agent   →   demo.field@vitalgrid.io      Goma (pénurie)      ║
║  facility_mgr  →   demo.manager@vitalgrid.io    Kinshasa (surplus)  ║
║  ngo_coord     →   demo.ngo@vitalgrid.io        Vue régionale       ║
║  super_admin   →   demo.admin@vitalgrid.io      Global              ║
╠══════════════════════════════════════════════════════════════════════╣
║  SCÉNARIO RECOMMANDÉ POUR LA VIDÉO :                                 ║
║                                                                      ║
║  1. Connecte-toi demo.field@vitalgrid.io                            ║
║     → Alerte rouge "Sang O- : 4 poches — CRITIQUE" visible          ║
║                                                                      ║
║  2. Clique sur le transfert ${TRANSFER_REF}                   ║
║     → Statut "En attente d'approbation"                              ║
║                                                                      ║
║  3. Bascule sur demo.manager@vitalgrid.io                           ║
║     → Notification de transfert entrant — approuver en direct        ║
║                                                                      ║
║  4. Montre la chaîne du froid IoT                                    ║
║     → /alerts/cold-chain?transferId=${TRANSFER_REF}      ║
║     → Incident à 8.4°C visible sur le graphique                     ║
║                                                                      ║
║  5. Bascule sur demo.ngo@vitalgrid.io                               ║
║     → Carte régionale : Goma (rouge) + Kinshasa (vert)              ║
╚══════════════════════════════════════════════════════════════════════╝

  URL : http://localhost:3000/login
`);

  } catch (err) {
    console.error('\n❌ Erreur:', err);
    await client.end().catch(() => {});
    process.exit(1);
  }
}

run().catch(e => { console.error(e); process.exit(1); });
