// Neighbourhood editorial content (docs/11-feature-enhancements.md §2). Copy
// written to the Brand Strategy tone — understated, no hype.

export interface Neighbourhood {
  slug: string;
  name: string;
  tagline: string;
  intro: string;
  markets: string[];
}

export const NEIGHBOURHOODS: Neighbourhood[] = [
  {
    slug: 'eko-atlantic',
    name: 'Eko Atlantic',
    tagline: 'New capital, offshore Lagos.',
    intro:
      'A planned new district on the Lagos waterfront — modern towers, secured tenure and a forward-looking governance model. We advise on premium residential and institutional placements as the district matures.',
    markets: ['Eko Boulevard', 'Harbour', 'Marina', 'Commercial core'],
  },
  {
    slug: 'ikoyi',
    name: 'Ikoyi',
    tagline: 'Established prestige, guarded streets.',
    intro:
      'Legacy residential address, low-density and green-lined. Ikoyi remains the reference point for discreet family homes and prime apartments priced on scarcity, not volume.',
    markets: ['Banana Island', 'Parkview', 'Oniru', 'Awolowo Road'],
  },
  {
    slug: 'victoria-island',
    name: 'Victoria Island',
    tagline: 'The commercial and cultural centre.',
    intro:
      'The business heart of Lagos — offices, high-rise apartments and a dense amenities fabric. We source both corporate real estate and high-yield residential in equal measure.',
    markets: ['Adeola Odeku', 'Ahmadu Bello', 'Admiralty', 'Onyankolo'],
  },
  {
    slug: 'lekki-phase-1',
    name: 'Lekki Phase 1',
    tagline: 'Growth corridor, expanding potential.',
    intro:
      'A maturing axis with rising infrastructure and family-scale compounds. We track its appreciation curve closely, buying ahead of the price curve rather than behind it.',
    markets: ['Agungi', 'Jakande', 'Igbo Efon', 'Admiralty Way'],
  },
];

export function neighbourhoodBySlug(slug: string): Neighbourhood | undefined {
  return NEIGHBOURHOODS.find((n) => n.slug === slug);
}