'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import type { Role } from '@/lib/types';

export interface AuthUser {
  id:         string;
  email:      string;
  name:       string;
  role:       Role;
  tenantId:   string;
  orgId:      string;
  facilityId: string | null;
}

interface AuthContextValue {
  user:    AuthUser | null;
  loading: boolean;
  logout:  () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null, loading: true, logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    apiFetch<AuthUser>('/api/auth/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
