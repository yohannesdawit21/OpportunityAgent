import { ApiError, type ApiErrorBody } from './types';

function resolveApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  return import.meta.env.PROD ? '/api' : '/api';
}

const baseUrl = resolveApiBaseUrl();

let activeSessionId: string | undefined;

export function setApiSessionId(sessionId: string | undefined): void {
  activeSessionId = sessionId;
}

export function getApiSessionId(): string | undefined {
  return activeSessionId;
}

export function useMockApi(): boolean {
  return import.meta.env.VITE_USE_MOCK_API !== 'false';
}

export function getApiMode(): 'mock' | 'live' {
  return useMockApi() ? 'mock' : 'live';
}

export function getApiBaseUrl(): string {
  return baseUrl;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!useMockApi() && activeSessionId) {
    headers.set('X-Session-Id', activeSessionId);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = response.statusText;
    let code: string | undefined;
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      try {
        const body = (await response.json()) as ApiErrorBody;
        message = body.message ?? message;
        code = body.code;
      } catch {
        // non-JSON error body
      }
    } else if (contentType.includes('text/html')) {
      message =
        'API returned HTML instead of JSON — check VITE_API_URL is /api on Vercel.';
    }
    throw new ApiError(message, response.status, code);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
