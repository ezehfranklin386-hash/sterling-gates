// Properties listing with search + filters (docs/08-public-site-spec.md §3.2,
// docs/11-feature-enhancements.md §1). State lives in the URL for shareability.

import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';
import { useProperties } from '../../hooks/useProperties';
import { AREAS, ASSET_CLASSES, PROPERTY_STATUSES } from '../../lib/brand';
import { SectionLabel, DisplayHeading } from '../../components/brand/Brand';
import { PropertyCard } from '../../components/cards/Cards';
import { Button, Input, Select, Toggle } from '../../components/ui/primitives';

export function Properties() {
  const [params, setParams] = useSearchParams();

  const set = (key: string, value?: string | number | boolean) => {
    const next = new URLSearchParams(params);
    if (value === undefined || value === '' || value === false) next.delete(key);
    else next.set(key, String(value));
    setParams(next, { replace: true });
  };

  const query = useMemo(() => {
    const q = params.get('q') ?? undefined;
    const assetClass = params.get('assetClass') ?? undefined;
    const area = params.get('area') ?? undefined;
    const priceMin = params.get('priceMin') ? Number(params.get('priceMin')) : undefined;
    const priceMax = params.get('priceMax') ? Number(params.get('priceMax')) : undefined;
    const status = params.get('status') ?? undefined;
    const offMarket = params.get('offMarket') === '1';
    const page = params.get('page') ? Number(params.get('page')) : undefined;
    const limit = params.get('page') ? 6 : 6; // fixed page size; client simple-pages
    return { q, assetClass, area, priceMin, priceMax, status, offMarket, page, limit };
  }, [params]);

  const { data, isLoading } = useProperties(query);
  const items = data?.items ?? [];

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <SectionLabel>Portfolio</SectionLabel>
      <DisplayHeading className="mt-3">Properties</DisplayHeading>
      <p className="editorial mt-3 max-w-2xl text-parchment/70">
        A discreet selection of residential, commercial and development assets. Off-market
        placements are shown at your express request only.
      </p>

      {/* Filter bar */}
      <div className="mt-10 grid grid-cols-1 gap-4 rounded-lg border border-parchment/10 bg-emerald-light p-5 shadow-lg shadow-emerald-darker/30 sm:grid-cols-2 lg:grid-cols-3">
        <div className="relative">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" />
          <Input
            placeholder="Keyword"
            defaultValue={params.get('q') ?? ''}
            onChange={(e) => set('q', e.target.value || undefined)}
            className="pl-10"
          />
        </div>
        <Select
          value={params.get('assetClass') ?? ''}
          onChange={(e) => set('assetClass', e.target.value)}
        >
          <option value="">All asset classes</option>
          {ASSET_CLASSES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select value={params.get('area') ?? ''} onChange={(e) => set('area', e.target.value)}>
          <option value="">All neighbourhoods</option>
          {AREAS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </Select>
        <Select value={params.get('status') ?? ''} onChange={(e) => set('status', e.target.value)}>
          <option value="">Any status</option>
          {PROPERTY_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
        <div className="flex gap-3">
          <Input
            type="number"
            placeholder="Min price"
            defaultValue={params.get('priceMin') ?? ''}
            onChange={(e) => set('priceMin', e.target.value || undefined)}
          />
          <Input
            type="number"
            placeholder="Max price"
            defaultValue={params.get('priceMax') ?? ''}
            onChange={(e) => set('priceMax', e.target.value || undefined)}
          />
        </div>
        <div className="flex items-center">
          <Toggle
            checked={params.get('offMarket') === '1'}
            onChange={(v) => set('offMarket', v ? 1 : undefined)}
            label="Off-market only"
          />
        </div>
        {params.size > 0 ? (
          <div className="sm:col-span-2 lg:col-span-3">
            <button
              onClick={() => setParams(new URLSearchParams(), { replace: true })}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-brass hover:text-parchment"
            >
              <FiX className="h-4 w-4" />
              Clear filters
            </button>
          </div>
        ) : null}
      </div>

      {/* Results */}
      {isLoading ? (
        <p className="mt-10 text-xs uppercase tracking-[0.2em] text-parchment/50">Loading&#8230;</p>
      ) : items.length === 0 ? (
        <p className="mt-10 text-parchment/60">No properties match the current selection.</p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}

      {data && data.total > items.length ? (
        <div className="mt-10 flex justify-center">
          <Button
            variant="outline"
            onClick={() => set('page', (Number(params.get('page') ?? 0) + 1).toString())}
          >
            Load more
          </Button>
        </div>
      ) : null}
    </div>
  );
}