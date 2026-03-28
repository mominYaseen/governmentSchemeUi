import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Search, Mic, Filter, SlidersHorizontal, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { SchemeCard } from '../components/scheme-card';
import type { Scheme } from '../data/schemes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { matchSchemes, SchemeMatchError } from '../api/match-schemes';
import { persistSchemeResults } from '../api/scheme-results-storage';

const MIN_QUERY_LEN = 3;

export function Results() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [eligibilityFilter, setEligibilityFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryMessage, setSummaryMessage] = useState<string | null>(null);

  const queryParam = searchParams.get('q')?.trim() ?? '';

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    if (queryParam.length < MIN_QUERY_LEN) {
      setSchemes([]);
      setError(null);
      setSummaryMessage(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setSummaryMessage(null);

    const lang =
      typeof navigator !== 'undefined' ? navigator.language?.split('-')[0] : undefined;

    matchSchemes({ userInput: queryParam, ...(lang ? { language: lang } : {}) })
      .then(({ schemes: next, summaryMessage: sum }) => {
        if (cancelled) return;
        setSchemes(next);
        setSummaryMessage(sum ?? null);
        persistSchemeResults({ query: queryParam, schemes: next, summaryMessage: sum });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setSchemes([]);
        const msg =
          e instanceof SchemeMatchError
            ? e.message
            : e instanceof Error
              ? e.message
              : 'Something went wrong';
        setError(msg);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [queryParam]);

  const filteredSchemes = useMemo(() => {
    let list = schemes;
    if (categoryFilter !== 'all') {
      list = list.filter((s) => s.category === categoryFilter);
    }
    if (eligibilityFilter !== 'all') {
      list = list.filter((s) => s.eligibility === eligibilityFilter);
    }
    return list;
  }, [schemes, categoryFilter, eligibilityFilter]);

  const categories = useMemo(
    () => Array.from(new Set(schemes.map((s) => s.category))).sort(),
    [schemes]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/results?q=${encodeURIComponent(query)}`);
  };

  const queryTooShort = queryParam.length > 0 && queryParam.length < MIN_QUERY_LEN;
  const showEmptyHint = queryParam.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <form onSubmit={handleSearch}>
            <div className="relative max-w-3xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-border p-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Describe your situation..."
                      className="w-full pl-12 pr-4 py-3 bg-transparent border-none outline-none text-foreground"
                    />
                  </div>

                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 rounded-lg"
                  >
                    <Mic className="h-5 w-5 text-muted-foreground" />
                  </Button>

                  <Button
                    type="submit"
                    className="px-6 rounded-lg bg-primary hover:bg-primary/90"
                    disabled={!query.trim() || query.trim().length < MIN_QUERY_LEN}
                  >
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-2 max-w-3xl mx-auto">
            Uses your backend at <code className="text-foreground">POST /api/schemes/match</code> (min{' '}
            {MIN_QUERY_LEN} characters).
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 max-w-3xl mx-auto">
            <AlertTitle>Could not load schemes</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {queryTooShort && (
          <Alert className="mb-6 max-w-3xl mx-auto border-amber-200 bg-amber-50 text-amber-950">
            <AlertTitle>Type a bit more</AlertTitle>
            <AlertDescription>
              Enter at least {MIN_QUERY_LEN} characters so the assistant can match schemes.
            </AlertDescription>
          </Alert>
        )}

        {showEmptyHint && !loading && (
          <Alert className="mb-6 max-w-3xl mx-auto">
            <AlertTitle>Start with a search</AlertTitle>
            <AlertDescription>
              Enter a short description of your situation (for example: farmer, student, small business)
              and press Search. Results come from your API on port 8080.
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-1 flex items-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  Matching schemes…
                </>
              ) : (
                <>{filteredSchemes.length} Schemes Found</>
              )}
            </h2>
            {queryParam && (
              <p className="text-sm text-muted-foreground">
                Results for: <span className="font-medium text-foreground">"{queryParam}"</span>
              </p>
            )}
            {summaryMessage && !loading && (
              <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{summaryMessage}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Filters:</span>
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={eligibilityFilter} onValueChange={setEligibilityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Eligibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="eligible">Eligible</SelectItem>
                <SelectItem value="partial">Partial Match</SelectItem>
                <SelectItem value="not-eligible">Not Eligible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {!loading && filteredSchemes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchemes.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>
        ) : null}

        {!loading && !error && queryParam.length >= MIN_QUERY_LEN && filteredSchemes.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Filter className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No schemes found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Try adjusting your search query or filters. The API returned no matches for this profile.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
