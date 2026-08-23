import { Link } from 'react-router-dom';
import { displayPrice, formatDate, formatSize } from '../../lib/format';
import type { Blog, Property } from '../../lib/types';
import { Tag } from '../ui/primitives';
import { SmartImage } from '../ui/SmartImage';

export function PropertyImage({
  src,
  alt,
  className = '',
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return <SmartImage src={src} alt={alt} className={className} />;
}

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Link
      to={`/properties/${property.slug}`}
      className="group block border border-parchment/10 bg-emerald-light transition-colors hover:border-gold/40"
    >
      <PropertyImage src={property.heroImageUrl} alt={property.title} className="aspect-[4/3]" />
      <div className="p-5">
        <div className="flex items-center justify-between">
          <span className="eyebrow">{property.assetClass}</span>
          {property.offMarket && <Tag>Off-Market</Tag>}
        </div>
        <h3 className="display mt-2 text-xl text-parchment group-hover:text-brass">
          {property.title}
        </h3>
        <p className="mt-1 text-sm text-parchment/60">
          {property.location}
          {property.area ? ` · ${property.area}` : ''}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <p className="font-sans text-sm text-brass">{displayPrice(property)}</p>
          {property.size ? (
            <span className="text-xs text-parchment/50">
              {formatSize(property.size.value, property.size.unit)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export function BlogCard({ blog }: { blog: Blog }) {
  return (
    <Link
      to={`/insights/${blog.slug}`}
      className="group block border border-parchment/10 bg-emerald-light transition-colors hover:border-gold/40"
    >
      <PropertyImage src={blog.coverImageUrl ?? ''} alt={blog.title} className="aspect-[16/9]" />
      <div className="p-5">
        <div className="flex items-center gap-3 text-xs text-parchment/50">
          <span>{formatDate(blog.publishedAt ?? blog.createdAt)}</span>
          {blog.tags?.[0] ? (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-gold">{blog.tags[0]}</span>
            </>
          ) : null}
        </div>
        <h3 className="display mt-2 text-xl text-parchment group-hover:text-brass">{blog.title}</h3>
        <p className="mt-2 text-sm text-parchment/70 line-clamp-3">{blog.excerpt}</p>
        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-brass">{blog.author}</p>
      </div>
    </Link>
  );
}