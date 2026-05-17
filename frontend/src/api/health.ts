import { apiRequest, useMockApi } from './client';

export interface ApiHealthResponse {
  ok: boolean;
  agent?: boolean;
  fallback?: boolean;
}

export async function checkApiHealth(): Promise<ApiHealthResponse> {
  if (useMockApi()) {
    return { ok: true, agent: false, fallback: true };
  }
  return apiRequest<ApiHealthResponse>('/health');
}
