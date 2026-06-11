// scripts/_test-utils.ts
const BASE = 'http://localhost:3000';

let _passed = 0;
let _failed = 0;
const _failures: string[] = [];

export interface RequestResult {
  status: number;
  data: unknown;
  cookie: string;
}

export async function request(
  path: string,
  opts: { method?: string; body?: unknown; cookie?: string } = {}
): Promise<RequestResult> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts.cookie) headers['Cookie'] = opts.cookie;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: opts.method ?? 'GET',
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    });
  } catch (err: unknown) {
    clearTimeout(timer);
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Erreur réseau ${opts.method ?? 'GET'} ${BASE}${path}: ${msg}`);
  }
  clearTimeout(timer);

  // Extraire tous les Set-Cookie et les combiner
  const getSetCookie = (res.headers as any).getSetCookie as (() => string[]) | undefined;
  const rawCookies = getSetCookie?.() ?? [];
  const cookie = rawCookies.map((c: string) => c.split(';')[0]).join('; ');

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    if (res.status >= 400) {
      process.stderr.write(`  \x1b[90m⚠ Corps non-JSON pour ${opts.method ?? 'GET'} ${path} (${res.status})\x1b[0m\n`);
    }
  }

  return { status: res.status, data, cookie };
}

export function check(label: string, pass: boolean, note = ''): void {
  const icon  = pass ? '✓' : '✗';
  const color = pass ? '\x1b[32m' : '\x1b[31m';
  const reset = '\x1b[0m';
  const noteStr = note ? `  \x1b[90m${note}\x1b[0m` : '';
  console.log(`  ${color}${icon}${reset} ${label.padEnd(45)}${noteStr}`);
  if (pass) _passed++; else { _failed++; _failures.push(label); }
}

export function section(title: string): void {
  console.log(`\n\x1b[1m[${title}]\x1b[0m`);
}

export function summary(): void {
  const total = _passed + _failed;
  console.log('\n' + '═'.repeat(52));
  if (_failed === 0) {
    console.log(`\x1b[32m  ${_passed} / ${total} tests passés ✓\x1b[0m`);
  } else {
    console.log(`\x1b[31m  ${_passed} / ${total} tests passés  (${_failed} échec(s))\x1b[0m`);
    _failures.forEach(f => console.log(`  \x1b[31m✗\x1b[0m ${f}`));
  }
  console.log('═'.repeat(52) + '\n');
  process.exit(_failed > 0 ? 1 : 0);
}
