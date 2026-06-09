# VitalGrid Backend — Plan A: IAM + Migration + API Routes

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connecter Aurora DSQL, créer le schéma complet, implémenter tous les repository services et routes API Next.js pour les 8 modules de VitalGrid.

**Architecture:** Next.js 16 App Router avec Route Handlers (`src/app/api/**/route.ts`). Chaque module a son repository (`src/lib/repos/*.ts`) qui encapsule l'accès DSQL. Les routes API appellent uniquement le repository de leur module — jamais une autre table directement.

**Tech Stack:** Next.js 16, Aurora DSQL, `@aws-sdk/dsql-signer`, `pg`, `tsx`, `dotenv`

---

## Prérequis — Débloquer l'accès IAM DSQL

Avant toute chose : le user IAM actif sur la machine doit avoir `dsql:DbConnectAdmin`.

- [ ] Sur la console AWS → **IAM → Users → [ton user actif]**
- [ ] **Permissions → Add permissions → Attach policies directly**
- [ ] Cherche **`VitalGridDSQLPolicy`** → coche → **Add permissions**
- [ ] Vérifie avec : `! aws sts get-caller-identity` (doit retourner ton ARN)
- [ ] Test migration : `npx tsx --env-file=.env.local scripts/migrate.ts`
- [ ] Résultat attendu : `✅ Migration complete` avec toutes les tables ✓

---

## Task 1 : Types partagés

**Files:**
- Create: `src/lib/types.ts`

- [ ] Créer `src/lib/types.ts` :

```typescript
export type Role = 'super_admin' | 'facility_manager' | 'field_agent' | 'ngo_coordinator' | 'auditor';
export type FacilityStatus = 'active' | 'offline' | 'critical' | 'warning';
export type TransferStatus = 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'completed' | 'incident' | 'cancelled';
export type AlertSeverity = 'critical' | 'warning';
export type AlertType = 'low_stock' | 'expiry' | 'temperature' | 'sync_inactive';
export type ResourceCategory = 'sang' | 'medicaments' | 'vaccins' | 'materiel' | 'autre';

export interface Organization {
  id: string;
  name: string;
  type: string;
  country_code: string;
  regions: string[];
  logo_url: string | null;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Facility {
  id: string;
  tenant_id: string;
  org_id: string;
  name: string;
  type: string;
  country_code: string;
  region: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  storage_zones: string[];
  bed_capacity: number | null;
  status: FacilityStatus;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  tenant_id: string;
  org_id: string;
  facility_id: string | null;
  email: string;
  name: string;
  role: Role;
  zone: string | null;
  status: string;
  last_login_at: string | null;
  created_at: string;
}

export interface Resource {
  id: string;
  tenant_id: string;
  facility_id: string;
  name: string;
  dci: string | null;
  category: ResourceCategory;
  zone: string | null;
  unit_of_measure: string;
  total_quantity: number;
  alert_threshold: number;
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Batch {
  id: string;
  tenant_id: string;
  resource_id: string;
  batch_number: string;
  quantity: number;
  expiry_date: string;
  supplier: string | null;
  order_number: string | null;
  created_at: string;
}

export interface InventoryMovement {
  id: string;
  tenant_id: string;
  resource_id: string;
  batch_id: string | null;
  delta: number;
  reason: string;
  location: string | null;
  user_id: string | null;
  transfer_id: string | null;
  created_at: string;
}

export interface Transfer {
  id: string;
  tenant_id: string;
  ref: string;
  resource_id: string;
  quantity: number;
  requesting_facility_id: string;
  source_facility_id: string | null;
  motif: string | null;
  priority: string;
  is_emergency: boolean;
  status: TransferStatus;
  needed_by: string | null;
  transport_notes: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  vehicle_ref: string | null;
  received_qty: number | null;
  packaging_ok: boolean | null;
  temp_at_opening: number | null;
  condition: string | null;
  receipt_notes: string | null;
  receipt_photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  tenant_id: string;
  facility_id: string;
  resource_id: string | null;
  transfer_id: string | null;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string | null;
  is_read: boolean;
  resolved_at: string | null;
  created_at: string;
}

export interface AuditEntry {
  id: string;
  tenant_id: string;
  user_id: string | null;
  user_label: string | null;
  action: string;
  detail: string | null;
  result: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export function apiError(message: string, status = 400): Response {
  return Response.json({ error: message }, { status });
}

export function apiOk<T>(data: T, status = 200): Response {
  return Response.json(data, { status });
}
```

- [ ] Build check : `npm run build` — doit passer sans erreur

---

## Task 2 : Repository — Inventaire

**Files:**
- Create: `src/lib/repos/inventory.ts`

- [ ] Créer `src/lib/repos/inventory.ts` :

