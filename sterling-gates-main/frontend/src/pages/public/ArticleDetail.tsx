// Article detail (§3.5): cover, title, author, date, tags, full body, and a
// "Request the brief" CTA. Body renders the stored (admin-authored, sanitised)
// HTML in the editorial Georgia style.

import { Link, useParams } from 'react-router-dom';
import { FiArrowUpRight } from 'react-icons/fi';
import { useBlog } from '../../hooks/useBlogs';
import { formatDate } from '../../lib/format';
import { Button, Tag } from '../../components/ui/primitives';
import { PropertyImage } from '../../components/cards/Cards';

export function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: blog, isLoading, error } = useBlog(slug);

  if (isLoading) {
    return <p className="px-5 py-20 text-xs uppercase tracking-[0.2em] text-parchment/50">Loading&#8230;</p>;
  }
  if (error || !blog) {
    return (
      <div className="px-5 py-20">
        <p className="text-parchment/70">This article is not available.</p>
        <Link to="/insights" className="mt-4 inline-block text-xs uppercase tracking-[0.18em] text-brass">
          ← All insights
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <Link to="/insights" className="text-xs uppercase tracking-[0.18em] text-brass hover:text-parchment">
        ← All insights
      </Link>

      <header className="mt-6">
        {blog.tags?.length ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {blog.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        ) : null}
        <h1 className="display text-4xl text-parchment md:text-5xl">{blog.title}</h1>
        <div className="mt-4 flex items-center gap-3 text-xs uppercase tracking-[0.15em] text-parchment/50">
          <span>{blog.author}</span>
          <span aria-hidden="true">·</span>
          <span>{formatDate(blog.publishedAt ?? blog.createdAt)}</span>
        </div>
      </header>

      {blog.coverImageUrl ? (
        <div className="mt-8">
          <PropertyImage src={blog.coverImageUrl} alt={blog.title} className="aspect-[16/9]" />
        </div>
      ) : null}

      <div className="prose-article mt-10" dangerouslySetInnerHTML={{ __html: blog.body }} />

      <div className="mt-14 border-t border-parchment/10 pt-8">
        <p className="font-display text-xl text-parchment">Request the brief</p>
        <p className="mt-2 text-sm text-parchment/60">
          This perspective summarises a longer research brief. Request the full brief on a
          discreet basis.
        </p>
        <Link to="/contact" className="mt-5 inline-block">
          <Button>
            Request Access
            <FiArrowUpRight />
          </Button>
        </Link>
      </div>
    </article>
  );
}