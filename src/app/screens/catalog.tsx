import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { fetchSchemesPage } from '../api/schemes-api';
import { ApiError } from '../api/client';
import type { SchemeSummary } from '../api/types';
import { SchemeCard } from '../components/scheme-card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const PAGE_SIZE = 20;

function filterContent(rows: SchemeSummary[], q: string): SchemeSummary[] {
  const t = q.trim().toLowerCase();
  if (!t) return rows;
  return rows.filter((s) => {
    const hay = [s.name, s.slug, s.id, s.govLevel, s.source, s.applyUrl]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return hay.includes(t);
  });
}

export function Catalog() {
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState('name,asc');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageData, setPageData] = useState<{
    content: SchemeSummary[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSchemesPage({ page, size: PAGE_SIZE, sort });
      setPageData({
        content: data.content ?? [],
        totalElements: data.totalElements ?? 0,
        totalPages: data.totalPages ?? 0,
        number: data.number ?? page,
        size: data.size ?? PAGE_SIZE,
      });
    } catch (e) {
      setPageData(null);
      setError(e instanceof ApiError ? e.message : 'Could not load catalog');
    } finally {
      setLoading(false);
    }
  }, [page, sort]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(
    () => filterContent(pageData?.content ?? [], filter),
    [pageData, filter]
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-semibold text-foreground tracking-tight">Scheme catalog</h1>
            <p className="text-muted-foreground mt-2 text-base">
              Paginated list from <code className="text-sm bg-muted px-1 rounded">GET /api/schemes</code>.
              Filter applies to the current page only (no server-side search in the API).
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Could not load schemes</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:items-end sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Filter this page by name, slug, level…"
                className="pl-9 min-h-11 text-base"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                aria-label="Filter schemes on current page"
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">Sort</span>
              <Select value={sort} onValueChange={(v) => { setPage(0); setSort(v); }}>
                <SelectTrigger className="w-[180px] min-h-11" aria-label="Sort order">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name,asc">Name (A–Z)</SelectItem>
                  <SelectItem value="name,desc">Name (Z–A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading…
              </span>
            ) : pageData ? (
              <span>
                Page {pageData.number + 1} of {Math.max(1, pageData.totalPages)} ·{' '}
                {pageData.totalElements} schemes total · showing {filtered.length} after filter
              </span>
            ) : (
              <span>No data</span>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={loading || !pageData || page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={
                  loading ||
                  !pageData ||
                  pageData.totalPages < 1 ||
                  page >= pageData.totalPages - 1
                }
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>

          {!loading && filtered.length === 0 && pageData && (
            <Alert>
              <AlertTitle>No rows match</AlertTitle>
              <AlertDescription>Try clearing the filter or another page.</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((s) => (
              <SchemeCard key={s.id} catalogSummary={s} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
