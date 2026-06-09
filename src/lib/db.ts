import { DsqlSigner } from '@aws-sdk/dsql-signer';
import { Pool, PoolClient } from 'pg';

const ENDPOINT = process.env.DSQL_CLUSTER_ENDPOINT!;
const REGION = process.env.DSQL_REGION ?? 'us-east-1';
const DATABASE = process.env.DSQL_DATABASE ?? 'postgres';
const USER = process.env.DSQL_DATABASE_USER ?? 'admin';

let pool: Pool | null = null;
let tokenExpiry = 0;

async function generateToken(): Promise<string> {
  const signer = new DsqlSigner({ hostname: ENDPOINT, region: REGION });
  return signer.getDbConnectAdminAuthToken();
}

async function createPool(): Promise<Pool> {
  const token = await generateToken();
  tokenExpiry = Date.now() + 14 * 60 * 1000; // refresh at 14 min (token valid 15 min)

  return new Pool({
    host: ENDPOINT,
    port: 5432,
    database: DATABASE,
    user: USER,
    password: token,
    ssl: { rejectUnauthorized: true },
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
}

export async function getPool(): Promise<Pool> {
  if (!pool || Date.now() >= tokenExpiry) {
    if (pool) await pool.end().catch(() => {});
    pool = await createPool();
  }
  return pool;
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const p = await getPool();
  const { rows } = await p.query(sql, params);
  return rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

const OCC_MAX_RETRIES = 5;
const OCC_BASE_DELAY = 50;

export async function transact<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const p = await getPool();

  for (let attempt = 0; attempt < OCC_MAX_RETRIES; attempt++) {
    const client = await p.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err: unknown) {
      await client.query('ROLLBACK').catch(() => {});
      const pg = err as { code?: string };
      if (pg.code === '40001' && attempt < OCC_MAX_RETRIES - 1) {
        const delay = Math.min(
          OCC_BASE_DELAY * 2 ** attempt + Math.random() * OCC_BASE_DELAY,
          5000
        );
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    } finally {
      client.release();
    }
  }
  throw new Error('OCC retry limit exceeded');
}
