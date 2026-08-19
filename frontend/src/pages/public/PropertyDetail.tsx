// Property detail (§3.3): gallery, facts grid, features, discreet asset reference,
// "Private Enquiry" → /contact?property=<slug>.

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowUpRight } from 'react-icons/fi';
import { LuBedDouble, LuBath, LuLandmark, LuRuler } from 'react-icons/lu';
import { useProperty } from '../../hooks/useProperties';
import { displayPrice, formatSize } from '../../lib/format';
import { Button, Tag } from '../../components/ui/primitives';
import { PropertyImage } from '../../components/cards/Cards';

export function PropertyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: property, isLoading, error } = useProperty(slug);
  const [active, setActive] = useState(0);

  if (isLoading) {
    return <p className="px-5 py-20 text-xs uppercase tracking-[0.2em] text-parchment/50">Loading&#8230;</p>;
  }
  if (error || !property) {
    return (
      <div className="px-5 py-20">
        <p className="text-parchment/70">This listing is not available.</p>
        <Link to="/properties" className="mt-4 inline-block text-xs uppercase tracking-[0.18em] text-brass">
          ← Back to properties
        </Link>
      </div>
    );
  }

  const images = [property.heroImageUrl, ...(property.imageUrls ?? [])].filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex items-center justify-between">
        <Link to="/properties" className="text-xs uppercase tracking-[0.18em] text-brass hover:text-parchment">
          ← Portfolio
        </Link>
        <div className="flex gap-3">
          {property.offMarket && <Tag>Off-Market</Tag>}
          <Tag>{property.status === 'available' ? 'Available' : property.status}</Tag>
        </div>
      </div>

      {/* Gallery */}
      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <PropertyImage
          src={images[active] ?? ''}
          alt={property.title}
          className="aspect-[4/3] md:col-span-2"
        />
        <div className="grid aspect-[4/3] grid-cols-2 gap-3">
          {(images.slice(0, 4) as string[]).map((img, i) => (
            <button key={i} onClick={() => setActive(i)} className="overflow-hidden border border-transparent hover:border-gold/50">
              <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3">
        <div className="md:col-span-2">
          <p className="eyebrow">{property.area ?? property.assetClass}</p>
          <h1 className="display mt-2 text-4xl text-parchment">{property.title}</h1>
          <p className="mt-1 text-parchment/60">{property.location}</p>
          {property.assetReference ? (
            <p className="mt-1 text-xs text-parchment/40">Asset ref · {property.assetReference}</p>
          ) : null}

          <h2 className="display mt-10 text-2xl text-brass">The Asset</h2>
          <p className="editorial mt-4 text-parchment/80">{property.description}</p>

          {property.features?.length ? (
            <>
              <h2 className="display mt-10 text-2xl text-brass">Features</h2>
              <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {property.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-parchment/75">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brass" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>

        {/* Facts + enquiry */}
        <aside className="h-fit border border-parchment/10 bg-emerald-light p-6">
          <p className="font-display text-3xl text-brass">{displayPrice(property)}</p>
          <dl className="mt-6 space-y-4 text-sm">
            <Fact icon={<LuLandmark className="h-4 w-4 text-gold" />} label="Asset class" value={property.assetClass} />
            {property.size ? (
              <Fact icon={<LuRuler className="h-4 w-4 text-gold" />} label="Size" value={formatSize(property.size.value, property.size.unit)} />
            ) : null}
            {property.bedrooms ? (
              <Fact icon={<LuBedDouble className="h-4 w-4 text-gold" />} label="Bedrooms" value={String(property.bedrooms)} />
            ) : null}
            {property.bathrooms ? (
              <Fact icon={<LuBath className="h-4 w-4 text-gold" />} label="Bathrooms" value={String(property.bathrooms)} />
            ) : null}
          </dl>
          <Link to={`/contact?property=${property.slug}`} className="mt-8 block">
            <Button className="w-full">
              Private Enquiry
              <FiArrowUpRight />
            </Button>
          </Link>
          <p className="mt-3 text-center text-[0.6rem] uppercase tracking-[0.18em] text-parchment/40">
            Discretion assured
          </p>
        </aside>
      </div>
    </div>
  );
}

function Fact({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-parchment/10 pb-3">
      <dt className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.18em] text-gold">
        {icon}
        {label}
      </dt>
      <dd className="text-parchment">{value}</dd>
    </div>
  );
}