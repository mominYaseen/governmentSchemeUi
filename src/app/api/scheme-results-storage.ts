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