```typescript
import { query, queryOne, transact } from '@/lib/db';
import type { Resource, Batch, InventoryMovement, PaginatedResponse } from '@/lib/types';

export async function listResources(
  tenantId: string,
  opts: { category?: string; status?: string; zone?: string; search?: string; page?: number; limit?: number }
): Promise<PaginatedResponse<Resource>> {
  const page = opts.page ?? 1;
  const limit = opts.limit ?? 25;
  const offset = (page - 1) * limit;

  const conditions: string[] = ['tenant_id = $1'];
  const params: unknown[] = [tenantId];
  let i = 2;

  if (opts.category) { conditions.push(`category = $${i++}`); params.push(opts.category); }
  if (opts.zone)     { conditions.push(`zone = $${i++}`);     params.push(opts.zone); }
  if (opts.search)   { conditions.push(`(name ILIKE $${i} OR dci ILIKE $${i++})`); params.push(`%${opts.search}%`); }
  if (opts.status === 'critical') { conditions.push(`total_quantity <= alert_threshold`); }
  if (opts.status === 'ok')       { conditions.push(`total_quantity > alert_threshold`); }

  const where = conditions.join(' AND ');

  const [countRow] = await query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM resources WHERE ${where}`, params
  );
  const total = parseInt(countRow?.count ?? '0', 10);

  params.push(limit, offset);
  const data = await query<Resource>(
    `SELECT * FROM resources WHERE ${where}
     ORDER BY CASE WHEN total_quantity <= alert_threshold THEN 0 ELSE 1 END, name
     LIMIT $${i} OFFSET $${i + 1}`,
    params
  );

  return { data, total, page, limit };
}

export async function getResource(tenantId: string, id: string): Promise<Resource | null> {
  return queryOne<Resource>(
    'SELECT * FROM resources WHERE tenant_id = $1 AND id = $2',
    [tenantId, id]
  );
}

export async function getBatchesForResource(tenantId: string, resourceId: string): Promise<Batch[]> {
  return query<Batch>(
    'SELECT * FROM batches WHERE tenant_id = $1 AND resource_id = $2 ORDER BY expiry_date ASC',
    [tenantId, resourceId]
  );
}

export async function getMovements(tenantId: string, resourceId: string): Promise<InventoryMovement[]> {
  return query<InventoryMovement>(
    `SELECT * FROM inventory_movements
     WHERE tenant_id = $1 AND resource_id = $2
     ORDER BY created_at DESC LIMIT 30`,
    [tenantId, resourceId]
  );
}

export async function getLowStock(tenantId: string, facilityId: string): Promise<Resource[]> {
  return query<Resource>(
    `SELECT * FROM resources
     WHERE tenant_id = $1 AND facility_id = $2 AND total_quantity <= alert_threshold
     ORDER BY total_quantity ASC`,
    [tenantId, facilityId]
  );
}

export async function getExpiring(tenantId: string, facilityId: string, daysAhead = 30): Promise<Batch[]> {
  return query<Batch>(
    `SELECT b.*, r.name AS resource_name, r.unit_of_measure
     FROM batches b
     JOIN resources r ON r.id = b.resource_id
     WHERE b.tenant_id = $1 AND r.facility_id = $2
       AND b.expiry_date <= CURRENT_DATE + INTERVAL '1 day' * $3
     ORDER BY b.expiry_date ASC`,
    [tenantId, facilityId, daysAhead]
  );
}

export async function createResource(
  tenantId: string,
  data: { facility_id: string; name: string; dci?: string; category: string; zone?: string; unit_of_measure: string; alert_threshold?: number; location?: string; notes?: string }
): Promise<Resource> {
  return transact(async (client) => {
    const [resource] = await client.query<Resource>(
      `INSERT INTO resources (tenant_id, facility_id, name, dci, category, zone, unit_of_measure, alert_threshold, location, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [tenantId, data.facility_id, data.name, data.dci ?? null, data.category, data.zone ?? null,
       data.unit_of_measure, data.alert_threshold ?? 0, data.location ?? null, data.notes ?? null]
    );
    return resource.rows[0];
  });
}

export async function addBatch(
  tenantId: string,
  data: { resource_id: string; batch_number: string; quantity: number; expiry_date: string; supplier?: string; order_number?: string }
): Promise<Batch> {
  return transact(async (client) => {
    const [batch] = await client.query<Batch>(
      `INSERT INTO batches (tenant_id, resource_id, batch_number, quantity, expiry_date, supplier, order_number)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [tenantId, data.resource_id, data.batch_number, data.quantity, data.expiry_date,
       data.supplier ?? null, data.order_number ?? null]
    );
    await client.query(
      `UPDATE resources SET total_quantity = total_quantity + $1, updated_at = NOW()
       WHERE tenant_id = $2 AND id = $3`,
      [data.quantity, tenantId, data.resource_id]
    );
    await client.query(
      `INSERT INTO inventory_movements (tenant_id, resource_id, batch_id, delta, reason)
       VALUES ($1,$2,$3,$4,'Ajout lot')`,
      [tenantId, data.resource_id, batch.rows[0].id, data.quantity]
    );
    return batch.rows[0];
  });
}
```

- [ ] Build check : `npm run build`

---

## Task 3 : Repository — Transferts

**Files:**
- Create: `src/lib/repos/transfers.ts`

- [ ] Créer `src/lib/repos/transfers.ts` :

```typescript
import { query, queryOne, transact } from '@/lib/db';
import type { Transfer, PaginatedResponse } from '@/lib/types';

