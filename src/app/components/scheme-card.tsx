import { useEffect, useState } from 'react';
import { ArrowRight, Briefcase, ExternalLink, Loader2 } from 'lucide-react';
import { Link } from 'react-router';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { EligibilityBadge } from './eligibility-badge';
import type { Scheme } from '../data/schemes';
import type { SchemeDetail, SchemeSummary } from '../api/types';
import { fetchSchemeById } from '../api/schemes-api';
import { ApiError } from '../api/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { SaveSchemeButton } from './save-scheme-button';
import { normalizeStringList } from '../utils/normalize-string-list';
import { applyLinkDisplayLabel, normalizedApplyUrl } from '../utils/apply-link';

type SchemeCardProps =
  | { scheme: Scheme; catalogSummary?: never }
  | { catalogSummary: SchemeSummary; scheme?: never };

export function SchemeCard(props: SchemeCardProps) {
  if ('catalogSummary' in props && props.catalogSummary) {
    return <CatalogSchemeCardInner summary={props.catalogSummary} />;
  }
  const { scheme } = props as { scheme: Scheme };
  return <FullSchemeCard scheme={scheme} />;
}

function EmptyField() {
  return <span className="text-muted-foreground italic">Not available</span>;
}

function textOrNull(v: string | null | undefined): string | null {
  const t = v?.trim();
  return t ? t : null;
}

function presentationStepText(raw: string): string {
  return raw
    .trim()
    .replace(/^[•\-\*–—]\s+/, '')
    .replace(/^\d+[\.)]\s*/, '')
    .trim();
}

/** Same contract as match `applySteps`: array or JSON string; no free-text splitting. */
function normalizeDetailApplySteps(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value
      .map((x) => String(x ?? '').trim())
      .filter(Boolean)
      .map(presentationStepText)
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
            .map((x) => String(x ?? '').trim())
            .filter(Boolean)
            .map(presentationStepText)
            .filter(Boolean);
        }
      } catch {
        /* ignore */
      }
    }
  }
  return [];
}

