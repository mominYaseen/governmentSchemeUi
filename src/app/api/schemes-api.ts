import { apiGet, apiPost } from './client';
import type {
  HealthData,
  PageSchemeSummary,
  SchemeDetail,
  SchemeSummary,
  UserProfileRequest,
} from './types';

export async function fetchHealth(): Promise<HealthData> {
  return apiGet<HealthData>('/api/health');
}

export function buildSchemesQuery(params: {
  page?: number;
  size?: number;
  sort?: string | string[];
}): string {
  const sp = new URLSearchParams();
  if (params.page != null) sp.set('page', String(params.page));
  if (params.size != null) sp.set('size', String(params.size));
  const sort = params.sort;
  if (sort != null) {
    const list = Array.isArray(sort) ? sort : [sort];
    for (const s of list) sp.append('sort', s);
  }
  const q = sp.toString();
  return q ? `?${q}` : '';
}

export async function fetchSchemesPage(params: {
  page?: number;
  size?: number;
  sort?: string | string[];
}): Promise<PageSchemeSummary> {
  const qs = buildSchemesQuery(params);
  return apiGet<PageSchemeSummary>(`/api/schemes${qs}`);
}

export async function fetchSchemeById(schemeId: string): Promise<SchemeDetail> {
  const id = encodeURIComponent(schemeId);
  return apiGet<SchemeDetail>(`/api/schemes/${id}`);
}

export async function recommendSchemes(
  body: UserProfileRequest
): Promise<SchemeSummary[]> {
  return apiPost<SchemeSummary[]>('/api/schemes/recommend', stripNulls(body));
}

/** Remove null/undefined/empty-string keys so backend treats them as unknown. */
function stripNulls(obj: UserProfileRequest): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) continue;
    if (typeof v === 'string' && v.trim() === '') continue;
    out[k] = v;
  }
  return out;
}