function nextRef(): string {
  return `TRF-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

export async function listTransfers(
  tenantId: string,
  opts: { facilityId?: string; status?: string; page?: number; limit?: number }
): Promise<PaginatedResponse<Transfer>> {
  const page = opts.page ?? 1;
  const limit = opts.limit ?? 25;
  const offset = (page - 1) * limit;

  const conditions = ['tenant_id = $1'];
  const params: unknown[] = [tenantId];
  let i = 2;

  if (opts.facilityId) {
    conditions.push(`(requesting_facility_id = $${i} OR source_facility_id = $${i++})`);
    params.push(opts.facilityId);
  }
  if (opts.status) { conditions.push(`status = $${i++}`); params.push(opts.status); }

  const where = conditions.join(' AND ');
  const [countRow] = await query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM transfers WHERE ${where}`, params
  );
  const total = parseInt(countRow?.count ?? '0', 10);

  params.push(limit, offset);
  const data = await query<Transfer>(
    `SELECT * FROM transfers WHERE ${where} ORDER BY created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
    params
  );
  return { data, total, page, limit };
}

export async function getTransfer(tenantId: string, id: string): Promise<Transfer | null> {
  return queryOne<Transfer>(
    'SELECT * FROM transfers WHERE tenant_id = $1 AND id = $2',
    [tenantId, id]
  );
}

export async function createTransfer(
  tenantId: string,
  data: {
    resource_id: string; quantity: number; requesting_facility_id: string;
    source_facility_id?: string; motif?: string; priority?: string;
    is_emergency?: boolean; needed_by?: string; transport_notes?: string;
  }
): Promise<Transfer> {
  return transact(async (client) => {
    // Validate resource exists and belongs to tenant
    const res = await client.query(
      'SELECT total_quantity FROM resources WHERE tenant_id = $1 AND id = $2',
      [tenantId, data.resource_id]
    );
    if (res.rowCount === 0) throw new Error('ERR_RESOURCE_NOT_FOUND');

    const [transfer] = await client.query<Transfer>(
      `INSERT INTO transfers
         (tenant_id, ref, resource_id, quantity, requesting_facility_id, source_facility_id,
          motif, priority, is_emergency, needed_by, transport_notes, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'pending') RETURNING *`,
      [tenantId, nextRef(), data.resource_id, data.quantity, data.requesting_facility_id,
       data.source_facility_id ?? null, data.motif ?? null, data.priority ?? 'NORMALE',
       data.is_emergency ?? false, data.needed_by ?? null, data.transport_notes ?? null]
    );
    return transfer.rows[0];
  });
}

export async function updateTransferStatus(
  tenantId: string, id: string, status: string
): Promise<Transfer | null> {
  return transact(async (client) => {
    const res = await client.query<Transfer>(
      `UPDATE transfers SET status = $1, updated_at = NOW()
       WHERE tenant_id = $2 AND id = $3 RETURNING *`,
      [status, tenantId, id]
    );
    return res.rows[0] ?? null;
  });
}

export async function confirmReceipt(
  tenantId: string,
  id: string,
  data: { received_qty: number; packaging_ok: boolean; temp_at_opening?: number; condition: string; notes?: string }
): Promise<Transfer> {
  return transact(async (client) => {
    const tf = await client.query<Transfer>(
      'SELECT * FROM transfers WHERE tenant_id = $1 AND id = $2',
      [tenantId, id]
    );
    if (tf.rowCount === 0) throw new Error('ERR_TRANSFER_NOT_FOUND');
    const transfer = tf.rows[0];
    if (transfer.status === 'completed') throw new Error('ERR_ALREADY_CONFIRMED');

    // Increment stock of requesting facility
    await client.query(
      `UPDATE resources SET total_quantity = total_quantity + $1, updated_at = NOW()
       WHERE tenant_id = $2 AND id = $3`,
      [data.received_qty, tenantId, transfer.resource_id]
    );

    // Log movement
    await client.query(
      `INSERT INTO inventory_movements (tenant_id, resource_id, delta, reason, transfer_id)
       VALUES ($1,$2,$3,'Réception transfert',$4)`,
      [tenantId, transfer.resource_id, data.received_qty, id]
    );

    const updated = await client.query<Transfer>(
      `UPDATE transfers SET
         status = 'completed', received_qty = $1, packaging_ok = $2,
         temp_at_opening = $3, condition = $4, receipt_notes = $5, updated_at = NOW()
       WHERE tenant_id = $6 AND id = $7 RETURNING *`,
      [data.received_qty, data.packaging_ok, data.temp_at_opening ?? null,
       data.condition, data.notes ?? null, tenantId, id]
    );
    return updated.rows[0];
  });
}
```

- [ ] Build check : `npm run build`

---

## Task 4 : Repository — Alertes

**Files:**
- Create: `src/lib/repos/alerts.ts`

- [ ] Créer `src/lib/repos/alerts.ts` :

```typescript
import { query, queryOne, transact } from '@/lib/db';
import type { Alert } from '@/lib/types';

export async function listAlerts(
  tenantId: string,
  opts: { facilityId?: string; read?: boolean; severity?: string; page?: number; limit?: number }
): Promise<{ data: Alert[]; unreadCount: number }> {
  const conditions = ['tenant_id = $1'];
  const params: unknown[] = [tenantId];
  let i = 2;

  if (opts.facilityId) { conditions.push(`facility_id = $${i++}`); params.push(opts.facilityId); }
  if (opts.read !== undefined) { conditions.push(`is_read = $${i++}`); params.push(opts.read); }
  if (opts.severity) { conditions.push(`severity = $${i++}`); params.push(opts.severity); }

  const where = conditions.join(' AND ');
  const data = await query<Alert>(
    `SELECT * FROM alerts WHERE ${where} ORDER BY created_at DESC LIMIT ${opts.limit ?? 50}`,
    params
  );

  const [countRow] = await query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM alerts WHERE tenant_id = $1 AND is_read = false`,
    [tenantId]
  );

  return { data, unreadCount: parseInt(countRow?.count ?? '0', 10) };
}

