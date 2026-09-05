// Static brand copy — source of truth pulled from docs/02-brand-guide.md
// (extracted from Sterling_Gates_Brand_Strategy_v2.0) and the prototype.
// Admin-authored marketing pages may change; this brand voice must not.

export const BRAND = {
  name: 'Sterling Gates',
  legal: 'Sterling Gates Consultancy & Realty',
  tagline: 'Delivering Value. Building Legacies.',
  monogramAlt: 'Sterling Gates monogram',
  outlook: 'London · Lagos · Global',

  hero: {
    headline: 'We do not simply trade square footage; we broker the legacy assets that endure.',
    sub: 'An elite property advisory and consultancy firm serving principals, families and developers across the world’s most considered markets.',
    ctaPrimary: 'Initiate Advisory',
    ctaSecondary: 'Our Philosophy',
    meta: ['Founded 2026', 'Markets Global', 'Focus Legacy Assets'],
  },

  philosophy: {
    headline: 'Stewardship over Transactions. Discretion as Currency.',
    pillars: [
      { numeral: 'I', title: 'Absolute Integrity', body: 'Uncompromising transparency in every valuation, recommendation and representation.' },
      { numeral: 'II', title: 'Elite Intelligence', body: 'Analytical sophistication applied to global markets and legacy asset classes.' },
      { numeral: 'III', title: 'Legacy Stewardship', body: 'Active discretion across generations, protecting what endures.' },
    ],
  },

  services: {
    eyebrow: 'Disciplines',
    title: 'Eleven Disciplines of Advisory',
    items: [
      'Investment Advisory',
      'Portfolio Strategy',
      'Development Consultancy',
      'Site Acquisition',
      'Occupier & Tenant Representation',
      'Due Diligence',
      'Market Intelligence',
      'International Sourcing',
      'Project Marketing',
      'Corporate Real Estate Advisory',
      'Wealth Planning Through Property',
    ],
  },

  archetypes: {
    eyebrow: 'Who We Serve',
    title: 'Client Archetypes',
    items: [
      { key: 'sovereign' as const, label: 'Archetype A · Sovereign', tag: 'Institutions & Sovereign Wealth', body: 'Sovereign wealth vehicles, institutions and state-linked capital seeking strategic, discreet global placement.' },
      { key: 'family' as const, label: 'Archetype B · Family', tag: 'Private Wealth & Family Offices', body: 'Operators of multi-generational capital seeking legacy assets and considered succession.' },
      { key: 'developer' as const, label: 'Archetype C · Developer', tag: 'Major Developers', body: 'Developers assembling sites and capital structures, served with disciplined rigour and confidentiality.' },
    ],
  },

  intelligence: {
    eyebrow: 'Intelligence',
    title: 'The Sterling Intelligence Brief',
    body: 'A considered briefing on global legacy-asset markets — issued to a select advisory list. Request access; we vet every request.',
    cta: 'Request Access',
    subscribe: 'Subscribe to the Brief',
  },

  curations: {
    eyebrow: 'Curated',
    title: 'Curated Collections',
    collections: [
      'Off-Market Placements',
      'Development Opportunities',
      'Commercial Acquisitions',
    ],
  },

  neighbourhoods: {
    eyebrow: 'Markets',
    title: 'Neighbourhoods',
    areas: ['Eko Atlantic', 'Ikoyi', 'Victoria Island', 'Lekki Phase 1'],
  },

  contactCta: {
    eyebrow: 'Engage',
    title: 'Begin the conversation.',
    button: 'Contact Sterling Gates',
  },

  locations: {
    lagos: 'Lagos — Eko Atlantic · Ikoyi · Victoria Island',
    london: 'London — Mayfair · Knightsbridge',
    note: 'A global outlook, served with local authority.',
  },

  footer: {
    legal: '© 2026 Sterling Gates Consultancy & Realty. Confidential & Proprietary.',
    nav: ['Properties', 'Insights', 'Neighbourhoods', 'Curations', 'Advisors', 'Contact'],
  },
} as const;

export type ArchetypeOption = {
  key: 'sovereign' | 'family' | 'developer' | 'other';
  label: string;
  description: string;
};

export const ARCHETYPE_OPTIONS: ArchetypeOption[] = [
  { key: 'sovereign', label: 'Sovereign & Institutional', description: 'Sovereign wealth vehicles, institutions and state-linked capital.' },
  { key: 'family', label: 'Private Wealth & Family Office', description: 'Multi-generational capital and legacy assets.' },
  { key: 'developer', label: 'Major Developer', description: 'Developers assembling sites and capital structures.' },
  { key: 'other', label: 'Other / Discreet', description: 'A private consideration best discussed directly.' },
];

export const CONTACT_EMAIL = 'enquiries@sterlinggates.ng';

export const ASSET_CLASSES = ['Residential', 'Commercial', 'Development', 'Land'] as const;

export const PROPERTY_STATUSES = [
  { value: 'available', label: 'Available' },
  { value: 'under-offer', label: 'Under Offer' },
  { value: 'sold', label: 'Sold' },
] as const;

export const AREAS = ['Eko Atlantic', 'Ikoyi', 'Victoria Island', 'Lekki Phase 1'] as const;