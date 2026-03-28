import type { Scheme } from '../data/schemes';
import { getApiBaseUrl } from './config';
import type {
  ApiResponseSchemeMatchResponse,
  EligibleSchemeDto,
  NearMissSchemeDto,
  UserInputRequest,
} from './types';

function splitLinesOrSingle(text: string): string[] {
  const t = text.trim();
  if (!t) return [];
  const lines = t.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  if (lines.length > 1) return lines;
  const numbered = t.split(/\d+\.\s+/).map((s) => s.trim()).filter(Boolean);
  if (numbered.length > 1) return numbered;
  return [t];
}

function benefitsToList(s: string): string[] {
  const t = s.trim();
  if (!t) return [];
  const byBullet = t.split(/\n|•/).map((x) => x.trim()).filter(Boolean);
  return byBullet.length ? byBullet : [t];
}

function mapEligible(dto: EligibleSchemeDto): Scheme {
  return {
    id: dto.schemeId,
    name: dto.schemeName,
    description: dto.benefits,
    category: dto.ministry || 'Government Scheme',
    eligibility: 'eligible',
    eligibilitySummary: dto.whyEligible,
    benefits: benefitsToList(dto.benefits),
    fullDescription: [dto.whyEligible, dto.howToApply].filter(Boolean).join('\n\n'),
    criteriaList: dto.passedRules?.length ? dto.passedRules : ['See official eligibility on the portal'],
    requiredDocuments: dto.documentsNeeded?.length ? dto.documentsNeeded : [],
    applicationSteps: splitLinesOrSingle(dto.howToApply),
    officialLink: dto.applyUrl || '#',
    matchKind: 'eligible',
  };
}

function mapNearMiss(dto: NearMissSchemeDto): Scheme {
  return {
    id: dto.schemeId,
    name: dto.schemeName,
    description: dto.benefits,
    category: 'Near match',
    eligibility: 'partial',
    eligibilitySummary: dto.whyNotEligible,
    benefits: benefitsToList(dto.benefits),
    fullDescription: [dto.whyNotEligible, dto.whatToDo].filter(Boolean).join('\n\n'),
    criteriaList: [],
    requiredDocuments: [],
    applicationSteps: splitLinesOrSingle(dto.whatToDo),
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

export class SchemeMatchError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'SchemeMatchError';
  }
}

export async function matchSchemes(body: UserInputRequest): Promise<{
  schemes: Scheme[];
  summaryMessage?: string;
  raw: ApiResponseSchemeMatchResponse;
}> {
  const base = getApiBaseUrl();
  const url = `${base}/api/schemes/match`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      userInput: body.userInput,
      ...(body.language ? { language: body.language } : {}),
    }),
  });

  let json: ApiResponseSchemeMatchResponse;
  try {
    json = (await res.json()) as ApiResponseSchemeMatchResponse;
  } catch {
    throw new SchemeMatchError('Invalid response from server', res.status);
  }

  if (!res.ok) {
    throw new SchemeMatchError(json?.error || res.statusText || 'Request failed', res.status);
  }

  if (!json.success || !json.data) {
    throw new SchemeMatchError(json.error || 'No data returned');
  }

  const schemes = mapMatchResponseToSchemes(json.data);
  return {
    schemes,
    summaryMessage: json.data.summaryMessage,
    raw: json,
  };
}
