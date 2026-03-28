/** Shapes aligned with Government Scheme Navigator OpenAPI (`/v3/api-docs`). */

export interface ApiResponse<T> {
  success: boolean;
  data?: T | null;
  error?: string | null;
  timestamp?: string;
}

/** `GET /api/auth/status` — `data.authenticated` drives session UI (not `/api/me` 401). */
export interface AuthStatusData {
  authenticated: boolean;
}

/** Spring Data `Page<SchemeSummary>` inside `ApiResponse.data` for GET /api/schemes */
export interface PageSchemeSummary {
  content: SchemeSummary[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first?: boolean;
  last?: boolean;
}

export interface SchemeSummary {
  id: string;
  name: string;
  slug?: string | null;
  /** Legacy / fallback when `levelBadge` absent. */
  govLevel?: string | null;
  /** Pipeline tag (e.g. KAGGLE_CSV); not for citizen-facing level UI. */
  source?: string | null;
  applyUrl?: string | null;
  /** Programme level for the corner badge only (e.g. Central, State). */
  levelBadge?: string | null;
  /** Human-readable line under the title (not internal slug/id). */
  cardSubtitle?: string | null;
  /** Category labels for optional chips under the title. */
  categories?: string[] | string | null;
}

/** Payload in `ApiResponse.data` for GET /api/schemes/{id} */
export interface SchemeDetail {
  id?: string | null;
  name?: string | null;
  slug?: string | null;
  govLevel?: string | null;
  source?: string | null;
  applyUrl?: string | null;
  /** Short narrative for Overview only; do not use for application steps. */
  overview?: string | null;
  description?: string | null;
  benefits?: string | null;
  eligibilityText?: string | null;
  /** Ordered application steps when provided. */
  applySteps?: string[] | string | null;
  applyProcess?: string | null;
  ministry?: string | null;
  /** May be a string (e.g. comma-separated) or an array depending on backend serialization. */
  tags?: string[] | string | null;
  documentsNeeded?: string[] | string | null;
}

export interface UserProfileRequest {
  occupation?: string | null;
  incomeAnnual?: number | null;
  location?: string | null;
  state?: string | null;
  gender?: string | null;
  landOwned?: boolean | null;
  casteCategory?: string | null;
  age?: number | null;
  bplCard?: boolean | null;
  isFarmer?: boolean | null;
  isStudent?: boolean | null;
  isDisabled?: boolean | null;
}

export type MatchLanguage = 'en' | 'hi' | 'ur' | 'ks';

export interface UserInputRequest {
  userInput: string;
  language?: MatchLanguage;
}

/** OpenAPI: EligibleScheme */
export interface EligibleSchemeDto {
  schemeId: string;
  schemeName: string;
  ministry: string;
  benefits: string;
  /** Set from stored column and/or inferred server-side; optional when absent. */
  applyUrl?: string | null;
  /** Catalog-style overview; not eligibility explanation. */
  overview?: string | null;
  whyEligible: string;
  /** Preferred ordered steps; if empty, use `howToApply` as one block. */
  applySteps?: string[] | null;
  howToApply: string;
  documentsNeeded: string[];
  passedRules: string[];
  eligibilityScore: number;
}

/** OpenAPI: NearMissScheme */
export interface NearMissSchemeDto {
  schemeId: string;
  schemeName: string;
  benefits: string;
  overview?: string | null;
  whyNotEligible: string;
  applySteps?: string[] | null;
  /** Fallback how-to text when `applySteps` is empty. */
  howToApply?: string | null;
  whatToDo: string;
  applyUrl?: string | null;
  eligibilityScore: number;
}

export interface UserProfile {
  occupation?: string | null;
  incomeAnnual?: number | null;
  location?: string | null;
  state?: string | null;
  gender?: string | null;
  landOwned?: boolean | null;
  casteCategory?: string | null;
  age?: number | null;
  bplCard?: boolean | null;
  isFarmer?: boolean | null;
  isStudent?: boolean | null;
  isDisabled?: boolean | null;
  rawInput?: string | null;
  detectedLanguage?: string | null;
}

export interface SchemeMatchResponse {
  userProfile?: UserProfile;
  eligibleSchemes: EligibleSchemeDto[];
  nearMissSchemes: NearMissSchemeDto[];
  summaryMessage?: string;
  detectedLanguage?: string;
  processingTimeMs?: number;
  totalSchemesChecked?: number;
}

export type HealthData = Record<string, string>;

/** `POST /api/auth/login` data field in demo mode. */
export interface DemoLoginUserDto {
  id: string;
  email: string;
  displayName: string;
  provider: string;
}

/** `GET /api/me` — OAuth2 user info and/or demo profile. */
export interface MeDto {
  email?: string | null;
  name?: string | null;
  displayName?: string | null;
  picture?: string | null;
  sub?: string | null;
  [key: string]: unknown;
}

/** Item from `GET /api/me/saved-schemes`. */
export interface SavedSchemeEntry {
  schemeId: string;
  remindEnabled?: boolean | null;
  [key: string]: unknown;
}
