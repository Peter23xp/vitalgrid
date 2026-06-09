export function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  return fetch(path, {
    ...init,
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  }).then(async (res) => {
    if (res.status === 401) {
      window.location.href = '/login';
      throw new Error('Non authentifié');
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  });
}
