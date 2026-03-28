export type EligibilityStatus = 'eligible' | 'partial' | 'not-eligible';

export interface Scheme {
  id: string;
  name: string;
  description: string;
  category: string;
  eligibility: EligibilityStatus;
  eligibilitySummary: string;
  benefits: string[];
  fullDescription: string;
  criteriaList: string[];
  requiredDocuments: string[];
  applicationSteps: string[];
  officialLink: string;
  /** Set when scheme comes from POST /api/schemes/match (for filters). */
  matchKind?: 'eligible' | 'near-miss';
}

export const mockSchemes: Scheme[] = [
  {
    id: '1',
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    description: 'Direct income support of ₹6,000 per year to small and marginal farmers in three equal installments.',
    category: 'Agriculture',
    eligibility: 'eligible',
    eligibilitySummary: 'Small & marginal farmers with cultivable land',
    benefits: [
      '₹6,000 per year in three installments',
      'Direct Bank Transfer (DBT)',
      'No application fee',
      'Annual renewal not required'
    ],
    fullDescription: 'The Pradhan Mantri Kisan Samman Nidhi (PM-KISAN) is a Central Sector scheme launched to provide income support to all landholding farmers\' families across the country. Under the scheme, financial benefit of ₹6,000 per year is provided to eligible farmer families, payable in three equal installments of ₹2,000 each every four months.',
    criteriaList: [
      'Should be a farmer with cultivable land',
      'Land holding in the name of family',
      'Applicable to small and marginal farmers',
      'Must have valid Aadhaar card',
      'Bank account should be Aadhaar-linked'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Bank Account Details (Passbook copy)',
      'Land Ownership Papers',
      'Citizenship Certificate',
      'Mobile Number (registered with Aadhaar)'
    ],
    applicationSteps: [
      'Visit PM-KISAN official portal',
      'Click on "Farmers Corner" section',
      'Select "New Farmer Registration"',
      'Enter Aadhaar number and verify',
      'Fill in personal and bank details',
      'Upload land records',
      'Submit application and note registration number'
    ],
    officialLink: 'https://pmkisan.gov.in'
  },
  {
    id: '2',
    name: 'National Scholarship Portal (NSP)',
    description: 'Scholarships for students from economically weaker sections covering tuition fees and other expenses.',
    category: 'Education',
    eligibility: 'eligible',
    eligibilitySummary: 'Students from economically weaker sections',
    benefits: [
      'Tuition fee coverage',
      'Hostel and book allowance',
      'Maintenance allowance',
      'One-time payment for equipment'
    ],
    fullDescription: 'The National Scholarship Portal is a one-stop solution for various scholarships provided by the Government of India. It covers students from pre-matric to post-matric levels, including professional and technical courses.',
    criteriaList: [
      'Annual family income below ₹2.5 lakhs',
      'Minimum 50% marks in previous examination',
      'Regular student in a recognized institution',
      'No other scholarship being received',
      'Indian citizen'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Income Certificate',
      'Caste Certificate (if applicable)',
      'Previous year mark sheets',
      'Bank Account Details',
      'Bonafide Certificate from Institution'
    ],
    applicationSteps: [
      'Register on NSP portal with Aadhaar',
      'Complete student profile',
      'Select appropriate scholarship scheme',
      'Fill application form',
      'Upload required documents',
      'Submit to institution for verification',
      'Track application status online'
    ],
    officialLink: 'https://scholarships.gov.in'
  },
  {
    id: '3',
    name: 'Mudra Yojana (Micro Units Development)',
    description: 'Loans up to ₹10 lakhs for small businesses and entrepreneurs without collateral.',
    category: 'Business',
    eligibility: 'partial',
    eligibilitySummary: 'Small business owners & entrepreneurs',
    benefits: [
      'Loans from ₹50,000 to ₹10 lakhs',
      'No collateral required',
      'Low interest rates',
      'Flexible repayment options'
    ],
    fullDescription: 'Pradhan Mantri Mudra Yojana (PMMY) provides loans to non-corporate, non-farm small/micro enterprises. Loans are classified into Shishu (up to ₹50,000), Kishor (₹50,001 to ₹5 lakhs), and Tarun (₹5,00,001 to ₹10 lakhs).',
    criteriaList: [
      'Indian citizen aged 18 years or above',
      'Engaged in income-generating activity',
      'Business should be non-farm sector',
      'Good credit history preferred',
      'Business plan should be viable'
    ],
    requiredDocuments: [
      'Identity Proof (Aadhaar, PAN, Voter ID)',
      'Address Proof',
      'Business Plan',
      'Quotations for equipment/inventory',
      'Bank statements (last 6 months)',
      'Business registration proof (if applicable)'
    ],
    applicationSteps: [
      'Identify your loan category (Shishu/Kishor/Tarun)',
      'Prepare business plan and documents',
      'Visit nearest bank/NBFC/MFI',
      'Fill Mudra loan application form',
      'Submit documents for verification',
      'Attend interview if required',
      'Receive loan after approval'
    ],
    officialLink: 'https://www.mudra.org.in'
  },
  {
    id: '4',
    name: 'Stand Up India Scheme',
    description: 'Bank loans between ₹10 lakhs to ₹1 crore for SC/ST and women entrepreneurs.',
    category: 'Women Empowerment',
    eligibility: 'eligible',
    eligibilitySummary: 'Women & SC/ST entrepreneurs',
    benefits: [
      'Loans from ₹10 lakh to ₹1 crore',
      'For greenfield enterprises',
      '7 years repayment tenure',
      'Handholding support available'
    ],
    fullDescription: 'Stand Up India Scheme facilitates bank loans for setting up greenfield enterprises by SC/ST and/or women entrepreneurs. The scheme aims to leverage the institutional credit structure to reach out to these underserved sectors.',
    criteriaList: [
      'Must be SC/ST and/or Women entrepreneur',
      'Aged 18 years or above',
      'Loan for greenfield project only',
      'First-time business venture',
      'Project should be in manufacturing, services, or trading sector'
    ],
    requiredDocuments: [
      'Identity and Category Proof',
      'Address Proof',
      'PAN Card',
      'Detailed Project Report',
      'Quotations for equipment',
      'Business registration documents'
    ],
    applicationSteps: [
      'Visit Stand Up India portal',
      'Register and create profile',
      'Prepare detailed project report',
      'Apply online through portal',
      'Schedule meeting with bank',
      'Submit documents for verification',
      'Receive loan sanction letter'
    ],
    officialLink: 'https://www.standupmitra.in'
  },
  {
    id: '5',
    name: 'Ayushman Bharat (PMJAY)',
    description: 'Health insurance coverage of ₹5 lakhs per family per year for secondary and tertiary care hospitalization.',
    category: 'Healthcare',
    eligibility: 'not-eligible',
    eligibilitySummary: 'Families listed in SECC database',
    benefits: [
      '₹5 lakh health cover per family',
      'Cashless treatment',
      'Coverage for pre and post hospitalization',
      'No cap on family size or age'
    ],
    fullDescription: 'Pradhan Mantri Jan Arogya Yojana (PMJAY) is the world\'s largest health insurance scheme providing coverage of ₹5 lakh per family per year for secondary and tertiary care hospitalization to over 10.74 crore poor and vulnerable families.',
    criteriaList: [
      'Family listed in SECC-2011 database',
      'Deprivation criteria as per SECC',
      'No specific income limit',
      'Automatically eligible if in beneficiary list',
      'No registration fee required'
    ],
    requiredDocuments: [
      'Aadhaar Card (for all family members)',
      'Ration Card',
      'Mobile Number',
      'Address Proof',
      'Family photograph'
    ],
    applicationSteps: [
      'Check eligibility on PMJAY website',
      'Visit nearest Common Service Centre',
      'Provide Aadhaar and mobile number',
      'Biometric authentication',
      'Receive Ayushman Card',
      'Use card at empaneled hospitals',
      'Avail cashless treatment'
    ],
    officialLink: 'https://pmjay.gov.in'
  },
  {
    id: '6',
    name: 'Skill India Mission (PMKVY)',
    description: 'Free skill development training with monetary rewards and job placement assistance.',
    category: 'Skill Development',
    eligibility: 'eligible',
    eligibilitySummary: 'Youth seeking skill training',
    benefits: [
      'Free skill training',
      'Monetary reward on certification',
      'Job placement assistance',
      'Government-recognized certificate'
    ],
    fullDescription: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY) is the flagship scheme for skill development training. It provides training to youth in industry-relevant skills with placement support.',
    criteriaList: [
      'Indian citizen',
      'School/college dropout or unemployed',
      'Age between 18-35 years (varies by course)',
      'Basic literacy preferred',
      'Willing to undergo skill training'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Educational certificates',
      'Bank Account Details',
      'Passport-size photographs',
      'Address Proof'
    ],
    applicationSteps: [
      'Visit Skill India portal',
      'Search for training centers nearby',
      'Select desired course',
      'Enroll at training center',
      'Complete training hours',
      'Appear for assessment',
      'Receive certificate and placement support'
    ],
    officialLink: 'https://www.pmkvyofficial.org'
  }
];

export const suggestedPrompts = [
  'I am a farmer looking for subsidies',
  'Schemes for students from low-income families',
  'Women business loan support',
  'Healthcare coverage for my family',
  'Skill development programs for youth'
];

// Helper function to filter schemes based on query
export function filterSchemes(query: string): Scheme[] {
  if (!query || query.trim().length === 0) {
    return mockSchemes;
  }

  const lowerQuery = query.toLowerCase();
  
  return mockSchemes.filter(scheme => {
    return (
      scheme.name.toLowerCase().includes(lowerQuery) ||
      scheme.description.toLowerCase().includes(lowerQuery) ||
      scheme.category.toLowerCase().includes(lowerQuery) ||
      scheme.eligibilitySummary.toLowerCase().includes(lowerQuery) ||
      scheme.benefits.some(benefit => benefit.toLowerCase().includes(lowerQuery))
    );
  });
}