export async function markRead(tenantId: string, id: string): Promise<Alert | null> {
  return transact(async (client) => {
    const res = await client.query<Alert>(
      `UPDATE alerts SET is_read = true WHERE tenant_id = $1 AND id = $2 RETURNING *`,
      [tenantId, id]
    );
    return res.rows[0] ?? null;
  });
}

export async function createAlert(
  tenantId: string,
  data: { facility_id: string; resource_id?: string; transfer_id?: string; alert_type: string; severity: string; title: string; description?: string }
): Promise<Alert> {
  return transact(async (client) => {
    const res = await client.query<Alert>(
      `INSERT INTO alerts (tenant_id, facility_id, resource_id, transfer_id, alert_type, severity, title, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [tenantId, data.facility_id, data.resource_id ?? null, data.transfer_id ?? null,
       data.alert_type, data.severity, data.title, data.description ?? null]
    );
    return res.rows[0];
  });
}
```

- [ ] Build check : `npm run build`

---

## Task 5 : Repository — Facilities & Organizations

**Files:**
- Create: `src/lib/repos/facilities.ts`

- [ ] Créer `src/lib/repos/facilities.ts` :

```typescript
import { query, queryOne, transact } from '@/lib/db';
import type { Facility, Organization } from '@/lib/types';

export async function listFacilities(
  tenantId: string,
  opts: { type?: string; region?: string; status?: string; search?: string; page?: number; limit?: number }
): Promise<{ data: Facility[]; total: number }> {
  const conditions = ['tenant_id = $1'];
  const params: unknown[] = [tenantId];
  let i = 2;

  if (opts.type)   { conditions.push(`type = $${i++}`);          params.push(opts.type); }
  if (opts.region) { conditions.push(`region = $${i++}`);        params.push(opts.region); }
  if (opts.status) { conditions.push(`status = $${i++}`);        params.push(opts.status); }
  if (opts.search) { conditions.push(`name ILIKE $${i++}`);      params.push(`%${opts.search}%`); }

  const where = conditions.join(' AND ');
  const limit = opts.limit ?? 25;
  const offset = ((opts.page ?? 1) - 1) * limit;

  const [countRow] = await query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM facilities WHERE ${where}`, params
  );
  const total = parseInt(countRow?.count ?? '0', 10);

  params.push(limit, offset);
  const data = await query<Facility>(
    `SELECT * FROM facilities WHERE ${where} ORDER BY name LIMIT $${i} OFFSET $${i + 1}`,
    params
  );
  return { data, total };
}

export async function getFacility(tenantId: string, id: string): Promise<Facility | null> {
  return queryOne<Facility>(
    'SELECT * FROM facilities WHERE tenant_id = $1 AND id = $2',
    [tenantId, id]
  );
}

export async function createFacility(
  tenantId: string, orgId: string,
  data: { name: string; type: string; country_code: string; region?: string; address?: string; lat?: number; lng?: number; contact_name?: string; contact_phone?: string; contact_email?: string; storage_zones?: string[]; bed_capacity?: number }
): Promise<Facility> {
  return transact(async (client) => {
    const res = await client.query<Facility>(
      `INSERT INTO facilities
         (tenant_id, org_id, name, type, country_code, region, address, lat, lng,
          contact_name, contact_phone, contact_email, storage_zones, bed_capacity)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [tenantId, orgId, data.name, data.type, data.country_code, data.region ?? null,
       data.address ?? null, data.lat ?? null, data.lng ?? null,
       data.contact_name ?? null, data.contact_phone ?? null, data.contact_email ?? null,
       JSON.stringify(data.storage_zones ?? []), data.bed_capacity ?? null]
    );
    return res.rows[0];
  });
}

export async function getOrganization(id: string): Promise<Organization | null> {
  return queryOne<Organization>('SELECT * FROM organizations WHERE id = $1', [id]);
}

export async function createOrganization(
  data: { name: string; type: string; country_code: string; regions?: string[]; logo_url?: string }
): Promise<Organization> {
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 100);
  return transact(async (client) => {
    const res = await client.query<Organization>(
      `INSERT INTO organizations (name, type, country_code, regions, logo_url, slug)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [data.name, data.type, data.country_code,
       JSON.stringify(data.regions ?? []), data.logo_url ?? null, slug]
    );
    return res.rows[0];
  });
}
```

- [ ] Build check : `npm run build`

---

## Task 6 : Repository — Audit & Users

**Files:**
- Create: `src/lib/repos/audit.ts`
- Create: `src/lib/repos/users.ts`

- [ ] Créer `src/lib/repos/audit.ts` :

```typescript
import { query, transact } from '@/lib/db';
import type { AuditEntry } from '@/lib/types';

export async function logAction(
  tenantId: string,
  data: { user_id?: string; user_label?: string; action: string; detail?: string; result?: string }
): Promise<void> {
  await transact(async (client) => {
    await client.query(
      `INSERT INTO audit_log (tenant_id, user_id, user_label, action, detail, result)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [tenantId, data.user_id ?? null, data.user_label ?? null,
       data.action, data.detail ?? null, data.result ?? 'success']
    );
  });
}

export async function listAuditLog(
  tenantId: string,
  opts: { page?: number; limit?: number; userId?: string }
): Promise<{ data: AuditEntry[]; total: number }> {
  const conditions = ['tenant_id = $1'];
  const params: unknown[] = [tenantId];
  let i = 2;

  if (opts.userId) { conditions.push(`user_id = $${i++}`); params.push(opts.userId); }

  const where = conditions.join(' AND ');
  const limit = opts.limit ?? 50;
  const offset = ((opts.page ?? 1) - 1) * limit;

  const [countRow] = await query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM audit_log WHERE ${where}`, params
  );
  const total = parseInt(countRow?.count ?? '0', 10);

  params.push(limit, offset);
  const data = await query<AuditEntry>(
    `SELECT * FROM audit_log WHERE ${where} ORDER BY created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
    params
  );
  return { data, total };
}
```

- [ ] Créer `src/lib/repos/users.ts` :

```typescript
import { query, queryOne, transact } from '@/lib/db';
import type { User } from '@/lib/types';

export async function listUsers(
  tenantId: string,
  opts: { role?: string; status?: string; search?: string; page?: number; limit?: number }
): Promise<{ data: User[]; total: number }> {
  const conditions = ['tenant_id = $1'];
  const params: unknown[] = [tenantId];
  let i = 2;

  if (opts.role)   { conditions.push(`role = $${i++}`);              params.push(opts.role); }
  if (opts.status) { conditions.push(`status = $${i++}`);            params.push(opts.status); }
  if (opts.search) { conditions.push(`(name ILIKE $${i} OR email ILIKE $${i++})`); params.push(`%${opts.search}%`); }

  const where = conditions.join(' AND ');
  const limit = opts.limit ?? 25;
  const offset = ((opts.page ?? 1) - 1) * limit;

  const [countRow] = await query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM users WHERE ${where}`, params
  );
  const total = parseInt(countRow?.count ?? '0', 10);

  params.push(limit, offset);
  const data = await query<User>(
    `SELECT id,tenant_id,org_id,facility_id,email,name,role,zone,status,last_login_at,created_at
     FROM users WHERE ${where} ORDER BY name LIMIT $${i} OFFSET $${i + 1}`,
    params
  );
  return { data, total };
}

export async function getUser(tenantId: string, id: string): Promise<User | null> {
  return queryOne<User>(
    `SELECT id,tenant_id,org_id,facility_id,email,name,role,zone,status,last_login_at,created_at
     FROM users WHERE tenant_id = $1 AND id = $2`,
    [tenantId, id]
  );
}

export async function updateUserStatus(tenantId: string, id: string, status: string): Promise<User | null> {
  return transact(async (client) => {
    const res = await client.query<User>(
      `UPDATE users SET status = $1, updated_at = NOW()
       WHERE tenant_id = $2 AND id = $3 RETURNING *`,
      [status, tenantId, id]
    );
    return res.rows[0] ?? null;
  });
}
```

- [ ] Build check : `npm run build`

---

## Task 7 : Helper — tenant context

**Files:**
- Create: `src/lib/tenant.ts`

Le tenant_id identifie l'organisation courante. Pour le hackathon, on le lit depuis un header HTTP (`x-tenant-id`). En production ce sera extrait du JWT.

- [ ] Créer `src/lib/tenant.ts` :

```typescript
import { NextRequest } from 'next/server';

export function getTenantId(req: NextRequest): string | null {
  return req.headers.get('x-tenant-id');
}

export function requireTenant(req: NextRequest): string {
  const id = getTenantId(req);
  if (!id) throw new Error('ERR_NO_TENANT');
  return id;
}
```

- [ ] Build check : `npm run build`

---

## Task 8 : Routes API — Inventaire

**Files:**
- Create: `src/app/api/inventory/route.ts`
- Create: `src/app/api/inventory/[id]/route.ts`
- Create: `src/app/api/inventory/[id]/batches/route.ts`
- Create: `src/app/api/inventory/[id]/movements/route.ts`
- Create: `src/app/api/inventory/low-stock/route.ts`
- Create: `src/app/api/inventory/expiry/route.ts`

- [ ] Créer `src/app/api/inventory/route.ts` :

```typescript
import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { listResources, createResource } from '@/lib/repos/inventory';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const tenantId = requireTenant(req);
    const s = req.nextUrl.searchParams;
    const result = await listResources(tenantId, {
      category: s.get('category') ?? undefined,
      status:   s.get('status')   ?? undefined,
      zone:     s.get('zone')     ?? undefined,
      search:   s.get('search')   ?? undefined,
      page:     Number(s.get('page')  ?? 1),
      limit:    Number(s.get('limit') ?? 25),
    });
    return apiOk(result);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = requireTenant(req);
    const body = await req.json();
    if (!body.facility_id || !body.name || !body.category || !body.unit_of_measure) {
      return apiError('Champs requis manquants');
    }
    const resource = await createResource(tenantId, body);
    return apiOk(resource, 201);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}
```

- [ ] Créer `src/app/api/inventory/[id]/route.ts` :

```typescript
import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { getResource } from '@/lib/repos/inventory';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = requireTenant(req);
    const { id } = await params;
    const resource = await getResource(tenantId, id);
    if (!resource) return apiError('Ressource introuvable', 404);
    return apiOk(resource);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}
```

- [ ] Créer `src/app/api/inventory/[id]/batches/route.ts` :

```typescript
import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { getBatchesForResource, addBatch } from '@/lib/repos/inventory';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = requireTenant(req);
    const { id } = await params;
    const batches = await getBatchesForResource(tenantId, id);
    return apiOk(batches);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = requireTenant(req);
    const { id } = await params;
    const body = await req.json();
    if (!body.batch_number || !body.quantity || !body.expiry_date) {
      return apiError('Champs requis manquants');
    }
    const batch = await addBatch(tenantId, { ...body, resource_id: id });
    return apiOk(batch, 201);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}
```

- [ ] Créer `src/app/api/inventory/[id]/movements/route.ts` :

```typescript
import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { getMovements } from '@/lib/repos/inventory';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = requireTenant(req);
    const { id } = await params;
    const movements = await getMovements(tenantId, id);
    return apiOk(movements);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}
