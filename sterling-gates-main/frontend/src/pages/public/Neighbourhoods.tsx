// Neighbourhoods index + detail (§3.8). Index lists the four core markets;
// detail shows editorial copy + published properties in that area.

import { Link, useParams } from 'react-router-dom';
import { FiArrowUpRight } from 'react-icons/fi';
import { NEIGHBOURHOODS, neighbourhoodBySlug } from '../../lib/nbhoods';
import { useProperties } from '../../hooks/useProperties';
import { IMAGES } from '../../lib/images';
import { SectionLabel, DisplayHeading } from '../../components/brand/Brand';
import { PropertyCard } from '../../components/cards/Cards';
import { Reveal } from '../../components/ui/Reveal';
import { Button } from '../../components/ui/primitives';
import { SmartImage } from '../../components/ui/SmartImage';
import { BRAND } from '../../lib/brand';

export function Neighbourhoods() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <SectionLabel>{BRAND.neighbourhoods.eyebrow}</SectionLabel>
      <DisplayHeading className="mt-3">{BRAND.neighbourhoods.title}</DisplayHeading>
      <p className="editorial mt-3 max-w-2xl text-parchment/70">
        Our core markets, each served with local authority and global standards.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        {NEIGHBOURHOODS.map((n, i) => (
          <Reveal key={n.slug} delay={i * 100}>
            <Link
              to={`/neighbourhoods/${n.slug}`}
              className="group relative block overflow-hidden border border-parchment/10 bg-emerald-light transition-colors hover:border-gold/40"
            >
              <div className="aspect-[16/10]">
                <SmartImage
                  src={IMAGES.neighbourhoods[n.slug as keyof typeof IMAGES.neighbourhoods]}
                  alt={n.name}
                  className="h-full w-full"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-emerald via-emerald/40 to-transparent" />
              <div className="relative p-8">
                <p className="eyebrow">{n.name}</p>
                <h3 className="display mt-3 text-2xl text-parchment group-hover:text-brass">
                  {n.tagline}
                </h3>
                <p className="mt-3 text-sm text-parchment/80">{n.intro}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-brass">
                  Explore area
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

export function NeighbourhoodDetail() {
  const { slug } = useParams<{ slug: string }>();
  const nh = neighbourhoodBySlug(slug ?? '');
  const { data } = useProperties({ area: nh?.name, limit: 12 });
  const items = data?.items ?? [];

  if (!nh) {
    return (
      <div className="px-5 py-20 text-parchment/70">
        Neighbourhood not found. <Link to="/neighbourhoods" className="text-brass">← All areas</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <Link to="/neighbourhoods" className="text-xs uppercase tracking-[0.18em] text-brass hover:text-parchment">
        ← All areas
      </Link>

      <div className="mt-8 grid grid-cols-1 items-center gap-10 md:grid-cols-2">
        <div>
          <SectionLabel>{nh.name}</SectionLabel>
          <h1 className="display mt-4 text-4xl text-parchment">{nh.tagline}</h1>
          <p className="editorial mt-4 text-parchment/80">{nh.intro}</p>
          {nh.markets.length ? (
            <ul className="mt-6 flex flex-wrap gap-2">
              {nh.markets.map((m) => (
                <li key={m} className="border border-gold/30 px-3 py-1 text-[0.65rem] uppercase tracking-[0.15em] text-gold">
                  {m}
                </li>
              ))}
            </ul>
          ) : null}
          <Link to="/contact" className="mt-8 inline-block">
            <Button>
              Local expertise
              <FiArrowUpRight />
            </Button>
          </Link>
        </div>
        <Reveal>
          <div className="relative overflow-hidden">
            <SmartImage
              src={IMAGES.neighbourhoods[nh.slug as keyof typeof IMAGES.neighbourhoods]}
              alt={nh.name}
              className="aspect-[4/3]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald/50 to-transparent" />
          </div>
        </Reveal>
      </div>

      <div className="mt-14">
        <h2 className="display text-2xl text-brass">Listings in {nh.name}</h2>
        {items.length === 0 ? (
          <p className="mt-4 text-parchment/60">No published listings in this area yet.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {items.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}