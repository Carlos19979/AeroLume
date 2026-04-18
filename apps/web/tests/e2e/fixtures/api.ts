import postgres from 'postgres';

export interface ApiClient {
  get<T = unknown>(path: string): Promise<{ status: number; body: T }>;
  post<T = unknown>(path: string, body?: unknown): Promise<{ status: number; body: T }>;
  put<T = unknown>(path: string, body?: unknown): Promise<{ status: number; body: T }>;
  del<T = unknown>(path: string): Promise<{ status: number; body: T }>;
}

async function parseBody<T>(res: Response): Promise<T> {
  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    return (await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}

function buildUrl(baseURL: string, path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = baseURL.replace(/\/+$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}

export function apiClient(baseURL: string, apiKey: string): ApiClient {
  const headers = {
    'x-api-key': apiKey,
    'content-type': 'application/json',
  } as const;

  return {
    async get(path) {
      const res = await fetch(buildUrl(baseURL, path), { method: 'GET', headers });
      return { status: res.status, body: await parseBody(res) };
    },
    async post(path, body) {
      const res = await fetch(buildUrl(baseURL, path), {
        method: 'POST',
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      return { status: res.status, body: await parseBody(res) };
    },
    async put(path, body) {
      const res = await fetch(buildUrl(baseURL, path), {
        method: 'PUT',
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      return { status: res.status, body: await parseBody(res) };
    },
    async del(path) {
      const res = await fetch(buildUrl(baseURL, path), { method: 'DELETE', headers });
      return { status: res.status, body: await parseBody(res) };
    },
  };
}

// ---------------------------------------------------------------------------
// Direct DB query helper for assertions (singleton lazy connection)
// ---------------------------------------------------------------------------

let _sql: ReturnType<typeof postgres> | null = null;

function getSql() {
  if (!_sql) {
    const url = process.env.E2E_DATABASE_URL;
    if (!url) throw new Error('E2E_DATABASE_URL not set');
    _sql = postgres(url, { max: 2, idle_timeout: 5 });
  }
  return _sql;
}

/**
 * Lightweight positional-parameter query helper for E2E assertions.
 *
 * Usage:
 *   const rows = await dbQuery<{ id: string }>(
 *     'SELECT id FROM tenants WHERE slug = $1',
 *     [slug],
 *   );
 */
export async function dbQuery<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const client = getSql();
  // postgres.js supports parameterized queries via .unsafe() when the query is a plain string.
  const result = await client.unsafe<T[]>(sql, params as never[]);
  return result as unknown as T[];
}

export async function closeDbQuery(): Promise<void> {
  if (_sql) {
    await _sql.end({ timeout: 2 }).catch(() => undefined);
    _sql = null;
  }
}