```

- [ ] Créer `src/app/api/inventory/low-stock/route.ts` :

```typescript
import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { getLowStock } from '@/lib/repos/inventory';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const tenantId = requireTenant(req);
    const facilityId = req.nextUrl.searchParams.get('facilityId');
    if (!facilityId) return apiError('facilityId requis');
    const resources = await getLowStock(tenantId, facilityId);
    return apiOk(resources);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}
```

- [ ] Créer `src/app/api/inventory/expiry/route.ts` :

```typescript
import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { getExpiring } from '@/lib/repos/inventory';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const tenantId = requireTenant(req);
    const s = req.nextUrl.searchParams;
    const facilityId = s.get('facilityId');
    if (!facilityId) return apiError('facilityId requis');
    const daysAhead = Number(s.get('daysAhead') ?? 30);
    const batches = await getExpiring(tenantId, facilityId, daysAhead);
    return apiOk(batches);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}
```

- [ ] Build check : `npm run build`

---

## Task 9 : Routes API — Transferts

**Files:**
- Create: `src/app/api/transfers/route.ts`
- Create: `src/app/api/transfers/[id]/route.ts`
- Create: `src/app/api/transfers/[id]/receive/route.ts`

- [ ] Créer `src/app/api/transfers/route.ts` :

```typescript
import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { listTransfers, createTransfer } from '@/lib/repos/transfers';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const tenantId = requireTenant(req);
    const s = req.nextUrl.searchParams;
    const result = await listTransfers(tenantId, {
      facilityId: s.get('facilityId') ?? undefined,
      status:     s.get('status')     ?? undefined,
      page:  Number(s.get('page')  ?? 1),
      limit: Number(s.get('limit') ?? 25),
    });
    return apiOk(result);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = requireTenant(req);
    const body = await req.json();
    if (!body.resource_id || !body.quantity || !body.requesting_facility_id) {
      return apiError('Champs requis manquants');
    }
    const transfer = await createTransfer(tenantId, body);
    return apiOk(transfer, 201);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    if (err.message === 'ERR_RESOURCE_NOT_FOUND') return apiError('Ressource introuvable', 404);
    return apiError('Erreur serveur', 500);
  }
}
```

- [ ] Créer `src/app/api/transfers/[id]/route.ts` :

```typescript
import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { getTransfer, updateTransferStatus } from '@/lib/repos/transfers';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = requireTenant(req);
    const { id } = await params;
    const transfer = await getTransfer(tenantId, id);
    if (!transfer) return apiError('Transfert introuvable', 404);
    return apiOk(transfer);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = requireTenant(req);
    const { id } = await params;
    const { status } = await req.json();
    if (!status) return apiError('status requis');
    const transfer = await updateTransferStatus(tenantId, id, status);
    if (!transfer) return apiError('Transfert introuvable', 404);
    return apiOk(transfer);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}
