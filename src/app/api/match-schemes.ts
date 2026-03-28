import type { Scheme } from '../data/schemes';
import { apiPost, ApiError } from './client';
import type {
  EligibleSchemeDto,
  NearMissSchemeDto,
  SchemeMatchResponse,
  UserInputRequest,
} from './types';

export { ApiError as SchemeMatchError };

function stripStepPrefix(s: string): string {
  return s
    .trim()
    .replace(/^[•\-\*–—]\s+/, '')
    .replace(/^\d+[\.)]\s*/, '')
    .trim();
}

/** Normalize API `applySteps` (array or occasional string/JSON). */
function normalizeApplyStepsArray(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value
      .map((x) => String(x ?? '').trim())
      .filter(Boolean)
      .map(stripStepPrefix)
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
            .map(stripStepPrefix)
            .filter(Boolean);
        }
      } catch {
        /* ignore */
      }
    }
  }
  return [];
}

/**
 * Prefer `applySteps` as ordered list; if empty, use `howToApply` as a single block (do not split into Overview).
 */
function resolveMatchApplyDisplay(
  applyStepsRaw: unknown,
  howToApply: string | undefined
): { steps: string[]; block: string | null } {
  const steps = normalizeApplyStepsArray(applyStepsRaw);
  if (steps.length > 0) return { steps, block: null };
  const raw = (howToApply ?? '').trim();
  if (!raw) return { steps: [], block: null };
  return { steps: [], block: raw };
}

function benefitsToList(s: string): string[] {
  const t = s.trim();
  if (!t) return [];
  const byBullet = t.split(/\n|•/).map((x) => x.trim()).filter(Boolean);
  return byBullet.length ? byBullet : [t];
}

function mapEligible(dto: EligibleSchemeDto): Scheme {
  const { steps, block } = resolveMatchApplyDisplay(dto.applySteps, dto.howToApply);
  const overview = dto.overview?.trim() || null;
  return {
    id: dto.schemeId,
    name: dto.schemeName,
    description: dto.benefits,
    category: dto.ministry || 'Government Scheme',
    eligibility: 'eligible',
    eligibilitySummary: dto.whyEligible,
    benefits: benefitsToList(dto.benefits),
    overview,
    fullDescription: overview || '',
    criteriaList: dto.passedRules?.length ? dto.passedRules : ['See official eligibility on the portal'],
    requiredDocuments: dto.documentsNeeded?.length ? dto.documentsNeeded : [],
    applicationSteps: steps,
    howToApplyBlock: block,
    officialLink: dto.applyUrl || '#',
    matchKind: 'eligible',
  };
}

function mapNearMiss(dto: NearMissSchemeDto): Scheme {
  const howFallback = dto.howToApply?.trim() || dto.whatToDo;
  const { steps, block } = resolveMatchApplyDisplay(dto.applySteps, howFallback);
  const overview = dto.overview?.trim() || null;
  return {
    id: dto.schemeId,
    name: dto.schemeName,
    description: dto.benefits,
    category: 'Near match',
    eligibility: 'partial',
    eligibilitySummary: dto.whyNotEligible,
    benefits: benefitsToList(dto.benefits),
    overview,
    fullDescription: overview || '',
    criteriaList: [],
    requiredDocuments: [],
    applicationSteps: steps,
    howToApplyBlock: block,
    officialLink: '#',
    matchKind: 'near-miss',
  };
}

export function mapMatchResponseToSchemes(data: {
  eligibleSchemes: EligibleSchemeDto[];
  nearMissSchemes: NearMissSchemeDto[];
}): Scheme[] {
  const eligible = (data.eligibleSchemes ?? []).map(mapEligible);
  const near = (data.nearMissSchemes ?? []).map(mapNearMiss);
  return [...eligible, ...near];
}

export async function matchSchemes(body: UserInputRequest): Promise<{
  schemes: Scheme[];
  eligible: Scheme[];
  nearMiss: Scheme[];
  raw: SchemeMatchResponse;
}> {
  const data = await apiPost<SchemeMatchResponse>('/api/schemes/match', {
    userInput: body.userInput,
    ...(body.language ? { language: body.language } : {}),
  });

  const eligible = (data.eligibleSchemes ?? []).map(mapEligible);
  const nearMiss = (data.nearMissSchemes ?? []).map(mapNearMiss);
  const schemes = [...eligible, ...nearMiss];

  return {
    schemes,
    eligible,
    nearMiss,
    raw: data,
  };
}
