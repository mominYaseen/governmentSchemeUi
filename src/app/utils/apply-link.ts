/** Non-empty trimmed apply URL from API, or null. */
export function normalizedApplyUrl(value: string | null | undefined): string | null {
  const t = value?.trim();
  return t ? t : null;
}

/** Visible link text: hostname when URL parses, else generic label. */
export function applyLinkDisplayLabel(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./i, '');
    return host || 'Open official apply page';
  } catch {
    return 'Open official apply page';
  }
}