```

- [ ] Créer `src/app/api/transfers/[id]/receive/route.ts` :

```typescript
import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { confirmReceipt } from '@/lib/repos/transfers';
import { logAction } from '@/lib/repos/audit';
import { apiOk, apiError } from '@/lib/types';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = requireTenant(req);
    const { id } = await params;
    const body = await req.json();
    if (!body.received_qty || body.packaging_ok === undefined || !body.condition) {
      return apiError('Champs requis manquants');
    }
    const transfer = await confirmReceipt(tenantId, id, body);
    await logAction(tenantId, {
      action: 'confirm_receipt',
      detail: `Transfert ${transfer.ref} confirmé reçu (${body.received_qty} unités)`,
    });
    return apiOk(transfer);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    if (err.message === 'ERR_ALREADY_CONFIRMED') return apiError('Déjà confirmé', 409);
    if (err.message === 'ERR_TRANSFER_NOT_FOUND') return apiError('Transfert introuvable', 404);
    return apiError('Erreur serveur', 500);
  }
}
```

- [ ] Build check : `npm run build`

---

## Task 10 : Routes API — Alertes & Dashboard

**Files:**
- Create: `src/app/api/alerts/route.ts`
- Create: `src/app/api/alerts/[id]/read/route.ts`
- Create: `src/app/api/dashboard/summary/route.ts`

- [ ] Créer `src/app/api/alerts/route.ts` :

```typescript
import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { listAlerts, createAlert } from '@/lib/repos/alerts';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const tenantId = requireTenant(req);
    const s = req.nextUrl.searchParams;
    const readParam = s.get('read');
    const result = await listAlerts(tenantId, {
      facilityId: s.get('facilityId') ?? undefined,
      read:       readParam !== null ? readParam === 'true' : undefined,
      severity:   s.get('severity')   ?? undefined,
      limit:      Number(s.get('limit') ?? 50),
    });
    return apiOk(result);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = requireTenant(req);
    const body = await req.json();
    if (!body.facility_id || !body.alert_type || !body.severity || !body.title) {
      return apiError('Champs requis manquants');
    }
    const alert = await createAlert(tenantId, body);
    return apiOk(alert, 201);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}
