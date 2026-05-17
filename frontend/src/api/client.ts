import { ApiError, type ApiErrorBody } from './types';

const baseUrl = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');

export function useMockApi(): boolean {
  return import.meta.env.VITE_USE_MOCK_API !== 'false';
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = response.statusText;
    let code: string | undefined;
    try {
      const body = (await response.json()) as ApiErrorBody;
      message = body.message ?? message;
      code = body.code;
    } catch {
      // non-JSON error body
    }
    throw new ApiError(message, response.status, code);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
