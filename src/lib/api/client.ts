const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000';

interface RequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, config);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return res.json();
}

export async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const session = await import('next-auth/react').then(m => m.getSession());
  return (session?.user as any)?.token || null;
}

export async function authApiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return apiClient<T>(endpoint, { ...options, headers });
}
