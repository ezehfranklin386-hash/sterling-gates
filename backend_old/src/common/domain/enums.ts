/**
 * Shared domain enums. These mirror the frontend types
 * (frontend/src/lib/types.ts) so the JSON contract stays in sync. The status
 * values are lowercase to match the shipped Property interface.
 */
export const ASSET_CLASSES = ['Residential', 'Commercial', 'Development', 'Land'] as const;
export type AssetClass = (typeof ASSET_CLASSES)[number];

export const AREAS = ['Eko Atlantic', 'Ikoyi', 'Victoria Island', 'Lekki Phase 1'] as const;
export type Area = (typeof AREAS)[number];

export const PROPERTY_STATUSES = ['available', 'under-offer', 'sold'] as const;
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

export const ARCHETYPES = ['sovereign', 'family', 'developer', 'other'] as const;
export type Archetype = (typeof ARCHETYPES)[number];