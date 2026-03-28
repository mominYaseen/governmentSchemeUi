/** Normalize API fields that may be string[], comma-separated string, or JSON array string. */
export function normalizeStringList(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value
      .map((x) => (typeof x === 'string' ? x : x != null ? String(x) : ''))
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    const t = value.trim();
    if (!t) return [];
    if (t.startsWith('[')) {
      try {
        const j = JSON.parse(t) as unknown;
        if (Array.isArray(j)) {
          return j
            .map((x) => (typeof x === 'string' ? x : x != null ? String(x) : ''))
            .map((s) => s.trim())
            .filter(Boolean);
        }
      } catch {
        /* fall through */
      }
    }
    return t
      .split(/[,;|\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}