function CatalogSchemeCardInner({ summary }: { summary: SchemeSummary }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<SchemeDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!open) {
      setDetail(null);
      setError(null);
      setErrorStatus(undefined);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setErrorStatus(undefined);
    setDetail(null);

    fetchSchemeById(summary.id)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const status = e instanceof ApiError ? e.status : undefined;
        setErrorStatus(status);
        if (e instanceof ApiError) {
          setError(e.message);
        } else if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('Could not load scheme details');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, summary.id]);

  const levelBadgeText =
    textOrNull(summary.levelBadge) ?? textOrNull(summary.govLevel) ?? 'Government scheme';
  const devSourceTitle =
    import.meta.env.DEV && textOrNull(summary.source)
      ? `Data pipeline: ${summary.source}`
      : undefined;

  const cardSubtitle = textOrNull(summary.cardSubtitle);
  const categoryChips = normalizeStringList(summary.categories);
  const badgeNorm = levelBadgeText.trim().toLowerCase();
  const govNorm = textOrNull(summary.govLevel)?.toLowerCase() ?? '';
  const showGovSubtitleFallback =
    !cardSubtitle &&
    categoryChips.length === 0 &&
    govNorm.length > 0 &&
    govNorm !== badgeNorm;

  const titleName = textOrNull(detail?.name) ?? summary.name;
  const applyHref =
    normalizedApplyUrl(detail?.applyUrl) ?? normalizedApplyUrl(summary.applyUrl);
  const catalogApply = normalizedApplyUrl(summary.applyUrl);

  return (
    <>
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <span
                  className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded max-w-[min(100%,14rem)] truncate"
                  title={devSourceTitle}
                >
                  {levelBadgeText}
                </span>
              </div>
              <h3 className="font-semibold text-lg text-foreground line-clamp-2">{summary.name}</h3>
              {cardSubtitle ? (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1.5">{cardSubtitle}</p>
              ) : categoryChips.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {categoryChips.map((c, i) => (
                    <Badge key={`${c}-${i}`} variant="outline" className="text-xs font-normal">
                      {c}
                    </Badge>
                  ))}
                </div>
              ) : showGovSubtitleFallback ? (
                <p className="text-sm text-muted-foreground mt-1.5">{textOrNull(summary.govLevel)}</p>
              ) : null}
            </div>
            <SaveSchemeButton schemeId={summary.id} className="shrink-0" />
          </div>

          <div className="flex flex-col gap-2 pt-4 border-t border-border">
            {catalogApply ? (
              <Button className="w-full" size="sm" asChild>
                <a
                  href={catalogApply}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                  title={catalogApply}
                >
                  {applyLinkDisplayLabel(catalogApply)}
                  <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                </a>
              </Button>
            ) : null}
            <Button variant="outline" className="w-full" size="sm" type="button" onClick={() => setOpen(true)}>
              View summary
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[min(90vh,40rem)] flex flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="p-6 pb-4 shrink-0 border-b border-border">
            <DialogTitle className="pr-8">{titleName}</DialogTitle>
            <DialogDescription className="text-left">
              Official information for this scheme from the catalog service.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[min(65vh,28rem)] w-full">
            <div className="p-6 pt-4 space-y-6">
              {loading && (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
                  <p className="text-sm">Loading scheme details…</p>
                </div>
              )}

              {!loading && error && (
                <Alert variant="destructive">
                  <AlertTitle>
                    {errorStatus === 404 ? 'Scheme not found' : 'Could not load details'}
                  </AlertTitle>
                  <AlertDescription>
                    {errorStatus === 404
                      ? 'This scheme is unknown or inactive. It may have been removed from the catalog.'
                      : error}
                  </AlertDescription>
                </Alert>
              )}

              {!loading && !error && detail && (
                <>
                  <section className="space-y-2" aria-label="Overview">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground">
                      Overview
                    </h4>
                    {(() => {
                      const ov = textOrNull(detail.overview);
                      const benefitsRaw = textOrNull(detail.benefits);
                      const benefitPreview = benefitsRaw
                        ? benefitsRaw.split(/\n|•/)[0]?.trim() || null
                        : null;
                      const fallback = [titleName, benefitPreview].filter(Boolean).join(
                        benefitPreview ? '. ' : ''
                      );
                      const body = ov ?? fallback;
                      return body ? (
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{body}</p>
                      ) : (
                        <EmptyField />
                      );
                    })()}
                  </section>

                  <section className="space-y-2" aria-label="Benefits">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground">Benefits</h4>
                    {textOrNull(detail.benefits) ? (
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                        {detail.benefits}
                      </p>
                    ) : (
                      <EmptyField />
                    )}
                  </section>

                  <section className="space-y-2" aria-label="Eligibility">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground">
                      Eligibility
                    </h4>
                    {textOrNull(detail.eligibilityText) ? (
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                        {detail.eligibilityText}
                      </p>
                    ) : (
                      <EmptyField />
                    )}
                  </section>

                  <section className="space-y-2" aria-label="How to apply">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground">
                      How to apply
                    </h4>
                    {(() => {
                      const steps = normalizeDetailApplySteps(detail.applySteps);
                      const process = textOrNull(detail.applyProcess);
                      if (steps.length > 0) {
                        return (
                          <ol className="list-none m-0 p-0 space-y-2" aria-label="Application steps">
                            {steps.map((step, index) => (
                              <li key={index} className="flex gap-3 items-start text-sm text-foreground">
                                <span
                                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
                                  aria-hidden
                                >
                                  {index + 1}
                                </span>
                                <p className="min-w-0 flex-1 leading-relaxed whitespace-pre-line pt-0.5">
                                  {step}
                                </p>
                              </li>
                            ))}
                          </ol>
                        );
                      }
                      if (process) {
                        return (
                          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                            {process}
                          </p>
                        );
                      }
                      return <EmptyField />;
                    })()}
                  </section>

                  <section className="space-y-2" aria-label="Documents">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground">
                      Documents needed
                    </h4>
                    {(() => {
                      const docs = normalizeStringList(detail.documentsNeeded);
                      return docs.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1.5 text-sm text-foreground">
                          {docs.map((doc, i) => (
                            <li key={i}>{doc}</li>
                          ))}
                        </ul>
                      ) : (
                        <EmptyField />
                      );
                    })()}
                  </section>

                  <section className="space-y-2" aria-label="Tags">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground">Tags</h4>
                    {(() => {
                      const tagList = normalizeStringList(detail.tags);
                      return tagList.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {tagList.map((tag, i) => (
                            <Badge key={`${tag}-${i}`} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <EmptyField />
                      );
                    })()}
                  </section>

                  <Separator />

                  <section className="space-y-2" aria-label="Apply link">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground">Apply</h4>
                    {applyHref ? (
                      <a
                        href={applyHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary underline inline-flex items-center gap-1.5"
                        title={applyHref}
                      >
                        {applyLinkDisplayLabel(applyHref)}
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      </a>
                    ) : (
                      <EmptyField />
                    )}
                  </section>
                </>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

function FullSchemeCard({ scheme }: { scheme: Scheme }) {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                {scheme.category}
              </span>
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-2">
              {scheme.name}
            </h3>
          </div>
          <div className="flex items-start gap-1 shrink-0">
            <SaveSchemeButton schemeId={scheme.id} />
            <EligibilityBadge status={scheme.eligibility} showIcon={false} />
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {scheme.description}
        </p>

        <div className="mb-4">
          <p className="text-xs font-medium text-foreground mb-2">Key Benefits:</p>
          <ul className="space-y-1">
            {scheme.benefits.slice(0, 2).map((benefit, index) => (
              <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span className="line-clamp-1">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-4 border-t border-border">
          <Button asChild className="w-full group-hover:bg-primary/90" size="sm">
            <Link to={`/scheme/${scheme.id}`} className="flex items-center justify-center gap-2">
              View Details
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
