// Curated collections (§3.9). A collection renders published properties that
// match its saved filter via GET /api/properties?<filter>.

import { Link, useParams } from 'react-router-dom';
import { FiArrowUpRight } from 'react-icons/fi';
import { useCurations, useCuration } from '../../hooks/useCurations';
import { useProperties } from '../../hooks/useProperties';
import type { PropertyQuery } from '../../lib/api';
import { IMAGES } from '../../lib/images';
import { SectionLabel, DisplayHeading } from '../../components/brand/Brand';
import { PropertyCard } from '../../components/cards/Cards';
import { Reveal } from '../../components/ui/Reveal';
import { SmartImage } from '../../components/ui/SmartImage';
import type { CurationFilter } from '../../lib/types';

export function Curations() {
  const { data } = useCurations();
  const items = data?.items ?? [];

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <SectionLabel>Curated</SectionLabel>
      <DisplayHeading className="mt-3">Curated Collections</DisplayHeading>
      <p className="editorial mt-3 max-w-2xl text-parchment/70">
        Edited shortlists assembled by our advisors — off-market placements,
        development opportunities and commercial acquisitions.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {items.map((c, i) => (
          <Reveal key={c.id} delay={i * 100}>
            <Link
              to={`/curations/${c.slug}`}
              className="group block overflow-hidden border border-parchment/10 bg-emerald-light transition-colors hover:border-gold/40"
            >
              <div className="aspect-[3/2]">
                <SmartImage
                  src={CURATION_IMAGES[i % CURATION_IMAGES.length]}
                  alt={c.title}
                  className="h-full w-full"
                />
              </div>
              <div className="p-7">
                <h3 className="display text-2xl text-parchment group-hover:text-brass">{c.title}</h3>
                <p className="mt-3 text-sm text-parchment/70">{c.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-brass">
                  View collection
                  <FiArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

const CURATION_IMAGES = [IMAGES.philosophy, IMAGES.services, IMAGES.propertyFallback];

function filterToQuery(f?: CurationFilter): PropertyQuery {
  return {
    assetClass: f?.assetClass,
    area: f?.area,
    status: f?.status,
    offMarket: f?.offMarket,
    featured: f?.featured,
    limit: 24,
  };
}

export function CurationDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: curation, isLoading } = useCuration(slug);
  const query = curation ? filterToQuery(curation.filter) : undefined;
  const { data: props } = useProperties(query);
  const items = props?.items ?? [];

  if (isLoading) {
    return <p className="px-5 py-20 text-xs uppercase tracking-[0.2em] text-parchment/50">Loading&#8230;</p>;
  }
  if (!curation) {
    return (
      <div className="px-5 py-20 text-parchment/70">
        Collection not found. <Link to="/curations" className="text-brass">← All collections</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <Link to="/curations" className="text-xs uppercase tracking-[0.18em] text-brass hover:text-parchment">
        ← All collections
      </Link>
      <div className="mt-8">
        <SectionLabel>Curated</SectionLabel>
        <h1 className="display mt-4 text-4xl text-parchment">{curation.title}</h1>
        <p className="editorial mt-4 max-w-2xl text-parchment/75">{curation.description}</p>
      </div>

      {items.length === 0 ? (
        <p className="mt-12 text-parchment/60">No properties currently match this collection.</p>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}