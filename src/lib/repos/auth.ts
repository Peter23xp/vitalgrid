import { queryOne, transact } from '@/lib/db';
import type { Role } from '@/lib/types';

export interface AuthUser {
  id:                     string;
  email:                  string;
  name:                   string;
  role:                   Role;
  tenant_id:              string;
  org_id:                 string;
  facility_id:            string | null;
  password_hash:          string | null;
  status:                 string;
  failed_login_attempts:  number;
  locked_until:           string | null;
}

export async function findUserByEmail(email: string): Promise<AuthUser | null> {
  return queryOne<AuthUser>(
    `SELECT id, email, name, role, tenant_id, org_id, facility_id,
            password_hash, status, failed_login_attempts, locked_until
     FROM users WHERE email = $1`,
    [email]
  );
}

export async function incrementFailedAttempts(userId: string): Promise<void> {
  await transact(async (client) => {
    await client.query(
      `UPDATE users
       SET failed_login_attempts = failed_login_attempts + 1,
           locked_until = CASE
             WHEN failed_login_attempts + 1 >= 5
             THEN NOW() + INTERVAL '30 minutes'
             ELSE locked_until
           END,
           updated_at = NOW()
       WHERE id = $1`,
      [userId]
    );
  });
}

export async function resetFailedAttempts(userId: string): Promise<void> {
  await transact(async (client) => {
    await client.query(
      `UPDATE users SET failed_login_attempts = 0, locked_until = NULL, updated_at = NOW()
       WHERE id = $1`,
      [userId]
    );
  });
}
