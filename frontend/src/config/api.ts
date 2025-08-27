// Centralized API helper with env-based base URL and sensible defaults
export const API_BASE_URL =
  (process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001').replace(/\/$/, '');

export type ApiRequestOptions = RequestInit & {
  path: string;
};

export async function apiFetch<T = any>({ path, headers, ...init }: ApiRequestOptions): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  // Get auth token from localStorage or sessionStorage
  const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

  // Build headers object safely
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Only add Authorization header if token exists and is valid
  if (authToken && authToken.length > 0) {
    (requestHeaders as any)['Authorization'] = `Bearer ${authToken}`;
  }
  
  // Merge additional headers
  if (headers) {
    Object.assign(requestHeaders, headers);
  }

  // Build fetch options safely
  const fetchOptions: RequestInit = {
    method: init.method || 'GET',
    headers: requestHeaders,
    signal: controller.signal,
  };
  
  // Only add body if it exists and method supports it
  if (init.body && (init.method === 'POST' || init.method === 'PUT' || init.method === 'PATCH')) {
    fetchOptions.body = init.body;
  }
  
  // Copy other safe init properties
  if (init.mode) fetchOptions.mode = init.mode;
  if (init.credentials) fetchOptions.credentials = init.credentials;
  if (init.cache) fetchOptions.cache = init.cache;
  if (init.redirect) fetchOptions.redirect = init.redirect;
  if (init.referrer) fetchOptions.referrer = init.referrer;
  if (init.referrerPolicy) fetchOptions.referrerPolicy = init.referrerPolicy;
  if (init.integrity) fetchOptions.integrity = init.integrity;

  try {
    const response = await fetch(url, fetchOptions);

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