```

- [ ] Créer `src/app/api/alerts/[id]/read/route.ts` :

```typescript
import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { markRead } from '@/lib/repos/alerts';
import { apiOk, apiError } from '@/lib/types';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = requireTenant(req);
    const { id } = await params;
    const alert = await markRead(tenantId, id);
    if (!alert) return apiError('Alerte introuvable', 404);
    return apiOk(alert);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}
```

- [ ] Créer `src/app/api/dashboard/summary/route.ts` :

```typescript
import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { query } from '@/lib/db';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const tenantId = requireTenant(req);
    const facilityId = req.nextUrl.searchParams.get('facilityId');
    if (!facilityId) return apiError('facilityId requis');

    const [resources] = await query<{ count: string }>(
      'SELECT COUNT(*) AS count FROM resources WHERE tenant_id = $1 AND facility_id = $2',
      [tenantId, facilityId]
    );
    const [criticalAlerts] = await query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM alerts
       WHERE tenant_id = $1 AND facility_id = $2 AND severity = 'critical' AND is_read = false`,
      [tenantId, facilityId]
    );
    const [activeTransfers] = await query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM transfers
       WHERE tenant_id = $1 AND requesting_facility_id = $2
         AND status IN ('pending','confirmed','in_transit')`,
      [tenantId, facilityId]
    );
    const [expiring] = await query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM batches b
       JOIN resources r ON r.id = b.resource_id
       WHERE b.tenant_id = $1 AND r.facility_id = $2
         AND b.expiry_date <= CURRENT_DATE + INTERVAL '7 days'`,
      [tenantId, facilityId]
    );

    return apiOk({
      totalResources:    parseInt(resources?.count ?? '0', 10),
      criticalAlerts:    parseInt(criticalAlerts?.count ?? '0', 10),
      activeTransfers:   parseInt(activeTransfers?.count ?? '0', 10),
      expiringIn7Days:   parseInt(expiring?.count ?? '0', 10),
    });
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}
```

