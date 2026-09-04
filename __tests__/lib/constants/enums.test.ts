import { ASSET_CLASSES, AREAS, PROPERTY_STATUSES, ARCHETYPES } from '@/lib/constants/enums';

describe('domain enums', () => {
  it('exports ASSET_CLASSES', () => {
    expect(Array.isArray(ASSET_CLASSES)).toBe(true);
    expect(ASSET_CLASSES.length).toBeGreaterThan(0);
  });

  it('exports AREAS', () => {
    expect(Array.isArray(AREAS)).toBe(true);
    expect(AREAS.length).toBeGreaterThan(0);
  });

  it('exports PROPERTY_STATUSES', () => {
    expect(Array.isArray(PROPERTY_STATUSES)).toBe(true);
    expect(PROPERTY_STATUSES.length).toBeGreaterThan(0);
  });

  it('exports ARCHETYPES', () => {
    expect(Array.isArray(ARCHETYPES)).toBe(true);
    expect(ARCHETYPES.length).toBeGreaterThan(0);
  });
});
