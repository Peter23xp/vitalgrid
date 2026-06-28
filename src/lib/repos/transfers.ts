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
    // Recherche sans filtre tenant pour autoriser les transferts cross-org
    const res = await client.query(
      'SELECT total_quantity FROM resources WHERE id = $1',
      [data.resource_id]
    );
    if (res.rowCount === 0) throw new Error('ERR_RESOURCE_NOT_FOUND');

    const transferRes = await client.query<Transfer>(
      `INSERT INTO transfers
         (tenant_id, ref, resource_id, quantity, requesting_facility_id, source_facility_id,
          motif, priority, is_emergency, needed_by, transport_notes, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'pending') RETURNING *`,
      [tenantId, nextRef(), data.resource_id, data.quantity, data.requesting_facility_id,
       data.source_facility_id ?? null, data.motif ?? null, data.priority ?? 'NORMALE',
       data.is_emergency ?? false, data.needed_by ?? null, data.transport_notes ?? null]
    );
    return transferRes.rows[0];
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

    const destFacilityId = transfer.requesting_facility_id;

    // Find the resource at the DESTINATION facility (same name/category as source resource)
    const srcRes = await client.query<{ name: string; dci: string | null; category: string; unit_of_measure: string; alert_threshold: number }>(
      'SELECT name, dci, category, unit_of_measure, alert_threshold FROM resources WHERE id = $1',
      [transfer.resource_id]
    );
    const src = srcRes.rows[0];

    // Look for matching resource at destination
    let destResId: string | null = null;
    if (src) {
      const destRes = await client.query<{ id: string }>(
        `SELECT id FROM resources WHERE tenant_id = $1 AND facility_id = $2 AND name = $3 LIMIT 1`,
        [tenantId, destFacilityId, src.name]
      );
      if (destRes.rows[0]) {
        destResId = destRes.rows[0].id;
        // Increase stock at destination
        await client.query(
          `UPDATE resources SET total_quantity = total_quantity + $1, updated_at = NOW() WHERE id = $2`,
          [data.received_qty, destResId]
        );
      } else {
        // Resource doesn't exist at destination yet — create it
        const newRes = await client.query<{ id: string }>(
          `INSERT INTO resources (tenant_id, facility_id, name, dci, category, unit_of_measure, total_quantity, alert_threshold, zone, location)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'cold','Reçu par transfert') RETURNING id`,
          [tenantId, destFacilityId, src.name, src.dci, src.category, src.unit_of_measure,
           data.received_qty, src.alert_threshold]
        );
        destResId = newRes.rows[0].id;
      }
    }

    // Log inventory movement at destination
    if (destResId) {
      await client.query(
        `INSERT INTO inventory_movements (tenant_id, resource_id, delta, reason, transfer_id)
         VALUES ($1,$2,$3,'Réception transfert',$4)`,
        [tenantId, destResId, data.received_qty, id]
      );
    }

    // Resolve alerts for this resource at the destination facility
    if (destResId) {
      await client.query(
        `UPDATE alerts SET is_read = true, resolved_at = NOW()
         WHERE tenant_id = $1 AND facility_id = $2 AND resource_id = $3 AND is_read = false`,
        [tenantId, destFacilityId, destResId]
      );
      // Also resolve by resource name if alert was linked to source resource_id
      await client.query(
        `UPDATE alerts SET is_read = true, resolved_at = NOW()
         WHERE tenant_id = $1 AND facility_id = $2 AND resource_id = $3 AND is_read = false`,
        [tenantId, destFacilityId, transfer.resource_id]
      );
    }

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
