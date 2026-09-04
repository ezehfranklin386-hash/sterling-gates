// Domain enums extracted from the Nest.js backend
// These match the domain enums used in the original Nest.js application

export const ASSET_CLASSES = ['residential', 'commercial', 'land', 'industrial'] as const;

export const AREAS = [
  'downtown',
  'suburbs',
  'rural',
  'waterfront',
  'mountain',
  'urban',
  'other'
] as const;

export const PROPERTY_STATUSES = ['available', 'pending', 'sold', 'off-market'] as const;

export const ARCHETYPES = [
  'apartment',
  'house',
  'villa',
  'studio',
  'penthouse'
] as const;

// Type helpers
export type AssetClass = typeof ASSET_CLASSES[number];
export type Area = typeof AREAS[number];
export type PropertyStatus = typeof PROPERTY_STATUSES[number];
export type Archetype = typeof ARCHETYPES[number];
