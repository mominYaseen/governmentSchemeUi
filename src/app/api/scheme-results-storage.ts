import type { Scheme } from '../data/schemes';

const STORAGE_KEY = 'scheme-navigator:last-results';

export interface StoredSchemeResults {
  query: string;
  schemes: Scheme[];
  summaryMessage?: string;
}

export function persistSchemeResults(payload: StoredSchemeResults): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota / private mode
  }
}

export function readStoredSchemeResults(): StoredSchemeResults | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSchemeResults;
    if (!parsed?.schemes || !Array.isArray(parsed.schemes)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getSchemeByIdFromStorage(id: string): Scheme | null {
  const data = readStoredSchemeResults();
  return data?.schemes.find((s) => s.id === id) ?? null;
}

/** Cached POST /api/schemes/match outcome so returning from scheme details does not refetch. */
export interface StoredMatchCache {
  query: string;
  /** Normalized language param: `en` | `hi` | `ur` | `ks`, or `''` when omitted (auto). */
  lang: string;
  eligible: Scheme[];
  nearMiss: Scheme[];
  summaryMessage: string | null;
  meta: {
    detectedLanguage?: string;
    processingTimeMs?: number;
    totalSchemesChecked?: number;
  } | null;
}

function matchCacheStorageKey(query: string, lang: string): string {
  return `scheme-navigator:match:${encodeURIComponent(query)}:${lang}`;
}

export function persistMatchCache(payload: StoredMatchCache): void {
  try {
    sessionStorage.setItem(matchCacheStorageKey(payload.query, payload.lang), JSON.stringify(payload));
  } catch {
    // ignore quota / private mode
  }
}

export function readMatchCache(query: string, lang: string): StoredMatchCache | null {
  try {
    const raw = sessionStorage.getItem(matchCacheStorageKey(query, lang));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredMatchCache;
    if (!parsed || !Array.isArray(parsed.eligible) || !Array.isArray(parsed.nearMiss)) return null;
    if (parsed.query !== query || parsed.lang !== lang) return null;
    return parsed;
  } catch {
    return null;
  }
}
