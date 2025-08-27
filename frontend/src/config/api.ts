// Centralized API helper with env-based base URL and sensible defaults
export const API_BASE_URL =
  (process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001').replace(/\/$/, '');

export type ApiRequestOptions = RequestInit & {
  path: string;
};

export async function apiFetch<T = any>({ path, headers, ...init }: ApiRequestOptions): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(headers || {}),
      },
      signal: controller.signal,
    });

    const isJson = (response.headers.get('content-type') || '').includes('application/json');
    const body = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const message = isJson ? body?.error || body?.message || 'Request failed' : String(body);
      throw new Error(message);
    }

    return body as T;
  } finally {
    clearTimeout(timeoutId);
  }
}


