// Insights list (§3.4): published posts, newest first.

import { useBlogs } from '../../hooks/useBlogs';
import { SectionLabel, DisplayHeading } from '../../components/brand/Brand';
import { BlogCard } from '../../components/cards/Cards';

export function Insights() {
  const { data, isLoading } = useBlogs();
  const items = data?.items ?? [];

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <SectionLabel>Perspective</SectionLabel>
      <DisplayHeading className="mt-3">Insights</DisplayHeading>
      <p className="editorial mt-3 max-w-2xl text-parchment/70">
        Considered commentary on legacy assets and the markets that hold them.
      </p>

      {isLoading ? (
        <p className="mt-10 text-xs uppercase tracking-[0.2em] text-parchment/50">Loading&#8230;</p>
      ) : items.length === 0 ? (
        <p className="mt-10 text-parchment/60">No articles published yet.</p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((b) => (
            <BlogCard key={b.id} blog={b} />
          ))}
        </div>
      )}
    </div>
  );
}