- [ ] Build check : `npm run build`

---

## Task 11 : Routes API — Facilities & Admin

**Files:**
- Create: `src/app/api/facilities/route.ts`
- Create: `src/app/api/facilities/[id]/route.ts`
- Create: `src/app/api/admin/users/route.ts`
- Create: `src/app/api/admin/audit-log/route.ts`

- [ ] Créer `src/app/api/facilities/route.ts` :

```typescript
import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { listFacilities, createFacility } from '@/lib/repos/facilities';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const tenantId = requireTenant(req);
    const s = req.nextUrl.searchParams;
    const result = await listFacilities(tenantId, {
      type:   s.get('type')   ?? undefined,
      region: s.get('region') ?? undefined,
      status: s.get('status') ?? undefined,
      search: s.get('search') ?? undefined,
      page:   Number(s.get('page')  ?? 1),
      limit:  Number(s.get('limit') ?? 25),
    });
    return apiOk(result);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = requireTenant(req);
    const body = await req.json();
    if (!body.name || !body.type || !body.country_code || !body.org_id) {
      return apiError('Champs requis manquants');
    }
    const facility = await createFacility(tenantId, body.org_id, body);
    return apiOk(facility, 201);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}
```

- [ ] Créer `src/app/api/facilities/[id]/route.ts` :

```typescript
import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { getFacility } from '@/lib/repos/facilities';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = requireTenant(req);
    const { id } = await params;
    const facility = await getFacility(tenantId, id);
    if (!facility) return apiError('Établissement introuvable', 404);
    return apiOk(facility);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}
```

- [ ] Créer `src/app/api/admin/users/route.ts` :

```typescript
import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { listUsers, updateUserStatus } from '@/lib/repos/users';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const tenantId = requireTenant(req);
    const s = req.nextUrl.searchParams;
    const result = await listUsers(tenantId, {
      role:   s.get('role')   ?? undefined,
      status: s.get('status') ?? undefined,
      search: s.get('search') ?? undefined,
      page:   Number(s.get('page')  ?? 1),
      limit:  Number(s.get('limit') ?? 25),
    });
    return apiOk(result);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}
```

- [ ] Créer `src/app/api/admin/audit-log/route.ts` :

```typescript
import { NextRequest } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { listAuditLog } from '@/lib/repos/audit';
import { apiOk, apiError } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const tenantId = requireTenant(req);
    const s = req.nextUrl.searchParams;
    const result = await listAuditLog(tenantId, {
      page:   Number(s.get('page')  ?? 1),
      limit:  Number(s.get('limit') ?? 50),
      userId: s.get('userId') ?? undefined,
    });
    return apiOk(result);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message === 'ERR_NO_TENANT') return apiError('x-tenant-id header requis', 401);
    return apiError('Erreur serveur', 500);
  }
}
```

- [ ] Build check final : `npm run build`
- [ ] Commit :

```bash
git add src/lib/ src/app/api/ scripts/migrate.ts
git commit -m "feat: add repository layer and all API routes for VitalGrid"
```

---

## Récapitulatif des routes API créées

| Route | Méthodes | Module |
|---|---|---|
| `/api/inventory` | GET, POST | Inventaire |
| `/api/inventory/[id]` | GET | Inventaire |
| `/api/inventory/[id]/batches` | GET, POST | Inventaire |
| `/api/inventory/[id]/movements` | GET | Inventaire |
| `/api/inventory/low-stock` | GET | Inventaire |
| `/api/inventory/expiry` | GET | Inventaire |
| `/api/transfers` | GET, POST | Transferts |
| `/api/transfers/[id]` | GET, PATCH | Transferts |
| `/api/transfers/[id]/receive` | POST | Transferts |
| `/api/alerts` | GET, POST | Alertes |
| `/api/alerts/[id]/read` | PATCH | Alertes |
| `/api/dashboard/summary` | GET | Dashboard |
| `/api/facilities` | GET, POST | Facilities |
| `/api/facilities/[id]` | GET | Facilities |
| `/api/admin/users` | GET | Admin |
| `/api/admin/audit-log` | GET | Admin |

## Suite — Plan B

Plan B connectera le frontend aux APIs : chaque page `'use client'` fera des `fetch` vers ces routes et remplacera les états vides par les vraies données DSQL.
