/** Shapes aligned with Government Scheme Navigator OpenAPI (v3/api-docs). */

export interface UserInputRequest {
  userInput: string;
  language?: string;
}

export interface EligibleSchemeDto {
  schemeId: string;
  schemeName: string;
  ministry: string;
  benefits: string;
  applyUrl: string;
  whyEligible: string;
  howToApply: string;
  documentsNeeded: string[];
  passedRules: string[];
  eligibilityScore: number;
}

export interface NearMissSchemeDto {
  schemeId: string;
  schemeName: string;
  benefits: string;
  whyNotEligible: string;
  whatToDo: string;
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

export interface ApiResponseSchemeMatchResponse {
  success: boolean;
  data?: SchemeMatchResponse;
  error?: string | null;
  timestamp?: string;
}
