import { DsqlSigner } from '@aws-sdk/dsql-signer';
import { Client } from 'pg';

const ENDPOINT = process.env.DSQL_CLUSTER_ENDPOINT!;
const REGION = process.env.DSQL_REGION ?? 'us-east-1';

async function run() {
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
  console.log('Connected to Aurora DSQL');

  const ddl: string[] = [
    // ── Organizations ────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS organizations (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name        VARCHAR(100) NOT NULL,
      type        VARCHAR(50)  NOT NULL,
      country_code VARCHAR(2)  NOT NULL,
      regions     JSONB        NOT NULL DEFAULT '[]',
      logo_url    TEXT,
      slug        VARCHAR(100) NOT NULL UNIQUE,
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )`,

    // ── Facilities ───────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS facilities (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id       UUID NOT NULL,
      org_id          UUID NOT NULL,
      name            VARCHAR(150) NOT NULL,
      type            VARCHAR(50)  NOT NULL,
      country_code    VARCHAR(2)   NOT NULL,
      region          VARCHAR(100),
      address         TEXT,
      lat             DECIMAL(9,6),
      lng             DECIMAL(9,6),
      contact_name    VARCHAR(100),
      contact_phone   VARCHAR(30),
      contact_email   VARCHAR(150),
      storage_zones   JSONB NOT NULL DEFAULT '[]',
      bed_capacity    INTEGER,
      status          VARCHAR(20)  NOT NULL DEFAULT 'active',
      last_sync_at    TIMESTAMPTZ,
      created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )`,

    // ── Users ────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS users (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id       UUID NOT NULL,
      org_id          UUID NOT NULL,
      facility_id     UUID,
      email           VARCHAR(150) NOT NULL UNIQUE,
      name            VARCHAR(100) NOT NULL,
      role            VARCHAR(50)  NOT NULL,
      zone            VARCHAR(100),
      pin_hash        VARCHAR(100),
      status          VARCHAR(20)  NOT NULL DEFAULT 'active',
      last_login_at   TIMESTAMPTZ,
      created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )`,

    // ── Resources ────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS resources (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id       UUID NOT NULL,
      facility_id     UUID NOT NULL,
      name            VARCHAR(150) NOT NULL,
      dci             VARCHAR(150),
      category        VARCHAR(50)  NOT NULL,
      zone            VARCHAR(100),
      unit_of_measure VARCHAR(50)  NOT NULL,
      total_quantity  INTEGER      NOT NULL DEFAULT 0,
      alert_threshold INTEGER      NOT NULL DEFAULT 0,
      location        VARCHAR(100),
      notes           TEXT,
      created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )`,

    // ── Batches (lots) ───────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS batches (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id       UUID NOT NULL,
      resource_id     UUID NOT NULL,
      batch_number    VARCHAR(100) NOT NULL,
      quantity        INTEGER      NOT NULL,
      expiry_date     DATE         NOT NULL,
      supplier        VARCHAR(100),
      order_number    VARCHAR(100),
      created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )`,

    // ── Inventory movements ──────────────────────────────────
    `CREATE TABLE IF NOT EXISTS inventory_movements (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id       UUID NOT NULL,
      resource_id     UUID NOT NULL,
      batch_id        UUID,
      delta           INTEGER      NOT NULL,
      reason          VARCHAR(100) NOT NULL,
      location        VARCHAR(100),
      user_id         UUID,
      transfer_id     UUID,
      created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )`,

    // ── Transfers ────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS transfers (
      id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id               UUID NOT NULL,
      ref                     VARCHAR(20)  NOT NULL UNIQUE,
      resource_id             UUID NOT NULL,
      quantity                INTEGER      NOT NULL,
      requesting_facility_id  UUID NOT NULL,
      source_facility_id      UUID,
      motif                   VARCHAR(100),
      priority                VARCHAR(20)  NOT NULL DEFAULT 'NORMALE',
      is_emergency            BOOLEAN      NOT NULL DEFAULT FALSE,
      status                  VARCHAR(30)  NOT NULL DEFAULT 'pending',
      needed_by               TIMESTAMPTZ,
      transport_notes         TEXT,
      driver_name             VARCHAR(100),
      driver_phone            VARCHAR(30),
      vehicle_ref             VARCHAR(50),
      received_qty            INTEGER,
      packaging_ok            BOOLEAN,
      temp_at_opening         DECIMAL(5,2),
      condition               VARCHAR(20),
      receipt_notes           TEXT,
      receipt_photo_url       TEXT,
      created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )`,

    // ── Alerts ───────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS alerts (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id       UUID NOT NULL,
      facility_id     UUID NOT NULL,
      resource_id     UUID,
      transfer_id     UUID,
      alert_type      VARCHAR(50)  NOT NULL,
      severity        VARCHAR(20)  NOT NULL,
      title           VARCHAR(200) NOT NULL,
      description     TEXT,
      is_read         BOOLEAN      NOT NULL DEFAULT FALSE,
      resolved_at     TIMESTAMPTZ,
      created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )`,

    // ── Cold chain events (IoT) ──────────────────────────────
    `CREATE TABLE IF NOT EXISTS cold_chain_events (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id       UUID NOT NULL,
      transfer_id     UUID NOT NULL,
      device_id       VARCHAR(100) NOT NULL,
      celsius         DECIMAL(5,2) NOT NULL,
      is_alert        BOOLEAN      NOT NULL DEFAULT FALSE,
      recorded_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )`,

    // ── Broadcasts ───────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS broadcasts (
      id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id               UUID NOT NULL,
      resource_type_id        UUID,
      requesting_facility_id  UUID NOT NULL,
      min_qty                 INTEGER      NOT NULL,
      region                  VARCHAR(100),
      response_deadline       TIMESTAMPTZ,
      message                 TEXT,
      recipient_count         INTEGER      NOT NULL DEFAULT 0,
      created_by              UUID,
      created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )`,

    // ── Audit log ────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS audit_log (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id       UUID NOT NULL,
      user_id         UUID,
      user_label      VARCHAR(100),
      action          VARCHAR(100) NOT NULL,
      detail          TEXT,
      result          VARCHAR(20)  NOT NULL DEFAULT 'success',
      created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )`,

    // ── Alert rules ──────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS alert_rules (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id       UUID NOT NULL,
      facility_id     UUID NOT NULL,
      resource_id     UUID,
      category        VARCHAR(50),
      rule_type       VARCHAR(50)  NOT NULL,
      threshold       DECIMAL(10,2),
      severity        VARCHAR(20)  NOT NULL DEFAULT 'warning',
      channels        JSONB        NOT NULL DEFAULT '["push","email"]',
      repeat_interval VARCHAR(20)  NOT NULL DEFAULT 'once',
      is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
      created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )`,
  ];

  // Indexes — MUST be ASYNC and each in its own statement
  const indexes: string[] = [
    `CREATE INDEX ASYNC IF NOT EXISTS idx_facilities_tenant    ON facilities(tenant_id)`,
    `CREATE INDEX ASYNC IF NOT EXISTS idx_facilities_org       ON facilities(org_id)`,
    `CREATE INDEX ASYNC IF NOT EXISTS idx_users_tenant         ON users(tenant_id)`,
    `CREATE INDEX ASYNC IF NOT EXISTS idx_users_email          ON users(email)`,
    `CREATE INDEX ASYNC IF NOT EXISTS idx_resources_tenant     ON resources(tenant_id)`,
    `CREATE INDEX ASYNC IF NOT EXISTS idx_resources_facility   ON resources(facility_id)`,
    `CREATE INDEX ASYNC IF NOT EXISTS idx_resources_category   ON resources(tenant_id, category)`,
    `CREATE INDEX ASYNC IF NOT EXISTS idx_batches_resource     ON batches(resource_id)`,
    `CREATE INDEX ASYNC IF NOT EXISTS idx_batches_expiry       ON batches(expiry_date)`,
    `CREATE INDEX ASYNC IF NOT EXISTS idx_movements_resource   ON inventory_movements(resource_id)`,
    `CREATE INDEX ASYNC IF NOT EXISTS idx_movements_tenant     ON inventory_movements(tenant_id)`,
    `CREATE INDEX ASYNC IF NOT EXISTS idx_transfers_tenant     ON transfers(tenant_id)`,
    `CREATE INDEX ASYNC IF NOT EXISTS idx_transfers_status     ON transfers(tenant_id, status)`,
    `CREATE INDEX ASYNC IF NOT EXISTS idx_transfers_requesting ON transfers(requesting_facility_id)`,
    `CREATE INDEX ASYNC IF NOT EXISTS idx_alerts_tenant        ON alerts(tenant_id)`,
    `CREATE INDEX ASYNC IF NOT EXISTS idx_alerts_facility      ON alerts(facility_id)`,
    `CREATE INDEX ASYNC IF NOT EXISTS idx_alerts_unread        ON alerts(tenant_id, is_read)`,
    `CREATE INDEX ASYNC IF NOT EXISTS idx_cold_chain_transfer  ON cold_chain_events(transfer_id)`,
    `CREATE INDEX ASYNC IF NOT EXISTS idx_audit_tenant         ON audit_log(tenant_id)`,
    `CREATE INDEX ASYNC IF NOT EXISTS idx_audit_created        ON audit_log(created_at)`,
  ];

  console.log('\n── Creating tables ─────────────────────────────');
  for (const sql of ddl) {
    const name = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1] ?? '?';
    try {
      await client.query(sql);
      console.log(`  ✓ ${name}`);
    } catch (err: unknown) {
      const e = err as { message?: string };
      console.error(`  ✗ ${name}: ${e.message}`);
    }
  }

  console.log('\n── Creating indexes (async) ─────────────────────');
  for (const sql of indexes) {
    const name = sql.match(/idx_\w+/)?.[0] ?? '?';
    try {
      await client.query(sql);
      console.log(`  ✓ ${name}`);
    } catch (err: unknown) {
      const e = err as { message?: string };
      console.error(`  ✗ ${name}: ${e.message}`);
    }
  }

  await client.end();
  console.log('\n✅ Migration complete\n');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
