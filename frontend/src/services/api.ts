// Use the same-origin proxy by default (Vite in development, Vercel/Nginx in deployment).
const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api/v1';

function getErrorMessage(data: any, status: number): string {
  const detail = data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((issue) => {
      const path = Array.isArray(issue?.loc) ? issue.loc.slice(1).join('.') : 'Request';
      return `${path || 'Request'}: ${issue?.msg || 'Invalid value'}`;
    }).join(' · ');
  }
  if (typeof detail === 'string') return detail;
  if (typeof data === 'string' && data) return data;
  return `HTTP Error ${status}`;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('naam_access_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      throw new ApiError(response.status, getErrorMessage(data, response.status), data);
    }

    return data as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(0, err.message || 'നെറ്റ്‌വർക്ക് കണക്ഷൻ ലഭ്യമല്ല (Network connection unavailable)');
  }
}
