import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Loader2, MessageSquareText } from 'lucide-react';
import { Button } from '../components/ui/button';
import { SchemeCard } from '../components/scheme-card';
import type { Scheme } from '../data/schemes';
import type { MatchLanguage } from '../api/types';
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
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';

const MIN_LEN = 3;

export function Match() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [text, setText] = useState(searchParams.get('q') || '');
  const [language, setLanguage] = useState<string>('auto');
  const [eligible, setEligible] = useState<Scheme[]>([]);
  const [nearMiss, setNearMiss] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryMessage, setSummaryMessage] = useState<string | null>(null);
  const [meta, setMeta] = useState<{
    detectedLanguage?: string;
    processingTimeMs?: number;
    totalSchemesChecked?: number;
  } | null>(null);

  const queryParam = searchParams.get('q')?.trim() ?? '';
  const langInUrl = searchParams.get('lang') ?? '';

  useEffect(() => {
    setText(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    const l = searchParams.get('lang');
    if (l === 'en' || l === 'hi' || l === 'ur' || l === 'ks') setLanguage(l);
    else setLanguage('auto');
  }, [searchParams]);

  useEffect(() => {
    if (queryParam.length < MIN_LEN) {
      setEligible([]);
      setNearMiss([]);
      setError(null);
      setSummaryMessage(null);
      setMeta(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setSummaryMessage(null);
    setMeta(null);

    const langFromUrl =
      langInUrl === 'en' || langInUrl === 'hi' || langInUrl === 'ur' || langInUrl === 'ks'
        ? (langInUrl as MatchLanguage)
        : undefined;

    matchSchemes({
      userInput: queryParam,
      ...(langFromUrl ? { language: langFromUrl } : {}),
    })
      .then(({ eligible: el, nearMiss: nm, raw }) => {
        if (cancelled) return;
        setEligible(el);
        setNearMiss(nm);
        setSummaryMessage(raw.summaryMessage ?? null);
        setMeta({
          detectedLanguage: raw.detectedLanguage,
          processingTimeMs: raw.processingTimeMs,
          totalSchemesChecked: raw.totalSchemesChecked,
        });
        const combined = [...el, ...nm];
        persistSchemeResults({ query: queryParam, schemes: combined, summaryMessage: raw.summaryMessage });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setEligible([]);
        setNearMiss([]);
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
  }, [queryParam, langInUrl]);

  const queryTooShort = queryParam.length > 0 && queryParam.length < MIN_LEN;
  const showEmptyHint = queryParam.length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = text.trim();
    const sp = new URLSearchParams();
    if (q) sp.set('q', q);
    if (language !== 'auto') sp.set('lang', language);
    navigate({ pathname: '/match', search: sp.toString() ? `?${sp.toString()}` : '' });
  };

  const totalShown = eligible.length + nearMiss.length;

  const metaLine = useMemo(() => {
    if (!meta) return null;
    const parts: string[] = [];
    if (meta.detectedLanguage) parts.push(`Language (response): ${meta.detectedLanguage}`);
    if (meta.processingTimeMs != null) parts.push(`~${meta.processingTimeMs} ms`);
    if (meta.totalSchemesChecked != null) parts.push(`${meta.totalSchemesChecked} schemes checked`);
    return parts.length ? parts.join(' · ') : null;
  }, [meta]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-semibold text-foreground flex items-center gap-2">
              <MessageSquareText className="h-8 w-8 text-primary" />
              Describe in your own words
            </h1>
            <p className="text-muted-foreground mt-2 text-base">
              Uses <code className="text-sm bg-muted px-1 rounded">POST /api/schemes/match</code> (AI + rules).
              Explanations follow the language returned by the API when you pick a response language below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="match-input" className="text-base">
                Your situation
              </Label>
              <Textarea
                id="match-input"
                className="min-h-[140px] text-base resize-y"
                placeholder="Example: I am a woman farmer in Sopore, Jammu and Kashmir. Family income is about 1 lakh per year. OBC."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <div className="space-y-2 flex-1">
                <Label className="text-base">Response language (optional)</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="min-h-11 w-full sm:max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto (omit — server detects)</SelectItem>
                    <SelectItem value="en">English (en)</SelectItem>
                    <SelectItem value="hi">Hindi (hi)</SelectItem>
                    <SelectItem value="ur">Urdu (ur)</SelectItem>
                    <SelectItem value="ks">Kashmiri (ks)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                size="lg"
                className="min-h-11 w-full sm:w-auto px-8"
                disabled={!text.trim() || text.trim().length < MIN_LEN || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Matching…
                  </>
                ) : (
                  'Find schemes'
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Minimum {MIN_LEN} characters. You can also open this page with <code>?q=…</code> and optional{' '}
              <code>&amp;lang=hi</code>.
            </p>
          </form>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Could not match schemes</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {queryTooShort && (
            <Alert className="border-amber-200 bg-amber-50 text-amber-950">
              <AlertTitle>Type a bit more</AlertTitle>
              <AlertDescription>Enter at least {MIN_LEN} characters for the match API.</AlertDescription>
            </Alert>
          )}

          {showEmptyHint && !loading && (
            <Alert>
              <AlertTitle>How this works</AlertTitle>
              <AlertDescription>
                Write a short story about who you are, where you live, income, occupation, and category. Submit to see
                eligible schemes and near-misses side by side.
              </AlertDescription>
            </Alert>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Matching schemes…
            </div>
          )}

          {!loading && queryParam.length >= MIN_LEN && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Results for: <span className="font-medium text-foreground">"{queryParam}"</span>
              </p>
              {summaryMessage && <p className="text-base text-foreground">{summaryMessage}</p>}
              {metaLine && <p className="text-xs text-muted-foreground">{metaLine}</p>}
            </div>
          )}

          {!loading && queryParam.length >= MIN_LEN && totalShown === 0 && !error && (
            <Alert>
              <AlertTitle>No schemes in this response</AlertTitle>
              <AlertDescription>The API returned no eligible or near-miss schemes for this input.</AlertDescription>
            </Alert>
          )}

          {!loading && eligible.length > 0 && (
            <section className="space-y-4" aria-labelledby="eligible-heading">
              <h2 id="eligible-heading" className="text-xl font-semibold text-[#138808]">
                Eligible for you ({eligible.length})
              </h2>
              <p className="text-sm text-muted-foreground">
                Open a card for steps, documents, and apply links returned by the API.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {eligible.map((scheme) => (
                  <SchemeCard key={scheme.id} scheme={scheme} />
                ))}
              </div>
            </section>
          )}

          {!loading && nearMiss.length > 0 && (
            <section className="space-y-4 pt-4 border-t border-border" aria-labelledby="near-heading">
              <h2 id="near-heading" className="text-xl font-semibold text-amber-700">
                Near miss — almost there ({nearMiss.length})
              </h2>
              <p className="text-sm text-muted-foreground">
                These did not pass all mandatory rules; read why and suggested next steps on the detail page.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {nearMiss.map((scheme) => (
                  <SchemeCard key={scheme.id} scheme={scheme} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
